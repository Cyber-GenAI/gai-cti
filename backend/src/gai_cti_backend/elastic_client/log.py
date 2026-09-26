import asyncio
import concurrent.futures
import io
import logging
import tarfile
from pathlib import Path
from typing import Any, AsyncIterable, BinaryIO, Callable, Dict, List, Optional, Tuple

import aiofiles
import orjson
from elasticsearch8 import AsyncElasticsearch
from elasticsearch8.helpers import async_bulk
from fastapi import HTTPException, status

from ..models.management import LogInfo
from .log_post_processes import process_log
from .utils import get_es
from .utils import injected_iocs_tracker as ioc_tracker


def read_and_process_tar_from_path(
    path,
) -> Tuple[List[Dict[str, Any]], str, Optional[str]]:
    try:
        logs = []
        with tarfile.open(path, "r:gz") as tar:
            member = tar.getmember(path.name.replace(".tar.gz", ""))
            index_name = member.name.split("/")[-1].split(".")[0]
            if f := tar.extractfile(member):
                for log in f.readlines():
                    logs.append(orjson.loads(log))
            else:
                raise ValueError("File not found in tar archive")
    except Exception as e:
        return [], "", str(e)

    return logs, index_name, None


def read_and_process_tar_from_byte_io(
    file: BinaryIO,
) -> Tuple[List[Dict[str, Any]], str, Optional[str]]:
    try:
        logs = []
        with tarfile.open(fileobj=file) as tar:
            member = tar.getmembers()[0]
            if f := tar.extractfile(member):
                for log in f.readlines():
                    logs.append(orjson.loads(log))
            else:
                raise ValueError("File not found in tar archive")
    except Exception as e:
        return [], "", str(e)

    return logs, "", None


async def gen_data(
    log_info: LogInfo,
    read_and_process: Callable,
    path: Optional[Path] = None,
    file: Optional[BinaryIO] = None,
) -> AsyncIterable[Dict[str, Any]]:
    input_func = path or file
    loop = asyncio.get_running_loop()
    with concurrent.futures.ThreadPoolExecutor() as pool:
        result, index_name_from_file_name, err_msg = await loop.run_in_executor(
            pool, read_and_process, input_func
        )

    if err_msg:
        print(f"Error processing {path}: {err_msg}")
        raise ValueError(f"Error processing {path}: {err_msg}")

    for log in result:
        yield {
            "_index": (
                index_name_from_file_name
                if log_info.index_name == "from_file_name"
                else log_info.index_name
            ),
            "_source": await process_log(
                log=log,
                post_process=log_info.post_process,
                log_info=log_info,
                index_name_from_file_name=index_name_from_file_name,
            ),
        }


async def create_indices(es: AsyncElasticsearch, paths: List[Path]) -> None:
    names = [p.as_posix().split("/")[-1].split(".")[0] for p in paths]
    coroutines = [es.indices.create(index=name) for name in names]
    try:
        await asyncio.gather(*coroutines)
    except Exception as e:
        print(f"Creating indices not complete. Error: \n\t{e}")
        print("Going next step...")


async def custom_bulk(
    es: AsyncElasticsearch,
    path: Path,
    sem: asyncio.Semaphore,
    log_info: LogInfo,
):
    async with sem:
        try:
            await async_bulk(
                client=es,
                actions=gen_data(
                    log_info=log_info,
                    read_and_process=read_and_process_tar_from_path,
                    path=path,
                ),
                chunk_size=5000,
                timeout="120s",
                max_retries=2,
                initial_backoff=10,
                max_chunk_bytes=1024 * 1024 * 100,
            )
        except Exception as e:
            print(f"Error injecting data {path} into elasticsearch: {e}")


async def ship_json_logs2es(log_info: LogInfo) -> None:
    if ("inject_malicious_ioc" in log_info.post_process) or (
        "inject_adversary_ioc" in log_info.post_process
    ):
        ioc_tracker.clear_collected_ioc_data()

    es = get_es()
    # larger numbers could result in connection timeouts
    paths = Path(log_info.dir).rglob("*.json.tar.gz")
    sem = asyncio.Semaphore(2)
    coroutines = [custom_bulk(es, path, sem, log_info) for path in paths]
    await asyncio.gather(*coroutines)
    await es.close()

    if ("inject_malicious_ioc" in log_info.post_process) or (
        "inject_adversary_ioc" in log_info.post_process
    ):
        await ioc_tracker.sync_with_redis(log_info.index_pattern)


async def ship_user_uploaded_logs2es(log_info: LogInfo, file: BinaryIO) -> None:
    es = get_es()
    try:
        await async_bulk(
            client=es,
            actions=gen_data(
                log_info=log_info,
                read_and_process=read_and_process_tar_from_byte_io,
                file=file,
            ),
            chunk_size=5000,
            timeout="120s",
            max_retries=2,
            initial_backoff=10,
            max_chunk_bytes=1024 * 1024 * 100,
        )
    except Exception as e:
        print(
            f"Error injecting data {log_info.index_name} (user_uploaded) into elasticsearch: {e}"
        )


async def check_targz_file_validity_and_copy_to_artifacts(log_file_path: Path):
    # Check if the file has the correct extension
    if not str(log_file_path).lower().endswith(".json.tar.gz"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only .tar.gz files are allowed for manual injection",
        )

    # Check if the file can be parsed with tarfile python module
    try:
        with tarfile.open(log_file_path, "r:gz") as tar:
            if not tar.getnames():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="The provided .tar.gz file is empty or invalid",
                )

        # If the file is valid, copy the file in the artifacts/logs/manual directory
        manual_logs_dir = Path("artifacts/logs/manual")
        destination_path = manual_logs_dir / log_file_path.name
        async with aiofiles.open(log_file_path, mode="rb") as src_file:
            async with aiofiles.open(destination_path, mode="wb") as dest_file:
                while True:
                    chunk = await src_file.read(1024 * 1024)
                    if not chunk:
                        break
                    await dest_file.write(chunk)

        return destination_path

    except tarfile.TarError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error reading .tar.gz file: {str(e)}",
        )


async def get_log_info_for_llm(index_pattern: str, log_id: str) -> Dict[str, str]:
    es = get_es()

    response = await es.search(
        index=index_pattern, body={"query": {"match": {"_id": log_id}}}
    )
    hits = response["hits"]["hits"]
    if not hits:
        raise KeyError(f"Log with ID '{log_id}' not found in {index_pattern}")

    log_source = hits[0]["_source"]
    await es.close()
    logs_text = str(log_source)

    return {"logs_text": logs_text}
