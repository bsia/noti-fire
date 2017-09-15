module.exports = {
  sendTopicNotification,
  sendDeviceNotification
};

var admin = require("firebase-admin");
var sleep = require('sleep');
var delayed = require('delayed');
var util = require('util');
var fs = require('fs');
var path = require('path');

function initialize(context) {
  var accountFile = context.account;

  if (!fs.existsSync(accountFile)) {
    console.log("Service account file not exist. Using default...");
    accountFile = "./firebase-adminsdk-services.json";
  }

  console.log("Service account file=[%s]", accountFile);
  var serviceAccount = require(path.resolve( __dirname, accountFile));

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // databaseURL: "https://example-messaging.firebaseio.com"
  });

  sanitizeArgs(context);

  context.current_count = 1;
}

function sendTopicNotification(context) {
  console.log("sendToTopic: msg=[%s], context=[%s]", context.message, context.topic);

  initialize(context);

  // Send a message to devices subscribed to the provided topic.
  admin.messaging().sendToTopic(context.topic, getStartNotifyMarker(context.count))
      .then(function(response) {
          // See the MessagingTopicResponse reference documentation for the
          // contents of response.
          console.log("Successfully sent start message", response);
      })
  .catch(function(error) {
      console.log("Error sending message:", error);
  });

  sendNotificationMessage(
    context,
    // specific message function
    function(context, payload) {
      return admin.messaging().sendToTopic(context.topic, payload);
    },
    // exit function:
    function() {
      console.log("Sent all messages. Exiting...");
      process.exit(0);
    });
}

function sendDeviceNotification(context) {
  console.log("sendDeviceNotification: msg=[%s], token=[%s]", context.message, context.token);

  initialize(context);

  // Send a start message marker
  admin.messaging().sendToDevice(context.token, getStartNotifyMarker(context.count))
      .then(function(response) {
          sendNotificationMessage(
            context,
            // notifyFunction:
            function(context, payload) {
              return admin.messaging().sendToDevice(context.token, payload);
            },
            // exitFunction:
            function() {
              console.log("Sent all messages. Exiting...");
              process.exit(0);
            });
      })
  .catch(function(error) {
      console.log("Error sending message:", error);
  });


}

function sendNotificationMessage(context, notifyFunction, exitFunction) {
    current_count = context.current_count;
    if (current_count > context.count) {
        exitFunction();
        return;
    }

    console.log("sendNotificationMessage: count=[%d]", current_count);

    var payload = {
        notification: {
            title: "Message #" + current_count,
            body: context.message
        }
    };

    // The notifyFunction could be different depending on the notification type
    notifyFunction(context, payload)
    // Send a message to devices subscribed to the provided topic.
        .then(function(response) {
            // See the MessagingTopicResponse reference documentation for the
            // contents of response.
            console.log("sendNotificationMessage: Successfully sent message #" + current_count);
            console.log("sendNotificationMessage: message=%s", context.message)
            console.log("sendNotificationMessage: response: ", response);
            context.current_count = context.current_count + 1
            delayed.delay(sendNotificationMessage, 1000, {}, context, notifyFunction, exitFunction);
        })
    .catch(function(error) {
        console.log("Error sending message:", error);
    });
}

function sanitizeArgs(context) {

  if (!context.topic) {
    context.topic = "/topics/news";
  } else {
    // sanitize topic by adding the required base qualifier
    context.topic = "/topics/" + context.topic;
  }

  // if (!context.count) {
  //   console.log("Count is invalid!");
  // }

  context.count = parseInt(context.count);

  if (context.count !== context.count) {
    console.log("Count is not a number.  Setting to default (1).");
    // setting count to default value
    context.count = 1;
  }
}

function getStartNotifyMarker(expectedCount) {
  var body = util.format("Expected Messages: %d", expectedCount);
  return {
      notification: {
          title: "Start New Batch",
          body: body
      }
  };

}
