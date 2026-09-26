from celery import Celery
from celery.schedules import crontab

from .apt_detection import (
    run_apt_detection,
    update_adversary_side_bar,
    update_rule_per_adversary,
)
from .celery_worker import (
    celery_revoke_task,
    get_active_tasks,
    on_after_finalize_connect,
)
from .feed import (
    set_connectors_dir_name2connector_name,
    set_connectors_with_cached,
    update_feed_dashboard,
    update_map_organizations2connectors,
)
from .home import (
    get_10_top_ioc_count_per_adversary,
    get_alerts_stats,
    system_stats_init,
    system_stats_update,
    update_ioc_count_by_intrusion,
)
from .ip_by_region import get_map_data, update_map_data
from .management import (
    delete_all_detection_rules,
    delete_all_indexes_bulk,
    delete_detection_rule,
    delete_index,
    inject_detection_rule,
    inject_logs,
    inject_manual_logs,
    post_work_cleanup,
    reinject_detection_rule,
    reinject_logs,
)
from .rules import update_raw_rules
from .ti import update_ti_feeds, update_ti_top_dashboard, update_ti_types


@on_after_finalize_connect
def setup_periodic_tasks(sender: Celery, **kwargs) -> None:
    sender.add_periodic_task(
        schedule=crontab.from_string("* */5 * * *"),
        sig=system_stats_update.s(),
        name="update_system_stats",
    )
    sender.add_periodic_task(
        schedule=crontab.from_string("* */2 * * *"),
        sig=get_alerts_stats.s(),
        name="update_alerts_stats",
    )
    sender.add_periodic_task(
        schedule=crontab.from_string("*/30 * * * *"),
        sig=run_apt_detection.s(),
        name="run_apt_detection",
    )
    sender.add_periodic_task(
        schedule=crontab.from_string("*/10 * * * *"),
        sig=update_rule_per_adversary.s(),
        name="update_rule_per_adversary",
    )
    sender.add_periodic_task(
        schedule=crontab.from_string("* */2 * * *"),
        sig=update_adversary_side_bar.s(),
        name="update_adversary_side_bar",
    )
    sender.add_periodic_task(
        schedule=crontab.from_string("* */5 * * *"),
        sig=update_ioc_count_by_intrusion.s(),
        name="update_ioc_count_by_intrusion",
    )
    sender.add_periodic_task(
        schedule=crontab.from_string("*/30 * * * *"),
        sig=update_ti_types.s(),
        name="update_ti_types",
    )
    sender.add_periodic_task(
        schedule=crontab.from_string("*/30 * * * *"),
        sig=update_ti_feeds.s(),
        name="update_ti_feeds",
    )
    sender.add_periodic_task(
        schedule=crontab.from_string("*/30 * * * *"),
        sig=update_ti_top_dashboard.s(),
        name="update_ti_top_dashboard",
    )
    sender.add_periodic_task(
        schedule=crontab.from_string("*/15 * * * *"),
        sig=update_feed_dashboard.s(),
        name="update_feed_dashboard",
    )
    sender.add_periodic_task(
        schedule=crontab.from_string("* */6 * * *"),
        sig=update_map_data.s(),
        name="update_map_data",
    )
    sender.add_periodic_task(
        schedule=crontab.from_string("*/10 * * * *"),
        sig=update_map_organizations2connectors.s(),
        name="update_map_organizations2connectors",
    )
    sender.add_periodic_task(
        schedule=crontab.from_string("*/40 * * * *"),
        sig=update_ti_types.s(),
        name="update_ti_types",
    )
    sender.add_periodic_task(
        schedule=crontab.from_string("* */24 * * *"),
        sig=set_connectors_with_cached.s(),
        name="set_connectors_with_cached",
    )
    sender.add_periodic_task(
        schedule=crontab.from_string("* */24 * * *"),
        sig=set_connectors_dir_name2connector_name.s(),
        name="set_connectors_dir_name2connector_name",
    )
    sender.add_periodic_task(
        schedule=crontab.from_string("*/5 * * * *"),
        sig=update_raw_rules.s(),
        name="update_raw_rules",
    )
    sender.add_periodic_task(
        schedule=crontab.from_string("* */12 * * *"),
        sig=get_10_top_ioc_count_per_adversary.s(),
        name="get_10_top_ioc_count_per_adversary",
    )


__all__ = (
    "celery_revoke_task",
    "inject_logs",
    "inject_manual_logs",
    "delete_index",
    "reinject_logs",
    "inject_detection_rule",
    "delete_detection_rule",
    "reinject_detection_rule",
    "post_work_cleanup",
    "update_ti_types",
    "update_ti_feeds",
    "update_ti_top_dashboard",
    "system_stats_init",
    "system_stats_update",
    "get_map_data",
    "delete_all_indexes_bulk",
    "delete_all_detection_rules",
    "update_ioc_count_by_intrusion",
    "get_active_tasks",
    "update_feed_dashboard",
    "update_map_organizations2connectors",
    "update_ti_types",
    "set_connectors_dir_name2connector_name",
    "set_connectors_with_cached",
    "update_raw_rules",
    "get_10_top_ioc_count_per_adversary",
)
