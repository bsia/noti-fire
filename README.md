# noti-fire
A helper script for sending basic Firebase Admin notifications

## Installation

### Requirements

Below are the node component versions used in testing.  Older versions
may work but were not tested.

* node v8.5.0
* npm v5.3.0

It is recommended to use nvm to install node to be able to more easily manage the various installed node versions.

### Steps

Follow shell commands below for setup instructions:

    git clone <git url>
    cd noti-fire
    npm install -g
    cp $SOURCE/firebase-service-account-xxxxx.json ./firebase-adminsdk-services.json

Note the firebase service account file contains the private key file generated in
the firebase amin console under the *Service Accounts* section.

## Usage

Send a topic notification:

    noti-fire topic -m "Hello everybody" -t "news"

Send a notification to a single device:

    noti-fire device -m "Hello single device" -t <fcm token>


## TODOs

* Add message delay option.
