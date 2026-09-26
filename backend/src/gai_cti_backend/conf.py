import httpx


def check_url_sync(url):
    try:
        with httpx.Client() as client:
            response = client.get(url, timeout=25.0)
            return response.status_code
    except (httpx.ConnectError, httpx.TimeoutException, httpx.RequestError) as e:
        print(f"Error: {e}")
        return False


opencti_gql_url = "http://opencti:8080/open-cti/graphql"
opencti_admin_token = "f3ca64ff-9082-4757-9e87-880be59462d1"

redis_conn_info = {
    "host": "redis-backend",
    "port": 6379,
    "db": 0,
    "decode_responses": True,
}
auth_redis_conn_info = {
    "host": "redis-auth",
    "port": 6379,
    "db": 0,
    "decode_responses": True,
}
elastic_conn_info = {
    "url": "http://elasticsearch:9200",
    "username": "elastic",
    "password": "elastic12345678",
}
kibana_conn_info = {
    "url": "http://kibana:5601/kibana",
    "username": "elastic",
    "password": "elastic12345678",
}

geo_ip_url = "http://geo-ip:8000/ip-info/"

ollama_url = "http://ollama:11434"
# ollama_url = "http://172.25.110.40:11434"  # devel mode

available_llms = [
    "gpt-5-nano",
    "gpt-5-mini",
    "gpt-5.2",
    "andrewmccall/gemma3-tools",
]

celery_info = {
    "broker_url": "redis://redis-backend:6379/0",
    "result_backend": "redis://redis-backend:6379/0",
}
