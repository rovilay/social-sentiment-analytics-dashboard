## Sentiment Analytics Dashboard

![architecture](/images/architecture.png)

Follow [this article](https://dev.to/ogooluwa/building-a-serverless-social-media-sentiment-analytics-dashboard-on-aws-3a22-temp-slug-4445308?preview=3b4149c1321dbec3b102935a32504817b0b0ff60ff68c810f2ba99014773ccf592e6e8d05e4ba5855600cb8e2ebe0827b18f0a366a42c9eb16d6155f) for more details.

### How to Start:

if you have created the necessary dependencies (mentioned in the article):

* git clone the (repo)[git@github.com:rovilay/social-sentiment-analytics-dashboard.git]
* Navigate to the terminal
* run `pnpm install:all`
* to build and deploy code to s3; run `pnpm build:deploy`
* For frontend
    * reference the `.env.sample` file to create a `.env` file.
    * cd frontend and run `pnpm dev`

