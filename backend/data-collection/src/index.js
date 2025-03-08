"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
var client_kinesis_1 = require("@aws-sdk/client-kinesis");
var client_secrets_manager_1 = require("@aws-sdk/client-secrets-manager");
var twitter_api_v2_1 = require("twitter-api-v2");
var kinesisClient = new client_kinesis_1.KinesisClient({});
var secretsManagerClient = new client_secrets_manager_1.SecretsManagerClient({});
var handler = function (event) { return __awaiter(void 0, void 0, void 0, function () {
    var secretResponse, secrets, twitterClient, tweets, kinesisStreamName_1, encoder_1, error_1;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 4, , 5]);
                return [4 /*yield*/, secretsManagerClient.send(new client_secrets_manager_1.GetSecretValueCommand({ SecretId: "tweet-sentiment-twitter-api-keys" }))];
            case 1:
                secretResponse = _b.sent();
                secrets = JSON.parse(secretResponse.SecretString || "{}");
                twitterClient = new twitter_api_v2_1.default({
                    appKey: secrets.TWITTER_API_KEY,
                    appSecret: secrets.TWITTER_API_SECRET,
                });
                return [4 /*yield*/, twitterClient.v2.get("tweets/search/recent", {
                        query: "#crypto OR #bitcoin OR #solana OR #ethereum",
                        max_results: 100,
                    })];
            case 2:
                tweets = _b.sent();
                console.log("Tweet response:", tweets);
                kinesisStreamName_1 = "TweetStream";
                encoder_1 = new TextEncoder();
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
                return [4 /*yield*/, Promise.allSettled((_a = tweets.data) === null || _a === void 0 ? void 0 : _a.map(function (tweet) {
                        var recordParams = {
                            Data: encoder_1.encode(),
                            PartitionKey: tweet.id,
                            StreamName: kinesisStreamName_1,
                        };
                        return kinesisClient.send(new client_kinesis_1.PutRecordCommand(recordParams));
                    }))];
            case 3:
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
                _b.sent();
                return [2 /*return*/, {
                        statusCode: 200,
                        body: "Successfully sent tweets to Kinesis",
                    }];
            case 4:
                error_1 = _b.sent();
                console.error("Error processing tweets:", error_1);
                return [2 /*return*/, {
                        statusCode: 500,
                        body: "Error processing tweets",
                    }];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.handler = handler;
