import asyncio

from src.gai_cti_backend.utils.adversary import (  # move this file one dir back in order to work.
    create_used_ttps_for_each_adversary_metadata_file,
)

asyncio.run(create_used_ttps_for_each_adversary_metadata_file())
# result artifacts/mostly_used_ttps.json
