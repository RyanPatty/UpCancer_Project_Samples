### Explanation of Deployment Process
sam deploy --guided 

The deployment process involves several steps to ensure that your serverless application is correctly packaged, uploaded, and deployed to AWS. Here's a detailed breakdown of what happened:

1. **Managed S3 Bucket**:
   - The SAM CLI uses an S3 bucket to store packaged artifacts (your Lambda functions, etc.). This bucket is automatically managed by SAM, and its name is `aws-sam-cli-managed-default-samclisourcebucket-uttloxhpdrxl`.

2. **Deploying with Given Values**:
   - The deployment process begins with the specified parameters:
     - **Stack name**: `authV2`
     - **Region**: `us-east-1`
     - **Confirm changeset**: `True`
     - **Disable rollback**: `False`
     - **Deployment S3 bucket**: `aws-sam-cli-managed-default-samclisourcebucket-uttloxhpdrxl`
     - **Capabilities**: `["CAPABILITY_IAM"]`

3. **Uploading to S3**:
   - The SAM CLI packages the CloudFormation template and uploads it to the S3 bucket.

4. **Creating Changeset**:
   - A changeset is created to preview the resources that will be created or updated. This is a plan of what AWS CloudFormation will do.

5. **Changeset Preview**:
   - The changeset is displayed, listing all the resources that will be added:
     - DynamoDB Table
     - API Gateway Resources (RestApi, Deployment, Stage)
     - IAM Roles for each Lambda function
     - Lambda functions and their permissions

6. **Deploying Changeset**:
   - After confirming the changeset, the deployment process starts.
   - Resources are created in the specified order:
     - IAM Roles
     - DynamoDB Table
     - Lambda Functions
     - API Gateway Resources

7. **CloudFormation Events**:
   - The status of each resource creation is displayed, showing progress and completion.

8. **CloudFormation Outputs**:
   - After successful deployment, the CloudFormation stack outputs are displayed, providing important information such as:
     - ARNs for the Lambda functions and IAM roles
     - API Gateway endpoint URLs for each function

### Key Outputs

- **API Gateway Endpoints**:
  - `UserRegistrationFunctionApi`: https://ahelx4uwqe.execute-api.us-east-1.amazonaws.com/Prod/register/
  - `UserLoginFunctionApi`: https://ahelx4uwqe.execute-api.us-east-1.amazonaws.com/Prod/login/
  - `SendVerificationEmailFunctionApi`: https://ahelx4uwqe.execute-api.us-east-1.amazonaws.com/Prod/send-verification-email/
  - `VerifyEmailFunctionApi`: https://ahelx4uwqe.execute-api.us-east-1.amazonaws.com/Prod/verify-email/

- **Lambda Function ARNs**:
  - `UserRegistrationFunction`: arn:aws:lambda:us-east-1:471112835616:function:authV2-UserRegistrationFunction-I2xwPh1BkHeS
  - `UserLoginFunction`: arn:aws:lambda:us-east-1:471112835616:function:authV2-UserLoginFunction-E94tE5qYmVMh
  - `SendVerificationEmailFunction`: arn:aws:lambda:us-east-1:471112835616:function:authV2-SendVerificationEmailFunction-ZtbOGsXHf6ox
  - `VerifyEmailFunction`: arn:aws:lambda:us-east-1:471112835616:function:authV2-VerifyEmailFunction-ktFdJRsIVjDL

### Summary

- **Build Only When Necessary**: You only need to run `sam build` when there are changes to your Lambda function code or dependencies. For template changes or redeployments without code changes, you can directly run `sam deploy`.
- **Changeset Confirmation**: SAM CLI provides a changeset preview to confirm resource creation or updates before deployment.
- **Outputs**: After successful deployment, the stack outputs provide essential information about the deployed resources, including ARNs and endpoint URLs.