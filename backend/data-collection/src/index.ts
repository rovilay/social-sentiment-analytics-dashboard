import { KinesisClient, PutRecordCommand, PutRecordCommandInput } from "@aws-sdk/client-kinesis";
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import Twitter from "twitter-api-v2";

const kinesisClient = new KinesisClient({});
const secretsManagerClient = new SecretsManagerClient({});

export const handler = async (event: any) => {
  try {
    // 1. Retrieve Twitter API credentials from Secrets Manager
    const secretResponse = await secretsManagerClient.send(
      new GetSecretValueCommand({ SecretId: "tweet-sentiment-twitter-api-keys" })
    );
    const secrets = JSON.parse(secretResponse.SecretString || "{}");
    const twitterClient = new Twitter({
      appKey: secrets.TWITTER_API_KEY,
      appSecret: secrets.TWITTER_API_SECRET,
    });

    // 2. Fetch tweets based on your criteria (e.g., keywords, hashtags)
    const tweets = await twitterClient.v2.get<{ data: any[] }>("tweets/search/recent", {
      query: "#crypto OR #bitcoin OR #solana OR #ethereum",
      max_results: 100,
    });

    console.log("Tweet response:", tweets); 

    // 3. Iterate through tweets and send them to Kinesis
    const kinesisStreamName = "TweetStream";
    const encoder = new TextEncoder()
    
    // for (const tweet of tweets.data) {
    //     // const blob = new Blob([JSON.stringify(tweet, null, 2)], {
    //     //     type: "application/json",
    //     // });
          
        // const recordParams: PutRecordCommandInput = {
        //     Data: encoder.encode(),
        //     PartitionKey: tweet.id,
        //     StreamName: kinesisStreamName,
        // };
        // await kinesisClient.send(new PutRecordCommand(recordParams));
    // }

    await Promise.allSettled(tweets.data?.map((tweet) => {
        const recordParams: PutRecordCommandInput = {
            Data: encoder.encode(),
            PartitionKey: tweet.id,
            StreamName: kinesisStreamName,
        };

        return kinesisClient.send(new PutRecordCommand(recordParams));
    }))

    return {
      statusCode: 200,
      body: "Successfully sent tweets to Kinesis",
    };
  } catch (error) {
    console.error("Error processing tweets:", error);
    return {
      statusCode: 500,
      body: "Error processing tweets",
    };
  }
};
