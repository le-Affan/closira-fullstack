#!/bin/bash

echo "1. Health check"
curl http://localhost:8000/health

echo -e "\n\n2. Creating enquiry"

CREATE_RESPONSE=$(curl -s -X POST http://localhost:8000/enquiry/ \
-H "Content-Type: application/json" \
-d '{
  "customer_name": "Sarah M.",
  "channel": "whatsapp",
  "message": "Hi I would like to book an appointment for next Tuesday"
}')

echo "$CREATE_RESPONSE"

JOB_ID=$(echo "$CREATE_RESPONSE" | python -c "
import sys, json
print(json.load(sys.stdin)['job_id'])
")

echo -e "\nExtracted JOB_ID:"
echo "$JOB_ID"

echo -e "\n\n3. Getting history"
curl http://localhost:8000/enquiry/$JOB_ID/history

echo -e "\n\n4. Scheduling follow-up"
curl -X POST http://localhost:8000/enquiry/$JOB_ID/followup \
-H "Content-Type: application/json" \
-d '{
  "delay_minutes": 30,
  "message_template": "Hi {name}, just following up on your booking request!"
}'

echo -e "\n\n5. Escalating enquiry"
curl -X POST http://localhost:8000/enquiry/$JOB_ID/escalate \
-H "Content-Type: application/json" \
-d '{
  "reason": "Customer has called 3 times and is very frustrated. Needs immediate attention."
}'

echo -e "\n\n6. Creating unmatched enquiry (auto-escalation test)"
curl -X POST http://localhost:8000/enquiry/ \
-H "Content-Type: application/json" \
-d '{
  "customer_name": "John D.",
  "channel": "email",
  "message": "Zxcvbnm asdfghjkl qwertyuiop"
}'
