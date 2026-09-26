from fastapi import FastAPI
from utils import load_data, find_ip_index, decimal_ip_to_integer
from fastapi import HTTPException
from pydantic import BaseModel
from typing import List, Dict

app = FastAPI()
DATA = load_data()


class RequestModel(BaseModel):
    ips: List[str]


class ResponseModel(BaseModel):
    data: List[Dict[str, Dict[str, str]]]


@app.get("/ip-info/", response_model=ResponseModel)
async def get_ip_info(request: RequestModel):
    try:
        ips = []
        for ip in request.ips:
            if ip_number := decimal_ip_to_integer(ip):
                target_index = find_ip_index(DATA, ip_number)
                target_data = DATA[target_index]

                ips.append(
                    {
                        ip: {
                            "country": target_data[3],
                            "state": target_data[4],
                            "city": target_data[5],
                            "lat": target_data[6],
                            "long": target_data[7],
                        }
                    }
                )
        return ResponseModel(data=ips)

    except Exception:
        raise HTTPException(status_code=500, detail="Unexpected error")
