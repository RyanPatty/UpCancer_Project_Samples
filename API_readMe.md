#  auth_v2 API Documentation

## Overview

Welcome to the `auth_v2` API documentation! This API is designed to handle user registration, login, and email verification. Below you'll find detailed information about each endpoint, including request and response formats. Let's get started! 🐦

## Base URL

The base URL for all API endpoints is: `https://your-api-url.com`

## Endpoints

###  Register User

**POST** `/register`

Registers a new user in the system.

#### Request

- **Headers**:
  - `Content-Type: application/json`
- **Body**:
  ```json
  {
    "username": "johndoe",
    "email": "johndoe@example.com",
    "password": "securepassword123"
  }
  ```

#### Response

- **201 Created**:
  ```json
  {
    "message": "User registered successfully",
    "token": "jwt-token"
  }
  ```
- **400 Bad Request**:
  ```json
  {
    "message": "Missing required fields: username, email, password"
  }
  ```
- **500 Internal Server Error**:
  ```json
  {
    "message": "Error registering user",
    "error": "Detailed error message"
  }
  ```

###  Login User

**POST** `/login`

Logs in an existing user and returns a JWT token.

#### Request

- **Headers**:
  - `Content-Type: application/json`
- **Body**:
  ```json
  {
    "username": "johndoe",
    "password": "securepassword123"
  }
  ```

#### Response

- **200 OK**:
  ```json
  {
    "message": "Login successful",
    "token": "jwt-token"
  }
  ```
- **400 Bad Request**:
  ```json
  {
    "message": "Missing required fields: username, password"
  }
  ```
- **401 Unauthorized**:
  ```json
  {
    "message": "Invalid password"
  }
  ```
- **500 Internal Server Error**:
  ```json
  {
    "message": "Error logging in user",
    "error": "Detailed error message"
  }
  ```

###  Send Verification Email

**POST** `/send-verification-email`

Sends a verification email to the user.

#### Request

- **Headers**:
  - `Content-Type: application/json`
- **Body**:
  ```json
  {
    "username": "johndoe",
    "email": "johndoe@example.com"
  }
  ```

#### Response

- **200 OK**:
  ```json
  {
    "message": "Verification email sent"
  }
  ```
- **400 Bad Request**:
  ```json
  {
    "message": "Missing required fields: username, email"
  }
  ```
- **500 Internal Server Error**:
  ```json
  {
    "message": "Error sending verification email",
    "error": "Detailed error message"
  }
  ```

###  Verify Email

**POST** `/verify-email`

Verifies the user's email using a token.

#### Request

- **Headers**:
  - `Content-Type: application/json`
- **Body**:
  ```json
  {
    "token": "jwt-token"
  }
  ```

#### Response

- **200 OK**:
  ```json
  {
    "message": "Email verified successfully"
  }
  ```
- **400 Bad Request**:
  ```json
  {
    "message": "Missing token"
  }
  ```
- **400 Bad Request**:
  ```json
  {
    "message": "Invalid token",
    "error": "Detailed error message"
  }
  ```
- **500 Internal Server Error**:
  ```json
  {
    "message": "Error verifying email",
    "error": "Detailed error message"
  }
  ```

## Error Handling

All error responses will include a `message` field with a brief description of the error and, in some cases, an `error` field with more details.

### Common Status Codes

- **200 OK**: The request was successful.
- **201 Created**: The resource was successfully created.
- **400 Bad Request**: The request was invalid or missing required fields.
- **401 Unauthorized**: Authentication failed.
- **500 Internal Server Error**: An error occurred on the server.

## Authentication

JWT tokens are used for authenticating requests. Include the token in the `Authorization` header as follows:

```
Authorization: Bearer jwt-token
```

## Enjoy! 

We hope you enjoy using the `auth_v2` API! If you have any questions or need further assistance, please reach out to the project maintainers. Happy coding! 
