import asyncio
import itertools
import json
import re
import uuid
from pathlib import Path
from typing import List

import yaml
from sigma.backends.elasticsearch.elasticsearch_lucene import LuceneBackend
from sigma.collection import SigmaCollection
from sigma.pipelines.elasticsearch import ecs_windows

from .miscellaneous import get_valid_path

TECHNIQUE_PATTERN = re.compile(r"^attack\.t[0-9]{4}$")
SUBTECHNIQUE_PATTERN = re.compile(r"^attack\.t[0-9]{4}\.[0-9]{3}$")

pipeline = ecs_windows()
backend = LuceneBackend(processing_pipeline=pipeline)

TACTICS = {
    "reconnaissance": "TA0043",
    "resource-development": "TA0042",
    "initial-access": "TA0001",
    "execution": "TA0002",
    "persistence": "TA0003",
    "privilege-escalation": "TA0004",
    "defense-evasion": "TA0005",
    "credential-access": "TA0006",
    "discovery": "TA0007",
    "lateral-movement": "TA0008",
    "collection": "TA0009",
    "command-and-control": "TA0011",
    "exfiltration": "TA0010",
    "impact": "TA0040",
}

with open(get_valid_path("artifacts/techniques.json"), "r") as f:
    TECHNIQUES = json.load(f)

TACTIC_TECHNIQUES = {
    "TA0043/T1592",
    "TA0043/T1594",
    "TA0043/T1589",
    "TA0043/T1596",
    "TA0043/T1595",
    "TA0043/T1591",
    "TA0043/T1590",
    "TA0043/T1593",
    "TA0043/T1597",
    "TA0043/T1598",
    "TA0042/T1583",
    "TA0042/T1584",
    "TA0042/T1586",
    "TA0042/T1608",
    "TA0042/T1585",
    "TA0042/T1588",
    "TA0042/T1650",
    "TA0042/T1587",
    "TA0001/T1133",
    "TA0001/T1091",
    "TA0001/T1195",
    "TA0001/T1190",
    "TA0001/T1659",
    "TA0001/T1199",
    "TA0001/T1566",
    "TA0001/T1078",
    "TA0001/T1200",
    "TA0001/T1189",
    "TA0001/T1669",
    "TA0002/T1047",
    "TA0002/T1129",
    "TA0002/T1675",
    "TA0002/T1053",
    "TA0002/T1106",
    "TA0002/T1610",
    "TA0002/T1674",
    "TA0002/T1059",
    "TA0002/T1609",
    "TA0002/T1204",
    "TA0002/T1072",
    "TA0002/T1559",
    "TA0002/T1203",
    "TA0002/T1569",
    "TA0002/T1651",
    "TA0002/T1648",
    "TA0003/T1037",
    "TA0003/T1543",
    "TA0003/T1133",
    "TA0003/T1547",
    "TA0003/T1137",
    "TA0003/T1053",
    "TA0003/T1176",
    "TA0003/T1205",
    "TA0003/T1525",
    "TA0003/T1112",
    "TA0003/T1542",
    "TA0003/T1554",
    "TA0003/T1098",
    "TA0003/T1574",
    "TA0003/T1078",
    "TA0003/T1546",
    "TA0003/T1671",
    "TA0003/T1197",
    "TA0003/T1505",
    "TA0003/T1668",
    "TA0003/T1136",
    "TA0003/T1653",
    "TA0003/T1556",
    "TA0004/T1037",
    "TA0004/T1543",
    "TA0004/T1547",
    "TA0004/T1053",
    "TA0004/T1055",
    "TA0004/T1611",
    "TA0004/T1548",
    "TA0004/T1098",
    "TA0004/T1574",
    "TA0004/T1078",
    "TA0004/T1068",
    "TA0004/T1546",
    "TA0004/T1134",
    "TA0004/T1484",
    "TA0005/T1006",
    "TA0005/T1666",
    "TA0005/T1014",
    "TA0005/T1578",
    "TA0005/T1600",
    "TA0005/T1564",
    "TA0005/T1202",
    "TA0005/T1140",
    "TA0005/T1562",
    "TA0005/T1036",
    "TA0005/T1055",
    "TA0005/T1205",
    "TA0005/T1218",
    "TA0005/T1620",
    "TA0005/T1550",
    "TA0005/T1207",
    "TA0005/T1610",
    "TA0005/T1112",
    "TA0005/T1535",
    "TA0005/T1222",
    "TA0005/T1548",
    "TA0005/T1070",
    "TA0005/T1647",
    "TA0005/T1542",
    "TA0005/T1612",
    "TA0005/T1497",
    "TA0005/T1480",
    "TA0005/T1601",
    "TA0005/T1574",
    "TA0005/T1078",
    "TA0005/T1027",
    "TA0005/T1599",
    "TA0005/T1553",
    "TA0005/T1197",
    "TA0005/T1656",
    "TA0005/T1221",
    "TA0005/T1134",
    "TA0005/T1672",
    "TA0005/T1622",
    "TA0005/T1484",
    "TA0005/T1220",
    "TA0005/T1556",
    "TA0005/T1216",
    "TA0005/T1211",
    "TA0005/T1127",
    "TA0006/T1557",
    "TA0006/T1003",
    "TA0006/T1539",
    "TA0006/T1040",
    "TA0006/T1558",
    "TA0006/T1555",
    "TA0006/T1552",
    "TA0006/T1649",
    "TA0006/T1528",
    "TA0006/T1606",
    "TA0006/T1621",
    "TA0006/T1212",
    "TA0006/T1110",
    "TA0006/T1187",
    "TA0006/T1056",
    "TA0006/T1111",
    "TA0006/T1556",
    "TA0007/T1033",
    "TA0007/T1613",
    "TA0007/T1069",
    "TA0007/T1615",
    "TA0007/T1652",
    "TA0007/T1007",
    "TA0007/T1040",
    "TA0007/T1135",
    "TA0007/T1120",
    "TA0007/T1082",
    "TA0007/T1010",
    "TA0007/T1580",
    "TA0007/T1217",
    "TA0007/T1673",
    "TA0007/T1016",
    "TA0007/T1087",
    "TA0007/T1482",
    "TA0007/T1083",
    "TA0007/T1049",
    "TA0007/T1497",
    "TA0007/T1619",
    "TA0007/T1654",
    "TA0007/T1057",
    "TA0007/T1201",
    "TA0007/T1012",
    "TA0007/T1614",
    "TA0007/T1526",
    "TA0007/T1018",
    "TA0007/T1046",
    "TA0007/T1518",
    "TA0007/T1538",
    "TA0007/T1622",
    "TA0007/T1124",
    "TA0008/T1080",
    "TA0008/T1091",
    "TA0008/T1550",
    "TA0008/T1021",
    "TA0008/T1563",
    "TA0008/T1072",
    "TA0008/T1210",
    "TA0008/T1534",
    "TA0008/T1570",
    "TA0009/T1113",
    "TA0009/T1557",
    "TA0009/T1602",
    "TA0009/T1123",
    "TA0009/T1114",
    "TA0009/T1025",
    "TA0009/T1119",
    "TA0009/T1115",
    "TA0009/T1530",
    "TA0009/T1005",
    "TA0009/T1560",
    "TA0009/T1185",
    "TA0009/T1125",
    "TA0009/T1074",
    "TA0009/T1039",
    "TA0009/T1056",
    "TA0009/T1213",
    "TA0011/T1071",
    "TA0011/T1219",
    "TA0011/T1659",
    "TA0011/T1205",
    "TA0011/T1572",
    "TA0011/T1092",
    "TA0011/T1090",
    "TA0011/T1568",
    "TA0011/T1102",
    "TA0011/T1104",
    "TA0011/T1001",
    "TA0011/T1571",
    "TA0011/T1573",
    "TA0011/T1095",
    "TA0011/T1132",
    "TA0011/T1105",
    "TA0011/T1665",
    "TA0011/T1008",
    "TA0010/T1567",
    "TA0010/T1029",
    "TA0010/T1011",
    "TA0010/T1020",
    "TA0010/T1041",
    "TA0010/T1048",
    "TA0010/T1030",
    "TA0010/T1537",
    "TA0010/T1052",
    "TA0040/T1561",
    "TA0040/T1489",
    "TA0040/T1491",
    "TA0040/T1657",
    "TA0040/T1565",
    "TA0040/T1531",
    "TA0040/T1486",
    "TA0040/T1667",
    "TA0040/T1499",
    "TA0040/T1496",
    "TA0040/T1485",
    "TA0040/T1498",
    "TA0040/T1495",
    "TA0040/T1490",
    "TA0040/T1529",
}

rule_structure_ndjson = {
    "id": "",
    "name": "",
    "tags": [],
    "interval": "5m",
    "enabled": True,
    "revision": 0,
    "description": "",
    "risk_score": 21,
    "severity": "low",
    "author": ["GAI_CTI"],
    "false_positives": [],
    "from": "now-360s",
    "rule_id": "",
    "max_signals": 100,
    "threat": [],
    "to": "now",
    "references": [],
    "version": 1,
    "immutable": False,
    "rule_source": {"type": "internal"},
    "setup": "",
    "type": "query",
    "language": "lucene",
    "index": [
        "apm-*-transaction*",
        "auditbeat-*",
        "endgame-*",
        "filebeat-*",
        "logs-*",
        "packetbeat-*",
        "traces-apm*",
        "winlogbeat-*",
        "-*elastic-cloud-logs-*",
        "mordor*",
        "*packetbeat*",
        "log*",
    ],
    "query": "",
}

reversed_tactics_techniques = {v: k for k, v in TACTICS.items()}

rule_importance_levels = {"low": 20, "medium": 50, "high": 80, "critical": 100}


async def get_lucene(rule: SigmaCollection) -> str:
    converted_rules = backend.convert(rule)
    assert len(converted_rules) == 1
    return converted_rules[0]


async def get_rule(rule_yaml_content: str) -> SigmaCollection:
    return SigmaCollection.from_yaml(rule_yaml_content)


def is_valid_pair(tactic, technique):
    pair = f"{TACTICS[tactic]}/{technique}"
    if pair in TACTIC_TECHNIQUES:
        return f"{tactic}/{technique}"
    return False


def gen_remaining_pairs(unused_techniques):
    unused_pairs = []
    for technique in unused_techniques:
        for pair in TACTIC_TECHNIQUES:
            if pair.split("/")[1] == technique:
                unused_pairs.append(
                    f"{reversed_tactics_techniques[pair.split("/")[0]]}/{technique}"
                )
    return unused_pairs


def gen_pairs(tags):
    valid_pairs = []
    valid_tags = [tag for tag in tags if tag.startswith("attack.")]
    tactics = set(
        [tag.split(".")[1] for tag in valid_tags if tag.split(".")[1] in TACTICS]
    )
    techniques = set(
        [
            tag.split(".")[1].upper()
            for tag in valid_tags
            if re.match(TECHNIQUE_PATTERN, tag)
        ]
    )
    techniques.update(
        [
            tag.split(".")[1].upper()
            for tag in valid_tags
            if re.match(SUBTECHNIQUE_PATTERN, tag)
        ]
    )

    if tactics and techniques:
        all_pairs = itertools.product(tactics, techniques)
        for tactic, technique in all_pairs:
            if pair := is_valid_pair(tactic, technique):
                valid_pairs.append(pair)

    all_used_techniques = set(pair.split("/")[1] for pair in valid_pairs)
    unused_techniques = techniques - all_used_techniques

    unused_pairs = gen_remaining_pairs(unused_techniques)

    valid_pairs.extend(unused_pairs)

    return valid_pairs


def group_pairs_by_tactic(pairs):
    tactic_dict = {}
    for pair in pairs:
        tactic, technique = pair.split("/")
        if tactic not in tactic_dict:
            tactic_dict[tactic] = []
        tactic_dict[tactic].append(technique)
    return tactic_dict


async def get_rule_in_ndjson_format(rule_content_raw: str) -> str:
    rule = await get_rule(rule_content_raw)
    lucene_rule = await get_lucene(rule)

    rule_content = yaml.safe_load(rule_content_raw)

    rule_data = rule_structure_ndjson.copy()

    rule_data["description"] = rule_content["description"]
    rule_data["name"] = (
        rule_content["title"] if rule_content["title"] else rule_content["name"]
    )
    rule_data["references"] = rule_content.get("references", [])
    rule_data["query"] = lucene_rule
    rule_data["enabled"] = True
    rule_data["risk_score"] = rule_importance_levels.get(rule_content["level"], 20)
    rule_data["severity"] = rule_content["level"]
    rule_data["false_positives"] = rule_content.get("falsepositives", [])
    rule_data["tags"] = rule_content["tags"].copy()  # Copy to avoid modifying original
    rule_data["id"] = str(uuid.uuid4())
    rule_data["rule_id"] = str(uuid.uuid4())
    rule_type = "Type: GAI_CTI_MANUAL"
    rule_data["tags"].append(rule_type)

    ttp_data = rule_data["tags"]
    pairs = gen_pairs(ttp_data)
    groups = group_pairs_by_tactic(pairs)

    threats = []
    for tactic in groups:
        threat = {
            "framework": "MITRE ATT&CK",
            "tactic": {
                "id": TACTICS[tactic],
                "name": tactic.replace("-", " ").title(),
                "reference": f"https://attack.mitre.org/tactics/{TACTICS[tactic]}/",
            },
            "technique": [],
        }
        for tech in groups[tactic]:
            technique = {
                "id": tech,
                "name": TECHNIQUES.get(tech, "Unkown Technique"),
                "reference": f"https://attack.mitre.org/techniques/{tech}/",
                "subtechnique": [],
            }
            threat["technique"].append(technique)
        threats.append(threat)

    rule_data["threat"] = threats
    return json.dumps(rule_data, indent=2)


async def process_single_rule(rule_yaml_content: str) -> None:
    try:
        ndjson_rule = await get_rule_in_ndjson_format(rule_yaml_content)
        return ndjson_rule

    except Exception as e:
        print(f"Error processing rule: {e}")
