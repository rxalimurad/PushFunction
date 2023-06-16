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

    // Retrieve the user's FCM tokens from Firestore
    return admin.firestore().collection('users').doc(userId).get()
      .then(doc => {
        const fcmTokens = doc.data().notificationTokens;
        console.log('FCM tokens found for the user.');
        console.log(fcmTokens);
        // if (Array.isArray(fcmTokens) && fcmTokens.length > 0) {
        //   // Send FCM notifications to all tokens
        //   const payload = {
        //     notification: {
        //       title: 'Friend Request',
        //       body: 'Your have new friend'
        //     },
        //     data: {
        //       // Additional data to send with the notification (if needed)
        //       foo: 'bar'
        //     }
        //   };

        //   const sendPromises = fcmTokens.map(token => sendNotification(token, payload));
        //   return Promise.all(sendPromises);
        // } else {
        //   console.error('No FCM tokens found for the user.');
        //   return null;
        // }


      })
      .catch(error => {
        console.error('Error fetching user FCM tokens:', error);
      });
  });
