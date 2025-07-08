docker run -p 8000:8000 amazon/dynamodb-local

aws dynamodb create-table \
    --table-name AppDataTable \
    --attribute-definitions \
        AttributeName=PK,AttributeType=S \
        AttributeName=SK,AttributeType=S \
    --key-schema \
        AttributeName=PK,KeyType=HASH \
        AttributeName=SK,KeyType=RANGE \
    --billing-mode PAY_PER_REQUEST \
    --endpoint-url http://localhost:8000


aws dynamodb describe-table --table-name AppDataTable --endpoint-url http://localhost:8000


aws dynamodb put-item \
    --table-name AppDataTable \
    --item '{"PK": {"S": "USER#test_user"}, "SK": {"S": "#METADATA"}, "Type": {"S": "USER"}, "username": {"S": "test_user"}, "email": {"S": "test@example.com"}, "password": {"S": "hashed_password"}}' \
    --endpoint-url http://localhost:8000


aws dynamodb query \
    --table-name AppDataTable \
    --key-condition-expression "PK = :pk" \
    --expression-attribute-values '{":pk":{"S":"USER#test_user"}}' \
    --endpoint-url http://localhost:8000


aws dynamodb put-item \
    --table-name AppDataTable \
    --item '{"PK": {"S": "USER#another_user"}, "SK": {"S": "#METADATA"}, "Type": {"S": "USER"}, "username": {"S": "another_user"}, "email": {"S": "another@example.com"}, "password": {"S": "another_hashed_password"}}' \
    --endpoint-url http://localhost:8000


aws dynamodb scan --table-name AppDataTable --endpoint-url http://localhost:8000

sam local invoke UserRegistrationFunction --event events/registerEvent.json

sam local invoke UserLoginFunction --event events/loginEvent.json
