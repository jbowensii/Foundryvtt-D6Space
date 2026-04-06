#!/bin/bash

unzip -qq .secure_files/foundry-data.zip
unzip -qq -d foundry-data/Data/systems build/artifacts/od6s.zip
echo -n $CI_JOB_TOKEN | docker login -u gitlab-ci-token --password-stdin $CI_REGISTRY

docker run -d \
  --network host \
  -h opend6-foundry \
  --name opend6 \
  --publish 30000:30000/tcp \
  --mount type=bind,source=$(pwd)/foundry-data,target=/data \
  registry.gitlab.com/vtt2/foundryvtt-test-container:latest

docker ps -a

sleep 30

docker ps -a

curl http://docker:30000
curl http://docker:4444

docker exec opend6 ls -al /data/Data/systems

exit 0
