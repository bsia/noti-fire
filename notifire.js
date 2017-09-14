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

  params.count = 3;
  params.current_count = 0;
  sendNotificationMessage(params, function() {
    console.log("Sent all messages. Exiting...");
    process.exit(0);
  })
}

function sendDeviceNotification(msg, params) {

}

var sleep = require('sleep');
var delayed = require('delayed');

function sendNotificationMessage(params, exitFunction) {
    current_count = params.current_count;
    if (current_count > params.count) {
        exitFunction();
        return;
    }

    console.log("Sending Message " + current_count);

    var payload = {
        notification: {
            title: "Message #" + current_count,
            body: "I got that sunshine in my pocket..."
        }
    };

    // Send a message to devices subscribed to the provided topic.
    admin.messaging().sendToTopic(params.topic, payload)
        .then(function(response) {
            // See the MessagingTopicResponse reference documentation for the
            // contents of response.
            console.log("Successfully sent message:", response);
            params.current_count = params.current_count + 1
            delayed.delay(sendNotificationMessage, 1000, {}, params, exitFunction);
        })
    .catch(function(error) {
        console.log("Error sending message:", error);
    });
}
