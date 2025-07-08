# Junior Engineer Setup

**Project:** Hatching Sparrow CRM  
**Date:** 6/12/2024  
**Author:** Ryan O'Connor, Full Stack Software Engineer  
**Confidentiality:** N/A

## Comprehensive Guide for Junior Engineers: Development and Deployment

### Table of Contents
1. [Joining the AWS Organization](#joining-the-aws-organization)
2. [Setting Up Your AWS Account](#setting-up-your-aws-account)
3. [Installing Necessary Tools](#installing-necessary-tools)
4. [Development](#development)
5. [Deployment](#deployment)
6. [Summary](#summary)
7. [Additional Resources](#additional-resources)

## 1. Joining the AWS Organization

### Steps to Join the AWS Organization

#### Receive an Invitation
You will receive an email invitation from the AWS organization admin to join the organization.

#### Accept the Invitation
Follow the instructions in the email to accept the invitation. This will involve creating your own AWS root account if you don't have one already.

#### Log in to Your AWS Account
After accepting the invitation, log in to your AWS root account to confirm that you are now part of the organization.

## 2. Setting Up Your AWS Account

### Steps to Set Up Your AWS Account

#### Create Your AWS Root Account
Visit the AWS sign-up page and create your root account.

#### Accept the Organization Invitation
1. Log in to your newly created AWS root account
2. Accept the invitation to join the AWS organization from the email you received

## 3. Installing Necessary Tools

### Node.js and npm

#### Install Node.js and npm

**macOS (using Homebrew):**
```bash
brew install node
```

**Windows (using Chocolatey):**
```bash
choco install nodejs
```

### AWS CLI

#### Install AWS CLI

**macOS (using Homebrew):**
```bash
brew install awscli
```

**Windows (using Chocolatey):**
```bash
choco install awscli
```

### Git Bash

#### Install Git Bash (Windows)
Download and install Git Bash from the official website.

## 4. Development

### Configuring Your Local Environment

#### Configure AWS CLI
1. Open Git Bash or your preferred terminal
2. Run the following command to configure the AWS CLI with your root account access keys:
   ```bash
   aws configure
   ```
3. Enter your AWS Access Key ID, Secret Access Key, default region, and default output format when prompted

### Learning About AWS Services

#### AWS Lambda
Learn about serverless computing and function deployment.

#### DynamoDB
Understand NoSQL database management and operations.

#### API Gateway
Learn about RESTful API creation and management.

#### S3
Understand cloud storage and file management.

### Local Development Setup for AWS Lambda

#### Initialize a New Node.js Project
1. Create a new directory for your project and navigate to it:
   ```bash
   mkdir my-lambda-function
   cd my-lambda-function
   ```

2. Initialize a new Node.js project:
   ```bash
   npm init -y
   ```

3. Install AWS SDK:
   ```bash
   npm install aws-sdk
   ```

#### Create Lambda Function Code
Create a new file named `index.js` and add the following sample code:

```javascript
const AWS = require('aws-sdk');

exports.handler = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda!'),
  };
};
```

## 5. Deployment

### Assuming the IAM Role

#### Assume the IAM Role
Use the `aws sts assume-role` command to assume the role provided by the organization admin:

```bash
aws sts assume-role --role-arn arn:aws:iam::<management-account-id>:role/<role-name> --role-session-name <session-name> --duration-seconds 43200 > assume-role-output.json
```

#### Extract the credentials from the output:
```bash
export AWS_ACCESS_KEY_ID=$(jq -r '.Credentials.AccessKeyId' assume-role-output.json)
export AWS_SECRET_ACCESS_KEY=$(jq -r '.Credentials.SecretAccessKey' assume-role-output.json)
export AWS_SESSION_TOKEN=$(jq -r '.Credentials.SessionToken' assume-role-output.json)
```

### Packaging the Lambda Function

#### Create a Deployment Package
Zip your project files:
```bash
zip -r function.zip .
```

### Deploying the Lambda Function

#### Deploy the Lambda Function
Use the AWS CLI to create a new Lambda function:

```bash
aws lambda create-function --function-name myLambdaFunction --runtime nodejs14.x --role arn:aws:iam::<your-role-arn> --handler index.handler --zip-file fileb://function.zip
```

### Invoking the Lambda Function

#### Invoke the Lambda Function
Test your Lambda function by invoking it:
```bash
aws lambda invoke --function-name myLambdaFunction output.txt
```

#### Check the Output
Open `output.txt` to see the result of your Lambda function invocation.

## 6. Summary

By following this guide, you will be able to:
- Join the AWS organization
- Assume roles for accessing AWS resources
- Set up your local development environment for AWS Lambda using Node.js

This setup ensures secure access to AWS resources and provides a streamlined development workflow.

## 7. Additional Resources

This guide provides a comprehensive overview of setting up your development environment for AWS Lambda development within the organization structure.





