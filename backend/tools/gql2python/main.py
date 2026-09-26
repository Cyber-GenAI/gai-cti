import json
from pathlib import Path

import black
from jinja2 import Environment, FileSystemLoader

env = Environment(loader=FileSystemLoader("./tools/gql2python/"))

data = json.load(open("./tools/gql2python/input.json"))
tab = " " * 4
data["query"] = data["query"].replace("\n", f"\n{tab*3}")
template = env.get_template("template.py.jinja")

with open("./tools/gql2python/output.py", "w") as f:
    f.write(template.render(**data))

black.format_file_in_place(
    Path("./tools/gql2python/output.py"),
    fast=False,
    mode=black.FileMode(),
    write_back=black.WriteBack.YES,
)
