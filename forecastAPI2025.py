import requests
import datetime
import json
import time


# config 설정
SERVICE_KEY = "giRPXbTSzULdWoW9gwL3XnS79G7a7ut564MbReMyAD0Ty5EHf/Um/0N5duEYJQ7jA404BdYp32IseD+Dj4ATDw=="
TINYIOT_URL = "http://172.28.6.239:8080/TinyIoT"

# 기온, 습도, 강수형태 카테고리
CATEGORIES = ["T1H", "REH", "PTY"]



def create_headers(originator: str, resource_type: str = None, request_id: str = None, rsc: str = None) -> dict:
    headers = {
        "Accept": "application/json",
        "X-M2M-Origin": originator,
        "X-M2M-RVI": "3"
    }

    if resource_type:
        headers["Content-Type"] = f"application/json;ty={resource_type}"

    if request_id:
        headers["X-M2M-RI"] = request_id
    
    if rsc:
        headers["X-M2M-RSC"] = rsc

    return headers


# 단기예보 API 호출 함수수
def get_forecast(NX,NY,base_date, base_time): # 위도와 경도도
    url = "http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst"
    params = {
        "serviceKey": SERVICE_KEY,
        "pageNo": "1",
        "numOfRows": "1000",
        "dataType": "JSON",
        "base_date": base_date,
        "base_time": base_time,
        "nx": NX,
        "ny": NY
    }
    response = requests.get(url, params=params)
    return response.json()


# TinyIoT에 post 요청하는 함수수
def post_to_tinyiot(container, ae, content):
    url = f"{TINYIOT_URL}/{ae}/{container}"
    payload = {
        "m2m:cin": {
            "con": content
        }
    }

    header = create_headers(originator="CAdmin", resource_type="4", request_id="12345")

    res = requests.post(url, headers=header, data=json.dumps(payload))
    print(f"[{container}] response: {res.status_code}")

# 메인 실행하기기
def run():
    while True:
        try:
            now = datetime.datetime.now()
            base_date = now.strftime("%Y%m%d")
            minute = 30 if now.minute >= 30 else 0
            hour = now.hour
            base_time = f"{hour:02d}{minute:02d}"


            data1 = get_forecast(62, 126, base_date, base_time)
            data2 = get_forecast(99, 77, base_date, base_time)

            items1 = data1['response']['body']['items']['item']
            items2 = data2['response']['body']['items']['item']

            for category in CATEGORIES:
                # 서울
                seoul_items = [i for i in items1 if i['category'] == category]
                if seoul_items:
                    item = seoul_items[0]
                    content = f"{item['fcstDate']} {item['fcstTime']} → {category}: {item['fcstValue']}"
                    post_to_tinyiot(category, "Seoul", content)

                # 부산
                busan_items = [i for i in items2 if i['category'] == category]
                if busan_items:
                    item = busan_items[0]
                    content = f"{item['fcstDate']} {item['fcstTime']} → {category}: {item['fcstValue']}"
                    post_to_tinyiot(category, "Busan", content)

        except Exception as e:
            print(f"[ERROR] : {e}")

        time.sleep(600) #10분마다 실행



if __name__ == "__main__":
    run()
