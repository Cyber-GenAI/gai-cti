from collections import Counter, defaultdict
from itertools import chain, permutations
from typing import Dict, List, Set, Tuple

from ...models.visual import HeatmapDataPoint, HeatmapDataRow
from ...opencti.indicator import get_indicators_with_tags_bulk


async def fetch_all_indicators_with_tags() -> Dict[str, List[str]]:
    indicator_to_tags = {}
    has_next_page = True
    cursor = None

    while has_next_page:
        result, page_info = await get_indicators_with_tags_bulk(cursor=cursor)

        for item in result:
            node = item["node"]
            # Extract tag names (main representative) from objectLabel
            tags = [
                label["representative"]["main"]
                for label in node.get("objectLabel", [])
                if label.get("representative", {}).get("main")
            ]
            if tags:
                indicator_to_tags[node["id"]] = tags

        has_next_page = page_info["hasNextPage"]
        cursor = page_info["endCursor"] if has_next_page else None

    return indicator_to_tags


def filter_top_tags_and_indicators(
    indicator_to_tags: Dict[str, List[str]], top_n: int = 10
) -> Tuple[Set[str], Dict[str, List[str]]]:

    all_tags = chain.from_iterable(indicator_to_tags.values())

    tag_counter = Counter(all_tags)

    top_tags: Set[str] = set(tag for tag, _ in tag_counter.most_common(top_n))

    filtered_indicator_to_tags = {
        ioc_id: intersection
        for ioc_id, tags in indicator_to_tags.items()
        if (intersection := list(top_tags.intersection(tags)))
    }

    return top_tags, filtered_indicator_to_tags


def compute_tag_co_occurrence(
    indicator_to_tags: Dict[str, List[str]],
) -> Dict[str, int]:
    pair_count = defaultdict(int)

    for tags in indicator_to_tags.values():
        if len(tags) < 2:
            continue
        for tag1, tag2 in permutations(tags, 2):
            pair_str = f"{tag1}:{tag2}"
            pair_count[pair_str] += 1

    return dict(pair_count)


async def get_tag_co_occurrence_heatmap_data(
    top_n_tags: int = 10,
) -> List[HeatmapDataRow]:

    indicator_to_tags = await fetch_all_indicators_with_tags()

    if not indicator_to_tags:
        return []

    top_tags, filtered_indicators = filter_top_tags_and_indicators(
        indicator_to_tags, top_n=top_n_tags
    )

    co_occurrence_counts = compute_tag_co_occurrence(filtered_indicators)

    heatmap_data: List[HeatmapDataRow] = []
    for tag in top_tags:
        data_entries = []
        for other in top_tags:
            if tag == other:
                continue

            data_entries.append(
                HeatmapDataPoint(
                    x=other,
                    y=co_occurrence_counts.get(f"{tag}:{other}", 0),
                )
            )

        heatmap_data.append(HeatmapDataRow(id=tag, data=data_entries))

    return heatmap_data
