import tarfile
from collections import defaultdict
from datetime import datetime, timedelta
from pathlib import Path

import orjson


def parse_log_timestamps(log_file):
    timestamps = []
    errors = 0
    for line in log_file:
        try:
            log_data = orjson.loads(line)
            timestamp_str = log_data["@timestamp"]
            timestamps.append(datetime.fromisoformat(timestamp_str))
        except Exception:
            errors += 1
    return timestamps, errors


def process_log_archive(path: Path) -> dict:
    with tarfile.open(path, "r:gz") as tar:
        first_member = tar.getmembers()[0]
        if not first_member.isfile():
            raise ValueError(f"Archive member is not a file: {first_member.name}")

        with tar.extractfile(first_member) as file_obj:
            timestamps, error_count = parse_log_timestamps(file_obj)

    if timestamps:
        sorted_timestamps = sorted(timestamps)
        first_time = sorted_timestamps[0]
        last_time = sorted_timestamps[-1]
        duration = str(last_time - first_time)
        count = len(sorted_timestamps)
    else:
        first_time = last_time = 0
        duration = ""
        count = 0

    return {
        "min": first_time,
        "max": last_time,
        "count": count,
        "distance": duration,
        "error_count": error_count,
    }


def main():
    main_path = Path("/workspaces/backend/artifacts/logs/benign_packetbeat")
    metadata = {}

    for path in main_path.rglob("*.json.tar.gz"):
        print(f"Processing: {path.name}")
        metadata[path.name] = process_log_archive(path)

    metadata_output_path = main_path / "metadata.json"
    with open(metadata_output_path, "wb") as f:
        f.write(orjson.dumps(metadata, option=orjson.OPT_INDENT_2))


if __name__ == "__main__":
    main()
