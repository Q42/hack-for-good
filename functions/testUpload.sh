#!/usr/bin/env bash

UUID=$(uuidgen)
# REQUEST_URL=$(curl "http://localhost:5001/casebuilder-pro-3000/us-central1/uploadImage?uuid=$UUID" | jq -r .uploadUrl)

curl "https://us-central1-casebuilder-pro-3000.cloudfunctions.net/uploadImage?uuid=$UUID"

# echo $REQUEST_URL

# curl -v -m 5 -H 'Content-Type:image/png' -X PUT --upload-file './image.png' $REQUEST_URL