# GAT-CTI Backend

## Run
use `poetry run fastapi dev src/gai_cti_backend --port 8088` to start the project in development environment

## Notes:

### Staging
after building into production the built version of project should be available in [`http://gai-cti.amnafzar.ir/`](http://gai-cti.amnafzar.ir/).

### Swagger
- url: [`http://localhost:8088/docs`](http://localhost:8088/docs)

### OpenCTI
- url: [`http://localhost:8080/open-cti`](http://localhost:8080/open-cti)
- username: `admin@opencti.io`
- password: `opencti12345678`

### Kibana
- url: [`http://localhost:5601/kibana`](http://localhost:5601/kibana)
- username: `elastic`
- password: `elastic12345678`

### IP Retrieval
- url: [`http://geo-ip:8000/ip-info/`](http://geo-ip:8000/ip-info/)

    To retrieve geolocation information for a list of IP addresses, send a GET request to the above endpoint with a request body containing an "ips" field, which should be a list of the desired IP  addresses.


> **Note:** This is an internal service and not accessible from outside.

## Tools
### gql2python
1. Open Web Developer Tools in your browser.
2. Go to the Network tab.
3. Right click on graphQL request and select `Copy Value > Copy POST Data`.
4. Paste the results into `./tools/gql2python/input.json` file.
5. use `poetry run python ./tools/gql2python/main.py` to generate python code.

### extract_data_from_mitre_for_front
docs are comming soon...

### gen_metadata_for_logs
This script processes all .json.tar.gz log archives inside the mordor-atomic directory to extract and analyze timestamp data from each log file. In order to use the script, set the `main_path` parameter in the code.

## Formatting
Code formatting is enforced using `pre-commit` hooks. The following tools are used:

- **Black** for code formatting  
- **isort** for import sorting

Commits must be made from within the containers for the pre-commit hooks to trigger. If you face issues making commits from the containers run `pre-commit run --all-files`

## Helpers
### Remove User-Specific Docker Volumes
- command: ```docker volume ls --format "{{.Name}}" | grep "^gai-cti-back-${USER}" | xargs -r docker volume rm```

## Problems an Solutions

### Fix Elasticsearch exit code 78

#### Error
```
bootstrap check failure: vm.max_map_count [8192] is too low, increase to at least [262144]
```

#### Fix (on Docker host)
```bash
sudo sysctl -w vm.max_map_count=262144
```

#### Make Permanent
Add to `/etc/sysctl.conf` or `/etc/sysctl.d/99-elasticsearch.conf`:
```bash
vm.max_map_count=262144
```
Then apply:
```bash
sudo sysctl --system
```

> Run these before starting your Elasticsearch Docker container.

--- 

Let me know if you want this in one-liner or cheat-sheet style!