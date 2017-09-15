module.exports = {
  sendTopicNotification,
  sendDeviceNotification
};

var admin = require("firebase-admin");
var sleep = require('sleep');
var delayed = require('delayed');
var util = require('util');


function initFirebaseAdmin() {
  var serviceAccount = require("./firebase-adminsdk-services.json");

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // databaseURL: "https://example-messaging.firebaseio.com"
  });
}

function sendTopicNotification(params) {
  console.log("sendToTopic: msg=[%s], params=[%s]", params.message, params.topic);

  sanitizeArgs(params);

  // Send a message to devices subscribed to the provided topic.
  admin.messaging().sendToTopic(params.topic, START_NOTIFY_MARKER)
      .then(function(response) {
          // See the MessagingTopicResponse reference documentation for the
          // contents of response.
          console.log("Successfully sent start message", response);
      })
  .catch(function(error) {
      console.log("Error sending message:", error);
  });

  params.current_count = 0;
  sendNotificationMessage(
    params,
    // specific message function
    function(params, payload) {
      return admin.messaging().sendToTopic(params.topic, payload);
    },
    // exit function:
    function() {
      console.log("Sent all messages. Exiting...");
      process.exit(0);
    });
}

function sendDeviceNotification(params) {
  console.log("sendDeviceNotification: msg=[%s], token=[%s]", params.message, params.token);

  sanitizeArgs(params);

  // Send a start message marker
  admin.messaging().sendToDevice(params.token, getStartNotifyMarker(params.count))
      .then(function(response) {

          params.current_count = 1;
          sendNotificationMessage(
            params,
            // notifyFunction:
            function(params, payload) {
              return admin.messaging().sendToDevice(params.token, payload);
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

function sendNotificationMessage(params, notifyFunction, exitFunction) {
    current_count = params.current_count;
    if (current_count > params.count) {
        exitFunction();
        return;
    }

    console.log("Sending Message " + current_count);
    console.log("sendNotificationMessage - message type=%s", params.message)

    var payload = {
        notification: {
            title: "Message #" + current_count,
            body: params.message
        }
    };

    // The notifyFunction could be different depending on the notification type
    notifyFunction(params, payload)
    // Send a message to devices subscribed to the provided topic.
        .then(function(response) {
            // See the MessagingTopicResponse reference documentation for the
            // contents of response.
            console.log("Successfully sent message:", response);
            params.current_count = params.current_count + 1
            delayed.delay(sendNotificationMessage, 1000, {}, params, notifyFunction, exitFunction);
        })
    .catch(function(error) {
        console.log("Error sending message:", error);
    });
}

function sanitizeArgs(params) {

  if (!params.topic) {
    params.topic = "/topics/news";
  } else {
    // sanitize topic by adding the required base qualifier
    params.topic = "/topics/" + params.topic;
  }

  if (!params.count) {
    console.log("Count is invalid!");
    process.exit();
  }

  params.count = parseInt(params.count);

  if (params.count !== params.count) {
    console.log("Count is not a number.  Setting to default (1).");
    // setting count to default value
    params.count = 1;
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

initFirebaseAdmin();
