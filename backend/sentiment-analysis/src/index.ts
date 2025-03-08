import {
    ComprehendClient,
    DetectSentimentCommand,
  } from "@aws-sdk/client-comprehend";
  import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
  import { KinesisClient, GetRecordsCommand } from "@aws-sdk/client-kinesis";
  
  const comprehendClient = new ComprehendClient({});
  const dynamoDBClient = new DynamoDBClient({});
  const kinesisClient = new KinesisClient({});
  
  export const handler = async (event: any) => {
    try {
      // 1. Get records from Kinesis stream
      const records = await kinesisClient.send(
        new GetRecordsCommand({
          ShardIterator: event.Records[0].kinesis.shardId,
        })
      );
  
      // 2. Process each record (tweet)
      for (const record of records.Records || []) {
        if (!record.Data) continue
        
        const tweet = JSON.parse(record.Data?.toString());
  
        // 3. Detect sentiment using Comprehend
        const sentimentResponse = await comprehendClient.send(
          new DetectSentimentCommand({
            LanguageCode: "en", // Replace with appropriate language code
            Text: tweet.text,
          })
        );
  
        // 4. Store tweet and sentiment in DynamoDB
        const putItemParams = {
          TableName: "SentimentDataTable",
          Item: {
            TweetId: { S: tweet.id },
            Text: { S: tweet.text },
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
