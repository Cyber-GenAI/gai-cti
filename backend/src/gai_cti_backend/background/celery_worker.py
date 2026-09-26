from typing import Any, Callable, TypeVar, cast

from celery import Celery, Task
from celery.utils.dispatch import Signal

from ..conf import celery_info

F = TypeVar("F", bound=Callable[..., Any])


def celery_task(*args, **kwargs) -> Callable[[Callable[..., Any]], Task]:
    def wrapper(func: Callable[..., Any]) -> Task:
        return cast(Task, celery_app.task(*args, **kwargs)(func))

    return wrapper


def celery_revoke_task(
    id: str, terminate: bool = True, signal: str = "SIGKILL"
) -> None:
    celery_app.control.revoke(id, terminate=terminate, signal=signal)


celery_app = Celery(
    main="worker",
    broker_url=celery_info["broker_url"],
    result_backend=celery_info["result_backend"],
)

celery_app.conf.update(
    task_track_started=True,
    task_time_limit=300,
    timezone="UTC",
    enable_utc=True,
    beat_scheduler="celery.beat:PersistentScheduler",
    beat_schedule_filename="celerybeat-schedule",
    # Prevents asyncio event loop conflicts by isolating each task in a fresh process
    worker_max_tasks_per_child=1,
    worker_prefetch_multiplier=1,  # same reason as above
    task_always_eager=False,  # same reason as above
)

celery_app.autodiscover_tasks(
    [
        "gai_cti_backend.background.ti",
        "gai_cti_backend.background.apt_detection",
        "gai_cti_backend.background.feed",
        "gai_cti_backend.background.home",
        "gai_cti_backend.background.ip_by_region",
        "gai_cti_backend.background.management",
    ]
)

on_after_finalize_connect = cast(Signal, celery_app.on_after_finalize).connect


def get_active_tasks():
    i = celery_app.control.inspect()
    for _, tasks in i.active().items():
        for task in tasks:
            yield task["name"].split(".")[-1]
