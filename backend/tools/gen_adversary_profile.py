import gzip
import json

from mitreattack.stix20 import MitreAttackData


# Helper: Convert STIX objects (including nested) to plain dicts
def stix_to_dict(obj):
    if hasattr(obj, "serialize"):
        return json.loads(obj.serialize())
    elif isinstance(obj, list):
        return [stix_to_dict(item) for item in obj]
    elif isinstance(obj, dict):
        return {key: stix_to_dict(value) for key, value in obj.items()}
    else:
        return obj  # Leave primitive values untouched


# Load STIX data
mitre_attack_data = MitreAttackData("/workspaces/backend/enterprise-attack.json")

# Group profiles container
group_profiles = []

for group in mitre_attack_data.get_groups():
    profile = {
        "id": group["id"],
        "name": group["name"],
        "description": group.get("description", ""),
        "aliases": group.get("aliases", []),
        "external_references": stix_to_dict(group.get("external_references", [])),
        "techniques": [],
        "software": [],
    }

    # Techniques
    techniques = mitre_attack_data.get_techniques_used_by_group(group["id"])
    for tech in techniques:
        profile["techniques"].append(
            {
                "technique": stix_to_dict(tech["object"]),
                "relationships": [
                    stix_to_dict(r) for r in tech.get("relationships", [])
                ],
            }
        )

    # Software
    software = mitre_attack_data.get_software_used_by_group(group["id"])
    for sw in software:
        profile["software"].append(
            {
                "software": stix_to_dict(sw["object"]),
                "relationships": [stix_to_dict(r) for r in sw.get("relationships", [])],
            }
        )

    group_profiles.append(profile)

# Write JSON to file
output_path = "/workspaces/backend/artifacts/group_profiles.json.gz"
with gzip.open(output_path, "wt", encoding="utf-8") as f:
    json.dump(group_profiles, f, indent=2)

print(f"✅ Saved {len(group_profiles)} group profiles to {output_path}")
