from typing import Dict, List

from httpx import AsyncClient

from ..conf import geo_ip_url
from ..models.utils import LocOfIP


async def get_location_of_ips(ips: List[str]) -> List[Dict[str, LocOfIP]]:
    async with AsyncClient(verify=False) as client:
        body = {
            "ips": ips,
        }

        response = await client.request("GET", geo_ip_url, json=body)
        response.raise_for_status()
        data: List = response.json()["data"]

    x = lambda x: list(x.items())[0][1]["state"]  # extraction based on state
    data.sort(key=x)
    for item in data:
        key = next(iter(item.keys()))
        value = item[key]
        item[key] = LocOfIP(
            country=value["country"],
            state=value["state"],
            city=value["city"],
            lat=float(value["lat"]),
            long=float(value["long"]),
        )
    return data


async def get_location_of_ip(ip: str) -> LocOfIP:
    return (await get_location_of_ips([ip]))[0][ip]
