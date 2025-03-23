import { ComprehendClient, DetectSentimentCommand } from "@aws-sdk/client-comprehend";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { Handler, KinesisStreamEvent } from "aws-lambda";
  
const comprehendClient = new ComprehendClient({});
const dynamoDBClient = new DynamoDBClient({});
  
export const handler: Handler = async (event: KinesisStreamEvent) => {
    try {
      // 1. Process each record (toot)
      for (const record of event.Records || []) {
        if (!record?.kinesis?.data) continue
        
        const toot: {
          PostId: string,
          Text: string,
          AuthorUsername: string,
          CreatedAt: string
        } = JSON.parse(Buffer.from(record.kinesis.data, 'base64').toString())
  
        // 3. Detect sentiment using Comprehend
        const sentimentResponse = await comprehendClient.send(
          new DetectSentimentCommand({
            LanguageCode: "en",
            Text: toot.Text,
          })
        );
  
        // 4. Store toot and sentiment in DynamoDB
        const putItemParams = {
          TableName: "SentimentDataTable",
          Item: {
            DataId: { S: toot.PostId },
            Text: { S: toot.Text },
            AuthorUsername: { S: toot.AuthorUsername },
            CreatedAt: { S: toot.CreatedAt },
            Sentiment: { S: sentimentResponse.Sentiment || "UNKNOWN" },
            SentimentScore: {
              M: {
                Positive: { N: sentimentResponse.SentimentScore?.Positive?.toString() || "0" },
                Negative: { N: sentimentResponse.SentimentScore?.Negative?.toString() || "0" },
                Neutral: { N: sentimentResponse.SentimentScore?.Neutral?.toString() || "0" },
                Mixed: { N: sentimentResponse.SentimentScore?.Mixed?.toString() || "0" },
              },
            },
          },
        };
        await dynamoDBClient.send(new PutItemCommand(putItemParams));
      }
    } catch (error) {
      console.error("Error processing records:", error);
    }
};
