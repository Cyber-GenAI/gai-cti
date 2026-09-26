import asyncio

from ..elastic_client.rule import get_all_rules
from .celery_worker import celery_task


@celery_task()
def update_raw_rules():
    asyncio.run(get_all_rules(renew_cache=True))
