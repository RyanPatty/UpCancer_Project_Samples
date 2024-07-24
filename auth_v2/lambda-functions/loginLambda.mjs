import AWS from 'aws-sdk'; // Import the AWS SDK
import bcrypt from 'bcryptjs'; // Import bcrypt for password hashing
import jwt from 'jsonwebtoken'; // Import the JSON Web Token library
import dotenv from 'dotenv'; // Import dotenv for environment variable management

dotenv.config(); // Load environment variables from a .env file

// Initialize DynamoDB Document Client with a custom endpoint for Docker
const dynamoDb = new AWS.DynamoDB.DocumentClient({
    endpoint: 'http://host.docker.internal:8000'  // Update this to use Docker's internal host
});

// Get the DynamoDB table name from environment variables or use a default value
const TableName = process.env.DYNAMODB_TABLE || 'AppDataTable';

// Function to handle user login
export const loginUser = async (event) => {
    // Log the received event for debugging purposes
    console.log('Received event:', JSON.stringify(event, null, 2));

    let loginData;
    try {
        // Parse the login data from the event body
        loginData = JSON.parse(event.body || '{}');
    } catch (parseError) {
        // Log and return an error response if the event body is invalid
        console.error('Error parsing event body:', parseError);
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Invalid request body', error: parseError.message }),
        };
    }

    const { username, password } = loginData;

    // Check if the required fields are present
    if (!username || !password) {
        console.error('Missing required fields:', { username, password });
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Missing required fields: username, password' }),
        };
    }

    // Set up DynamoDB parameters to get the user item
    const params = {
        TableName,
        Key: {
            PK: `USER#${username}`,
            SK: '#METADATA',
        },
    };

    try {
        // Get the user item from DynamoDB
        const result = await dynamoDb.get(params).promise();
        const userItem = result.Item;

        // Check if the user exists
        if (!userItem) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'User not found' }),
            };
        }

        // Compare the provided password with the stored hashed password
        const passwordMatch = await bcrypt.compare(password, userItem.password);

        // Check if the password matches
        if (!passwordMatch) {
            return {
                statusCode: 401,
                body: JSON.stringify({ message: 'Invalid password' }),
            };
        }

        // Generate a JWT token for the authenticated user
        const token = jwt.sign({ username }, process.env.JWT_SECRET || 'defaultSecret', { expiresIn: '1h' });

        // Return a success response with the JWT token
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Login successful', token }),
        };
    } catch (error) {
        // Log and return an error response if there was an issue during login
        console.error('Error logging in user:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error logging in user', error: error.message }),
        };
    }
};

/*
Explanation

Imports:
    aws-sdk: AWS SDK for JavaScript to interact with AWS services.
    bcryptjs: Library for hashing passwords and comparing hashed passwords.
    jsonwebtoken: Library to handle JWT (JSON Web Tokens) for authentication.
    dotenv: Library to load environment variables from a .env file.

Initialization:
    dynamoDb: Initializes the DynamoDB Document Client with a custom endpoint for Docker.
    TableName: Retrieves the DynamoDB table name from environment variables.

loginUser Function:
    Logs the received event for debugging purposes.
    Parses the login data from the event body.
    Validates that both username and password fields are provided.
    Constructs parameters to query the DynamoDB table for the user item.
    Retrieves the user item from DynamoDB and checks if the user exists.
    Compares the provided password with the stored hashed password using bcrypt.compare.
    If the passwords match, generates a JWT token for the authenticated user.
    Returns a success response with the JWT token.
    If any error occurs during the process, logs the error and returns an error response.
*/