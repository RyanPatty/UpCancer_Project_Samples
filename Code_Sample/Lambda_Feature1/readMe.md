# auth_v2

## Description

`auth_v2` is a serverless application designed for user registration and email verification using AWS Lambda and DynamoDB. This project leverages Node.js (18.x runtime) and AWS SAM (Serverless Application Model) for local development and testing. By utilizing Docker, we can run a local instance of DynamoDB, allowing for cost-effective, fast, and isolated development and testing environments.

This project is Node.js-based, utilizing the latest features available in Node.js 18.x. All Lambda functions are written as ES modules with the `.mjs` extension, allowing for modern JavaScript syntax and module management.

## Benefits of Local Development and Testing

- **Cost-Effective**: Developing and testing locally avoids the costs associated with deploying and running resources in the cloud.
- **Speed**: Local testing enables faster iteration and debugging.
- **Isolation**: Working locally allows for experimentation and development without impacting production environments.

## Project Structure

- **.aws-sam**: Directory containing built artifacts.
- **events**: Directory containing event JSON files for local testing.
- **lambda-functions**: Source code directory containing the lambda logic.
  - **node_modules**: Directory for Node.js dependencies.
  - **tests**: Directory for unit tests.
  - **.env**: Environment variables file.
  - **.npmignore**: File specifying which files and directories should be ignored by npm.
  - **app.mjs**: Main application logic.
  - **emailLambda.mjs**: Logic for sending and verifying emails.
  - **registerLambda.mjs**: Logic for user registration.
  - **loginLambda.mjs**: Logic for user login.
  - **package-lock.json**: Lockfile for npm dependencies.
  - **package.json**: Configuration file for npm dependencies and scripts.
  - **.gitignore**: Specifies files and directories to be ignored by Git.
- **README.md**: Project documentation file.
- **samconfig.toml**: Configuration file for SAM CLI.
- **template.yaml**: SAM template defining the serverless application.
- **db.sh**: Script for setting up and interacting with DynamoDB.

## Running Locally

### Step 1: Create and Query DynamoDB Table Locally with Docker

1. **Start DynamoDB Local Instance**:
   ```sh
   docker run -p 8000:8000 amazon/dynamodb-local
   ```

2. **Create the DynamoDB Table**:
   ```sh
   aws dynamodb create-table \
       --table-name AppDataTable \
       --attribute-definitions AttributeName=PK,AttributeType=S AttributeName=SK,AttributeType=S \
       --key-schema AttributeName=PK,KeyType=HASH AttributeName=SK,KeyType=RANGE \
       --billing-mode PAY_PER_REQUEST \
       --endpoint-url http://localhost:8000
   ```

3. **Verify the Table Creation**:
   ```sh
   aws dynamodb describe-table --table-name AppDataTable --endpoint-url http://localhost:8000
   ```

### Step 2: Install Dependencies

Navigate to the `lambda-functions` directory and install dependencies:
```sh
cd lambda-functions
npm install
```

### Step 3: Build the SAM Project

Navigate to the root directory and build the SAM project:
```sh
cd ..
sam build
```

### Step 4: Invoke the Lambda Function Locally

Invoke the `UserRegistrationFunction`, `UserLoginFunction`, `SendVerificationEmailFunction`, and `VerifyEmailFunction` with the respective event JSON files:
```sh
sam local invoke UserRegistrationFunction --event events/registerEvent.json
sam local invoke UserLoginFunction --event events/loginEvent.json
sam local invoke SendVerificationEmailFunction --event events/sendVerificationEvent.json
sam local invoke VerifyEmailFunction --event events/verificationEvent.json
```

## Understanding SAM and Lambda

### AWS Lambda

AWS Lambda is a compute service that lets you run code without provisioning or managing servers. Lambda executes your code only when needed and scales automatically, from a few requests per day to thousands per second. You pay only for the compute time you consume.

#### Key features of AWS Lambda:

- **Event-Driven**: Lambda functions are triggered by events such as changes to data in an Amazon S3 bucket or updates to a DynamoDB table.
- **Scalability**: Lambda automatically scales your application by running code in response to each trigger.
- **No Servers to Manage**: Lambda runs your code on a highly available compute infrastructure.

### AWS SAM (Serverless Application Model)

AWS SAM is an open-source framework for building serverless applications. It provides a simplified way to define the Amazon API Gateway APIs, AWS Lambda functions, and Amazon DynamoDB tables needed by your application.

#### Key benefits of AWS SAM:

- **Simplified Definition**: SAM uses a simple and clean syntax to define the infrastructure and configuration of your serverless application.
- **Local Development and Testing**: SAM CLI provides the ability to develop and test Lambda functions locally, which reduces costs and speeds up the development process.
- **Integration with AWS**: SAM integrates seamlessly with other AWS services, making it easy to deploy and manage serverless applications.

## How It Works

1. **Defining the Application**: The `template.yaml` file is used to define the AWS resources needed for the application. This includes defining the Lambda functions, API Gateway endpoints, and DynamoDB tables.

2. **Building the Application**: The `sam build` command packages your application, installing dependencies and preparing the code for deployment.

3. **Local Testing**: The `sam local invoke` command allows you to invoke Lambda functions locally, simulating the AWS environment. This helps in testing and debugging your functions before deploying them to AWS.

4. **Deploying the Application**: When you're ready to deploy, the `sam deploy` command packages and deploys your serverless application to AWS, creating and configuring the necessary resources.

5. **Running in AWS**: Once deployed, the Lambda functions are triggered by events defined in the `template.yaml`. For example, the `UserRegistrationFunction` is triggered by HTTP requests via API Gateway, which processes the registration data and interacts with DynamoDB.

## Example Lambda Functions

### `registerUser` Function

This function handles user registration by performing the following steps:

1. Parses the incoming request body to extract user data.
2. Validates the presence of required fields (`username`, `email`, `password`).
3. Hashes the user's password using `bcrypt`.
4. Stores the user data in DynamoDB.
5. Generates a JWT token for the registered user.
6. Returns a success response with the JWT token.

### `loginUser` Function

This function handles user login by performing the following steps:

1. Parses the incoming request body to extract login data.
2. Validates the presence of required fields (`username`, `password`).
3. Retrieves the user data from DynamoDB.
4. Compares the provided password with the stored hashed password using `bcrypt`.
5. Generates a JWT token for the authenticated user.
6. Returns a success response with the JWT token.

### `sendVerificationEmail` Function

This function sends a verification email to the user by performing the following steps:

1. Parses the incoming request body to extract user data.
2. Validates the presence of required fields (`username`, `email`).
3. Generates a JWT token for email verification.
4. Constructs a verification link with the token.
5. Sends the email using Amazon SES.
6. Returns a success response if the email is sent successfully.

### `verifyEmail` Function

This function verifies the user's email by performing the following steps:

1. Parses the incoming request body to extract the token.
2. Validates the presence of the token.
3. Verifies and decodes the JWT token.
4. Updates the user's verification status in DynamoDB.
5. Returns a success response if the email is verified successfully.

## Testing

- **Unit Tests**: Place your unit tests in the `lambda-functions/tests` directory. Use a testing framework like [Jest](https://jestjs.io/) for running your tests.
  ```sh
  npm test
  ```

## Additional Considerations

### Security

Security is a critical aspect of any application. Here are some practices to follow:

1. **Environment Variables**: Store sensitive information such as JWT secrets and database credentials in environment variables. Use AWS Secrets Manager or AWS Systems Manager Parameter Store for managing secrets securely.

2. **Password Hashing**: Always hash passwords using a strong hashing algorithm like bcrypt before storing them in the database.

3. **JWT Security**: Use strong secrets for signing JWTs and set appropriate expiration times. Validate and verify tokens on every request that requires authentication.

4. **IAM Roles and Policies**: Use least privilege principle for IAM roles and policies. Ensure your Lambda functions have only the permissions they need.

### Monitoring and Logging

Monitoring and logging are essential for maintaining the health of your application:

1. **AWS CloudWatch**: Use CloudWatch for monitoring your Lambda functions. Set up alarms for key metrics like errors, invocation count, and duration.

2. **Structured Logging**: Implement structured logging in your Lambda functions to make it easier to query and analyze logs in CloudWatch.

3. **X-Ray**: Use AWS X-Ray to trace requests and visualize the flow of requests across your application components.

### CI/CD Integration

Integrate Continuous Integration and Continuous Deployment (CI/CD) pipelines to automate testing and deployment:

1. **AWS CodePipeline**: Use AWS CodePipeline to create CI/CD pipelines for your SAM applications.
2. **GitHub Actions**: Utilize GitHub Actions for automating tests and deployments directly from your GitHub repository.
3. **Testing**: Implement unit tests, integration tests, and end-to-end tests to ensure your application functions correctly before deploying.

### Scaling

Serverless applications scale automatically, but it

’s important to design for scalability:

1. **Concurrency Limits**: Understand and manage concurrency limits for Lambda functions to avoid throttling.
2. **DynamoDB Scaling**: Use DynamoDB’s auto-scaling features to adjust throughput based on demand.
3. **Optimize Lambda Performance**: Minimize cold starts by optimizing function performance and reusing connections to external services like databases.

### Documentation

Maintain comprehensive documentation for your project:

1. **README.md**: Provide clear instructions for setting up, running, and deploying the application.
2. **Code Comments**: Include comments in your code to explain the purpose and functionality of each component.
3. **API Documentation**: Document your API endpoints, request/response formats, and any required authentication.

## Future Enhancements

Consider implementing the following features to enhance the functionality of the application:

1. **Email Verification**: Implement a system to verify user email addresses during registration.
2. **Password Reset**: Add functionality for users to reset their passwords securely.
3. **Multi-Factor Authentication (MFA)**: Enhance security by implementing MFA for user logins.
4. **User Roles and Permissions**: Implement role-based access control to manage different levels of access for users.
5. **API Rate Limiting**: Protect your API from abuse by implementing rate limiting.

## Useful Resources

1. **AWS Lambda Documentation**: [AWS Lambda](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html)
2. **AWS SAM Documentation**: [AWS SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html)
3. **AWS DynamoDB Documentation**: [DynamoDB](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html)
4. **Node.js Documentation**: [Node.js](https://nodejs.org/en/docs/)
5. **Docker Documentation**: [Docker](https://docs.docker.com/get-started/)
6. **GitHub Actions Documentation**: [GitHub Actions](https://docs.github.com/en/actions)
7. **AWS X-Ray Documentation**: [AWS X-Ray](https://docs.aws.amazon.com/xray/latest/devguide/aws-xray.html)
