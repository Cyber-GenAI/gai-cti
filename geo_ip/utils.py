import csv
import ipaddress
from ipaddress import AddressValueError
from ipaddress import IPv4Address
from typing import List
from bisect import bisect
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent
CSV_PATH = ROOT_DIR / "IP2LOCATION-LITE-DB5.CSV"


def decimal_ip_to_integer(ip: IPv4Address) -> int:
    try:
        return int(ipaddress.IPv4Address(ip))
    except AddressValueError:
        return None


def load_data():
    with open(CSV_PATH, newline="") as file:
        reader = csv.reader(file)
        data = [row for row in reader]
    return data


def find_ip_index(ip_ranges: List, ip_number: int) -> List:
    index = bisect(ip_ranges, ip_number, key=lambda x: int(x[0]))
    return index - 1