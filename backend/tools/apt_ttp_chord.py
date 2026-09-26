import json

# matrix.json is result of tools/extract_data_from_mitre_for_front/main.py
with open("matrix.json", "r") as f:
    data = json.load(f)

groups = data["groups_with_techniques"]

chordDiagramKeys = sorted(item["name"] for item in groups)

group_to_techniques = {g["name"]: set(g["techniques"]) for g in groups}

chordDiagramData = [
    [len(group_to_techniques[g1] & group_to_techniques[g2]) for g2 in chordDiagramKeys]
    for g1 in chordDiagramKeys
]

print("chordDiagramKeys = ", json.dumps(chordDiagramKeys))
print("chordDiagramData = ", json.dumps(chordDiagramData))
