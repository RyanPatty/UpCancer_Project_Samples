import AWS from 'aws-sdk'; // Import the AWS SDK
import jwt from 'jsonwebtoken'; // Import the JSON Web Token library
import dotenv from 'dotenv'; // Import dotenv for environment variable management
dotenv.config(); // Load environment variables from a .env file

// Initialize DynamoDB Document Client to interact with DynamoDB
const dynamoDb = new AWS.DynamoDB.DocumentClient();
// Get the DynamoDB table name from environment variables or use a default value
const TableName = process.env.DYNAMODB_TABLE || 'AppDataTable';

// Initialize the Amazon SES (Simple Email Service) client for sending emails
const ses = new AWS.SES({ region: 'us-east-1' });

// Function to handle CORS (Cross-Origin Resource Sharing) preflight requests
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

// Function to send a verification email
export const sendVerificationEmail = async (event, context, callback) => {
    // Handle CORS preflight request
    if (handleCors(event, callback)) {
        return;
    }

    // Log the received event for debugging purposes
    console.log('Received event:', JSON.stringify(event, null, 2));

    let userData;
    try {
        // Parse the user data from the event body
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

    const { username, email } = userData;

    // Check if the required fields are present
    if (!username || !email) {
        console.error('Missing required fields:', { username, email });
        return {
            statusCode: 400,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            body: JSON.stringify({ message: 'Missing required fields: username, email' }),
        };
    }

    // Generate a JWT (JSON Web Token) for email verification
    const token = jwt.sign({ username }, process.env.JWT_SECRET || 'defaultSecret', { expiresIn: '1d' });

    // Create the verification link to be sent in the email
    const verificationLink = `http://yourfrontend.com/verify-email?token=${token}`;

    // Set up email parameters
    const emailParams = {
        Source: 'your-verified-email@domain.com', // Replace with a verified email address in SES
        Destination: {
            ToAddresses: [email] // Recipient email address
        },
        Message: {
            Subject: {
                Data: 'Email Verification' // Email subject
            },
            Body: {
                Text: {
                    Data: `Please verify your email by clicking the following link: ${verificationLink}` // Plain text body
                },
                Html: {
                    Data: `<p>Please verify your email by clicking the following link: <a href="${verificationLink}">${verificationLink}</a></p>` // HTML body
                }
            }
        }
    };

    try {
        // Send the email using Amazon SES
        await ses.sendEmail(emailParams).promise();
        console.log('Verification email sent to:', email);

        // Return a success response
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            body: JSON.stringify({ message: 'Verification email sent' }),
        };
    } catch (emailError) {
        // Log and return an error response if the email could not be sent
        console.error('Error sending verification email:', emailError);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            body: JSON.stringify({ message: 'Error sending verification email', error: emailError.message }),
        };
    }
};

// Function to verify the email using the token
export const verifyEmail = async (event, context, callback) => {
    // Handle CORS preflight request
    if (handleCors(event, callback)) {
        return;
    }

    // Log the received event for debugging purposes
    console.log('Received event:', JSON.stringify(event, null, 2));

    // Parse the token from the event body
    const { token } = JSON.parse(event.body || '{}');

    // Check if the token is provided
    if (!token) {
        console.error('Missing token');
        return {
            statusCode: 400,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            body: JSON.stringify({ message: 'Missing token' }),
        };
    }

    let decoded;
    try {
        // Verify and decode the JWT token
        decoded = jwt.verify(token, process.env.JWT_SECRET || 'defaultSecret');
        console.log('Decoded token:', decoded);
    } catch (tokenError) {
        // Log and return an error response if the token is invalid
        console.error('Invalid token:', tokenError);
        return {
            statusCode: 400,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            body: JSON.stringify({ message: 'Invalid token', error: tokenError.message }),
        };
    }

    const { username } = decoded;

    // Set up DynamoDB parameters to update the user verification status
    const params = {
        TableName,
        Key: {
            PK: `USER#${username}`,
            SK: '#METADATA'
        },
        UpdateExpression: 'set verified = :verified',
        ExpressionAttributeValues: {
            ':verified': true
        },
        ReturnValues: 'UPDATED_NEW'
    };

    try {
        // Update the user verification status in DynamoDB
        const result = await dynamoDb.update(params).promise();
        console.log('User email verified:', result);

        // Return a success response
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            body: JSON.stringify({ message: 'Email verified successfully' }),
        };
    } catch (updateError) {
        // Log and return an error response if the update operation fails
        console.error('Error updating user verification status:', updateError);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
            },
            body: JSON.stringify({ message: 'Error verifying email', error: updateError.message }),
        };
    }
};
/* 
Explanation

Imports:
    aws-sdk: AWS SDK for JavaScript to interact with AWS services.
    jsonwebtoken: Library to handle JWT (JSON Web Tokens) for authentication.
    dotenv: Library to load environment variables from a .env file.

Initialization:
    dynamoDb: Initializes the DynamoDB Document Client.
    TableName: Retrieves the DynamoDB table name from environment variables.
    ses: Initializes the Amazon SES (Simple Email Service) client for sending emails.

handleCors:
    Handles CORS preflight requests by returning appropriate CORS headers for OPTIONS HTTP method.

sendVerificationEmail:
    Parses the incoming event to extract user data.
    Validates that both username and email fields are provided.
    Generates a JWT token for email verification.
    Constructs the verification email content and sends it using Amazon SES.

verifyEmail:
    Parses the incoming event to extract the token.
    Verifies and decodes the JWT token to extract the username.
    Updates the user’s verification status in DynamoDB to verified.
*/