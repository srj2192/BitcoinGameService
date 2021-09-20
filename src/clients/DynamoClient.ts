import {  DynamoDB } from "@aws-sdk/client-dynamodb";

const client = new DynamoDB({ region: "eu-west-1" });

export default client;



