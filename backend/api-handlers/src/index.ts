import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { DynamoDBClient, ExecuteStatementCommand } from '@aws-sdk/client-dynamodb';

const TABLE_NAME = 'SentimentDataTable';
const VALID_SENTIMENTS = ['POSITIVE', 'NEGATIVE', 'NEUTRAL', 'MIXED'];
const dynamoDBClient = new DynamoDBClient({});

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log(event, '🙂Event')
  const headers = {
    "Access-Control-Allow-Headers" : "Content-Type",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
}

  try {
    // 1. Extract relevant data from the API Gateway event
    const { httpMethod, requestContext, queryStringParameters } = event;

    // 2. Determine the requested action based on the path or method
    if (httpMethod === 'GET' && requestContext.resourcePath === '/sentiment/{keyword}') {
        // 3. Validate keyword parameter
        const keyword = event.pathParameters?.keyword;
        if (!keyword) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Missing keyword' }) };
        }

        // 4. Validate sentiment parameter
        const sentiment = (queryStringParameters?.sentiment || '').toUpperCase(); 
        if (sentiment && !VALID_SENTIMENTS.includes(sentiment)) {
          return { statusCode: 400, body: JSON.stringify({ error: `Invalid sentitment value: allowed values are ${VALID_SENTIMENTS}` }) };
        }

        // 5. Fetch data from DynamoDB based on the request
        const sentimentData = await getSentimentData(keyword, sentiment);
        console.log(sentimentData, '❌sentimentData❌', event)

        // 6. Format the response
        return { statusCode: 200, headers, body: JSON.stringify(sentimentData ?? []) };
    }


    return { statusCode: 404, headers, body: JSON.stringify({ error: 'Not found' }) };
  } catch (error) {
    console.error('Error processing request:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal server error' }) };
  }
};

const getSentimentData = async (keyword: string, sentiment?: string) => {
    let statement = `SELECT * FROM "${TABLE_NAME}" WHERE Sentiment = '${sentiment}' AND contains(Text, '${keyword}')`

    if (!sentiment) {
        statement = `SELECT * FROM "${TABLE_NAME}" WHERE contains(Text, '${keyword}')`
    }

    // Execute the PartiQL statement
    const command = new ExecuteStatementCommand({
        Statement: statement,
    });

    const response = await dynamoDBClient.send(command);
    console.log(response, 'response❌', statement)

    return response.Items;
};
