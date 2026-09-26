import re
from ipaddress import IPv4Address, ip_address
from pathlib import Path


def custom_int_format(n: int) -> str:
    if n >= 1000:
        return f"{n / 1000:.2f}K"
    return str(n)


def clean_markdown_text(md_text):

    # Remove markdown links but keep the visible text
    no_md_links = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", md_text)

    # Remove all "(Citation: ...)" references
    no_citations = re.sub(r"\(Citation:[^)]+\)", "", no_md_links)

    # Optional: Clean up extra whitespace
    cleaned_text = re.sub(r"\s{2,}", " ", no_citations).strip()

    return cleaned_text


def get_valid_path(path: str) -> Path:
    if Path(path).exists():
        return Path(path)
    elif Path(f"../{path}").exists():
        return Path(f"../{path}")
    else:
        raise FileNotFoundError(
            f"{path.split('/')[-1]} file not found in expected locations."
        )


def is_ipv4(ip_str):
    try:
        return isinstance(ip_address(ip_str), IPv4Address)
    except ValueError:
        return False


def humanize(connector_id: str) -> str:
    text = connector_id.replace("_", " ").lower()
    text = connector_id.replace("-", " ").lower()
    return " ".join(word.capitalize() for word in text.split())
