#!/bin/sh
CRUMB=$(curl -c /tmp/cookies -s 'http://localhost:8080/crumbIssuer/api/xml?xpath=concat(//crumbRequestField,":",//crumb)')
curl -b /tmp/cookies -i -X POST -H "$CRUMB" http://localhost:8080/job/ShipShape-Pipeline/build

