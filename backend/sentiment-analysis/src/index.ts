import { ComprehendClient, DetectSentimentCommand } from "@aws-sdk/client-comprehend";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { KinesisClient, GetRecordsCommand, GetShardIteratorCommandInput, GetShardIteratorCommand } from "@aws-sdk/client-kinesis";
import { Handler, KinesisStreamEvent } from "aws-lambda";
  
const comprehendClient = new ComprehendClient({});
const dynamoDBClient = new DynamoDBClient({});
const kinesisClient = new KinesisClient({});
  
export const handler: Handler = async (event: KinesisStreamEvent) => {
    try {
      console.log('Event: 🙂', event?.Records[0])
      // 1. Get records from Kinesis stream

  
      // 2. Process each record (toot)
      for (const record of event.Records || []) {
        if (!record?.kinesis?.data) continue
        
        // console.log('Record: 🙂🙂', record.kinesis.data)

        const toot: {
          PostId: string,
          Text: string,
          AuthorUsername: string,
          CreatedAt: string
        } = JSON.parse(Buffer.from(record.kinesis.data, 'base64').toString())

        console.log('Toot: 🙂🙂', toot)
  
        // 3. Detect sentiment using Comprehend
        const sentimentResponse = await comprehendClient.send(
          new DetectSentimentCommand({
            LanguageCode: "en",
            Text: toot.Text,
          })
        );

        console.log('sentimentResponse: 🙂🙂', sentimentResponse)
  
        // 4. Store toot and sentiment in DynamoDB
        const putItemParams = {
          TableName: "SentimentDataTable",
          Item: {
            DataId: { S: toot.PostId },
            Text: { S: toot.Text },
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
