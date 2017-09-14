module.exports = {
  sendTopicNotification,
  sendDeviceNotification
};

var admin = require("firebase-admin");

var serviceAccount = require("./firebase-adminsdk-services.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // databaseURL: "https://example-messaging.firebaseio.com"
});

// See the "Defining the message payload" section below for details
// on how to define a message payload.
var payload1 = {
  data: {
    score: "850",
    time: "2:45"
  }
};

var payload = {
    notification: {
        title: "Start New Batch",
        body:  "==============="
    }
};

function sendTopicNotification(params) {
  console.log("sendToTopic: msg=[%s], params=[%s]", params.message, params.topic);

  if (!params.topic) {
    params.topic = "/topics/news";
  } else {
    // sanitize topic by adding the required base qualifier
    params.topic = "/topics/" + params.topic;
  }


  // Send a message to devices subscribed to the provided topic.
  admin.messaging().sendToTopic(params.topic, payload)
      .then(function(response) {
          // See the MessagingTopicResponse reference documentation for the
          // contents of response.
          console.log("Successfully sent start message", response);
      })
  .catch(function(error) {
      console.log("Error sending message:", error);
  });

  params.count = 1;
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

  // Send a message to devices subscribed to the provided topic.
  admin.messaging().sendToDevice(params.token, payload)
      .then(function(response) {
          // See the MessagingTopicResponse reference documentation for the
          // contents of response.
          console.log("Successfully sent start message", response);
      })
  .catch(function(error) {
      console.log("Error sending message:", error);
  });

  params.count = 3;
  params.current_count = 0;
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
}

var sleep = require('sleep');
var delayed = require('delayed');

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
