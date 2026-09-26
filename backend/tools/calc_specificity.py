# requires: mitreattack-python package

import json
from collections import defaultdict
from typing import Dict, List, TypeAlias, TypedDict

from mitreattack.stix20 import MitreAttackData

Adversary: TypeAlias = str
Technique: TypeAlias = str
TTP: TypeAlias = str
SpecificityScore: TypeAlias = float
Count: TypeAlias = int

TacticInfo = TypedDict(
    "TacticInfo",
    {
        "x_mitre_shortname": str,
        "name": str,
        "id": str,
    },
)

TechniqueInfo = TypedDict(
    "TechniqueInfo",
    {
        "name": str,
        "id": str,
    },
)

GroupWithTechniques = TypedDict(
    "GroupWithTechniques",
    {
        "name": str,
        "techniques": List[TTP],
    },
)

MITRE_FILE = "/workspaces/backend/enterprise-attack.json"
DOMAIN = "enterprise-attack"


MATRIX = "Enterprise ATT&CK"

mitre_data = MitreAttackData(MITRE_FILE)


def get_tactics() -> List[TacticInfo]:
    return [
        {
            "x_mitre_shortname": t["x_mitre_shortname"],
            "name": t["name"],
            "id": t["external_references"][0]["external_id"],
        }
        for t in mitre_data.get_tactics_by_matrix()[MATRIX]
    ]


def get_techniques(shortname: str) -> List[TechniqueInfo]:
    raw = mitre_data.get_techniques_by_tactic(
        tactic_shortname=shortname,
        domain=DOMAIN,
        remove_revoked_deprecated=True,
    )
    return [
        {"name": tech.name, "id": tech.external_references[0].external_id}
        for tech in raw
    ]


def get_adversaries() -> List[Adversary]:
    return [
        g.name
        for g in mitre_data.get_groups()
        #   if g.name.startswith("APT") # commented to list all
    ]


def remove_sub_techniques(techniques: List[TTP]) -> List[TTP]:
    return list({t.split(".")[0] for t in techniques})


def get_group_techniques(group_id: str) -> List[TTP]:
    return [
        ref.external_id
        for tech in mitre_data.get_techniques_used_by_group(group_id)
        for ref in tech["object"].external_references
        if ref.source_name == "mitre-attack"
    ]


tactics = get_tactics()
techniques_by_tactic = {
    tac["id"]: remove_sub_techniques(
        [tech["id"] for tech in get_techniques(tac["x_mitre_shortname"])]
    )
    for tac in tactics
}
adversaries = get_adversaries()
all_ttp_ids: Dict[TTP, SpecificityScore] = {
    f"{tac}/{tid}": 0.0 for tac, tids in techniques_by_tactic.items() for tid in tids
}
specificity: Dict[Adversary, Dict[TTP, SpecificityScore]] = {
    adv: all_ttp_ids.copy() for adv in adversaries
}
groups_with_techniques: Dict[Adversary, List[Technique]] = {
    g.name: remove_sub_techniques(get_group_techniques(g.id))
    for g in mitre_data.get_groups()
    # if g.name.startswith("APT") # commented to list all
}
techniques_with_groups: Dict[Technique, List[Adversary]] = defaultdict(list)
for group, techs in groups_with_techniques.items():
    for tech in techs:
        techniques_with_groups[tech].append(group)
techniques_with_groups = dict(techniques_with_groups)

incidence_matrix: Dict[Technique, Count] = {
    tech: len(grps) for tech, grps in techniques_with_groups.items()
}
specificity_technique_level: Dict[Adversary, Dict[Technique, SpecificityScore]] = {
    adv: {tech: 1.0 / incidence_matrix[tech] for tech in groups_with_techniques[adv]}
    for adv in adversaries
}

for adv, t_scores in specificity_technique_level.items():
    for tech, score in t_scores.items():
        for ttp in specificity[adv]:
            if ttp.endswith(tech):
                specificity[adv][ttp] += score

if __name__ == "__main__":
    with open("specificity.json", "w") as f:
        json.dump(specificity, f, indent=4)
