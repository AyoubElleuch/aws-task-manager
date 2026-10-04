# API contract

## GET /health

Reports that the API can respond. This is a public endpoint so no authentication, request body, or query parameters are required.


Successful response:

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"status":"ok"}
```