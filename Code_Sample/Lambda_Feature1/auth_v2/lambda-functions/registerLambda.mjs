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

// Handle CORS (Cross-Origin Resource Sharing) preflight requests
const handleCors = (event, callback) => {
    // Check if the HTTP method is OPTIONS
    if (event.httpMethod === 'OPTIONS') {
        // Respond with appropriate CORS headers
        callback(null, {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            body: ''
        });
        return true; // Indicate that CORS was handled
    }
    return false; // Indicate that CORS was not handled
};

// Function to handle user registration
export const registerUser = async (event, context, callback) => {
    // Handle CORS for OPTIONS requests
    if (handleCors(event, callback)) {
        return;
    }

    // Log the received event for debugging purposes
    console.log('Received event:', JSON.stringify(event, null, 2));

    let userData;
    try {
        // Parse the request body to get user data
        userData = JSON.parse(event.body || '{}');
        console.log('Parsed user data:', userData);
    } catch (parseError) {
        // Log and return an error response if the event body is invalid
        console.error('Error parsing event body:', parseError);
        return {
            statusCode: 400,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            body: JSON.stringify({ message: 'Invalid request body', error: parseError.message }),
        };
    }

    const { username, email, password } = userData;

    // Validate required fields
    if (!username || !email || !password) {
        console.error('Missing required fields:', { username, email, password });
        return {
            statusCode: 400,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            body: JSON.stringify({ message: 'Missing required fields: username, email, password' }),
        };
    }

    const saltRounds = 10; // Number of salt rounds for hashing the password
    let hashedPassword;
    try {
        // Hash the user's password
        hashedPassword = await bcrypt.hash(password, saltRounds);
        console.log('Hashed password:', hashedPassword);
    } catch (hashError) {
        // Log and return an error response if there was an issue hashing the password
        console.error('Error hashing password:', hashError);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            body: JSON.stringify({ message: 'Error hashing password', error: hashError.message }),
        };
    }

    // Create user item to store in DynamoDB
    const userItem = {
        PK: `USER#${username}`, // Partition key
        SK: '#METADATA', // Sort key
        Type: 'USER', // Item type
        username,
        email,
        password: hashedPassword, // Store the hashed password
    };

    // Set up DynamoDB parameters to put the user item
    const params = {
        TableName,
        Item: userItem,
    };

    try {
        // Store user item in DynamoDB
        await dynamoDb.put(params).promise();
        console.log('User item stored in DynamoDB:', userItem);

        // Generate a JWT token for the new user
        const token = jwt.sign({ username }, process.env.JWT_SECRET || 'defaultSecret', { expiresIn: '1h' });

        // Return a success response with the JWT token
        return {
            statusCode: 201,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            body: JSON.stringify({ message: 'User registered successfully', token }),
        };
    } catch (error) {
        // Log and return an error response if there was an issue storing the user item or generating the token
        console.error('Error storing user in DynamoDB or generating token:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            body: JSON.stringify({ message: 'Error registering user', error: error.message }),
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

handleCors Function:
    Handles CORS preflight requests by returning appropriate CORS headers for OPTIONS HTTP method.

registerUser Function:
    Handles CORS preflight requests.
    Logs the received event for debugging purposes.
    Parses the request body to extract user data.
    Validates that username, email, and password fields are provided.
    Hashes the user's password using bcrypt.
    Constructs a user item to store in DynamoDB.
    Stores the user item in DynamoDB.
    Generates a JWT token for the newly registered user.
    Returns a success response with the JWT token.
    If any error occurs during the process, logs the error and returns an error response.
*/