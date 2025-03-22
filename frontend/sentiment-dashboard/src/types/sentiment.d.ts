export interface SentimentData {
    SentimentScore: {
      M: {
        Neutral: { N: string };
        Negative: { N: string };
        Positive: { N: string };
        Mixed: { N: string };
      };
    };
    DataId: { S: string };
    Text: { S: string };
    Sentiment: { S: string };
    CreatedAt: { S: string };
    AuthorUsername: { S: string };
}

// export interface SentimentData {
//     dataId: string;
//     text: string;
//     sentiment: string;
//     sentimentScore: {
//       neutral: number;
//       negative: number;
//       positive: number;
//       mixed: number;
//     };
// }