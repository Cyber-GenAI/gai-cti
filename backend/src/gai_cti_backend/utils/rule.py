from logging import getLogger
from pathlib import Path
from typing import List

from fastapi import HTTPException, status

logger = getLogger(__name__)


async def get_rules_path_list(rule_tag: str) -> List[Path]:
    if rule_tag == "Type: GAI_CTI_TI":
        rules_list = [p for p in Path("../artifacts/rules/ti").iterdir() if p.is_file()]
    elif rule_tag == "Type: GAI_CTI_APT5":
        rules_list = [
            p for p in Path("../artifacts/rules/apt5").iterdir() if p.is_file()
        ]
    elif rule_tag == "Type: GAI_CTI_SIGMA_WINDOWS":
        rules_list = [
            p for p in Path("../artifacts/rules/sigma/windows").iterdir() if p.is_file()
        ]
    elif rule_tag == "Type: GAI_CTI_SIGMA_LINUX":
        rules_list = [
            p for p in Path("../artifacts/rules/sigma/linux").iterdir() if p.is_file()
        ]
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No rules found for source: {rule_tag}",
        )
    return rules_list
