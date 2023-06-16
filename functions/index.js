const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const sendNotification = (registrationToken, payload) => {
  const message = {
    token: registrationToken,
    notification: payload.notification,
    data: payload.data
  };

  return admin.messaging().send(message);
};

exports.listFriendRequest = functions.firestore
  .document('users/{userId}')
  .onUpdate((change, context) => {
    const userId = context.params.userId;
    const newData = change.after.data();
    const previousData = change.before.data();

    if ((!previousData.friends && newData.friends) || (newData.friends.length > previousData.friends.length)) {
    // Retrieve the user's FCM tokens from Firestore
    return admin.firestore().collection('users').doc(userId).get()
      .then(doc => {
        const fcmTokens = doc.data().notificationTokens;
        console.log('FCM tokens found for the user.');
        console.log(fcmTokens);
        console.log(Array.isArray(fcmTokens));
        console.log(fcmTokens);
        if (Array.isArray(fcmTokens) && fcmTokens.length > 0) {
          // Send FCM notifications to all tokens
          console.log('FCM tokens is array');
          const payload = {
            notification: {
              title: 'Friend Request',
              body: 'Your have new friend request'
            },
            data: {
              foo: 'bar'
            }
          };

          const sendPromises = fcmTokens.map(token => sendNotification(token, payload));
          return Promise.all(sendPromises)
          .then(() => {
            console.log('Notifications sent successfully.');
          })
          .catch(error => {
            console.error('Error sending notifications:', error);
          });
        } else {
          console.error('No FCM tokens found for the user.');
        }


      })
      .catch(error => {
        console.error('Error fetching user FCM tokens:', error);
      });
      
    } else {
        const acceptedFriendsnew = newData.friends.filter(friend => friend.status === "ACCEPTED");
        const acceptedFriendsold = previousData.friends.filter(friend => friend.status === "ACCEPTED");
        if (acceptedFriendsnew.length > acceptedFriendsold.length) {
            return admin.firestore().collection('users').doc(userId).get()
      .then(doc => {
        const fcmTokens = doc.data().notificationTokens;
        console.log('FCM tokens found for the user.');
        console.log(fcmTokens);
        console.log(Array.isArray(fcmTokens));
        console.log(fcmTokens);
        if (Array.isArray(fcmTokens) && fcmTokens.length > 0) {
          // Send FCM notifications to all tokens
          console.log('FCM tokens is array');
          const payload = {
            notification: {
              title: 'Friend Request Accepted',
              body: 'Your have new friend'
            },
            data: {
              foo: 'bar'
            }
          };

          const sendPromises = fcmTokens.map(token => sendNotification(token, payload));
          return Promise.all(sendPromises)
          .then(() => {
            console.log('Notifications sent successfully.');
          })
          .catch(error => {
            console.error('Error sending notifications:', error);
          });
        } else {
          console.error('No FCM tokens found for the user.');
        }


      })
      .catch(error => {
        console.error('Error fetching user FCM tokens:', error);
      });
        }

    }
  });
