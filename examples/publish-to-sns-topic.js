#! /usr/bin/env node
// Publishes an SNS notification when the content of a resource changes.
// Assumes the following environment variables are set for AWS access:
//  AWS_ACCESS_KEY_ID
//  AWS_SECRET_ACCESS_KEY

var changed = require('..');
var AWS = require('aws-sdk');

// set a valid SNS topic and region
var topicArn = 'some-sns-topic-arn';
var region = 'us-west-2';

AWS.config.update({region: region});

var sns = new AWS.SNS();
var resource = new changed.Resource('http://www.example.com');

resource.on('changed', function (current, previous) {
  sns.publish({
    Message: 'Resource http://www.example.com changed',
    TopicArn: topicArn
  });
}); 

resource.on('error', function (error) {
  console.error(error.message);
});

resource.startPolling(5000);