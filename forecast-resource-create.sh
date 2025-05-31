# TinyIoT 서버
TINYIOT_HOST="http://172.28.6.239:8080"
AE_LIST=("Seoul" "Busan")
ORIGIN_LIST=("CAdmin1" "CAdmin2")
CONTAINERS=("T1H" "REH" "PTY")

# 공통 헤더
CT_AE="application/json;ty=2"
CT_CNT="application/json;ty=3"
ACCEPT="application/json"
RVI="3"

# 1. AE 생성
for i in "${!AE_LIST[@]}"; do
  AE="${AE_LIST[$i]}"
  ORIGIN="${ORIGIN_LIST[$i]}"
  RI="req_$(date +%s)_$RANDOM"

  curl -s -X POST "$TINYIOT_HOST/TinyIoT" \
    -H "X-M2M-Origin: $ORIGIN" \
    -H "X-M2M-RI: $RI" \
    -H "Content-Type: $CT_AE" \
    -H "Accept: $ACCEPT" \
    -H "X-M2M-RVI: $RVI" \
    -d "{
      \"m2m:ae\": {
        \"rn\": \"$AE\",
        \"api\": \"N.weather.app\",
        \"rr\": true
      }
    }"

  # 2. 컨테이너 생성
  for CNT in "${CONTAINERS[@]}"; do
    RI="req_$(date +%s)_$RANDOM"
    curl -s -X POST "$TINYIOT_HOST/TinyIoT/$AE" \
      -H "X-M2M-Origin: $ORIGIN" \
      -H "X-M2M-RI: $RI" \
      -H "Content-Type: $CT_CNT" \
      -H "Accept: $ACCEPT" \
      -H "X-M2M-RVI: $RVI" \
      -d "{
        \"m2m:cnt\": {
          \"rn\": \"$CNT\"
        }
      }"
  done
done
