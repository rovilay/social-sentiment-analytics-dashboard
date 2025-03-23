import { KinesisClient, PutRecordCommand, PutRecordCommandInput } from "@aws-sdk/client-kinesis";
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { Handler } from 'aws-lambda';
import { createRestAPIClient } from 'masto';

const kinesisClient = new KinesisClient({});
const secretsManagerClient = new SecretsManagerClient({});

export const handler: Handler = async (event: any): Promise<{ statusCode: number, body: string }> => {
  try {
    // 1. Retrieve API credentials from Secrets Manager
    const secretResponse = await secretsManagerClient.send(
      new GetSecretValueCommand({ SecretId: "social-media-analytics-secrets-manager" })
    );
    const secrets = JSON.parse(secretResponse.SecretString || "{}");

    const masto = createRestAPIClient({
      url: secrets.MASTODON_INSTANCE_URL || '',
      accessToken: secrets.MASTODON_ACCESS_TOKEN || '',
    });

    // 2. Fetch toots based on your criteria (e.g., keywords, hashtags)
    const toots = await masto.v2.search.list({
      q: "crypto",
      type: "statuses",
      limit: 40
    })

    // 3. Iterate through toots and send them to Kinesis
    const kinesisStreamName = "SocialMediaDataStream";
    const encoder = new TextEncoder()

    const res = await Promise.allSettled(toots.statuses?.map((toot) => {
      const text = toot.content.replace(/<[^>]+>/g, '');
      const postId = toot.id;
      const createdAt = toot.createdAt;
      const authorUsername = toot.account.username;

      const data = {
        PostId: postId,
        Text: text,
        CreatedAt: createdAt,
        AuthorUsername: authorUsername,
      }

      // Prepare data for Kinesis
      const recordParams: PutRecordCommandInput = {
        Data: encoder.encode(JSON.stringify(data)),
        PartitionKey: postId,
        StreamName: kinesisStreamName
      };

      return kinesisClient.send(new PutRecordCommand(recordParams));
    }));

    return {
      statusCode: 200,
      body: "Successfully sent toots to Kinesis",
    };
  } catch (error) {
    console.error("Error processing toots:", error);
    return {
      statusCode: 500,
      body: "Error processing toots",
    };
  }
};
