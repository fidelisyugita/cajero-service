const { logger } = require("firebase-functions/v2");
const functions = require("firebase-functions");

const { serverTimestamp, usersCollection } = require("./lib/firebaseHelper");
const { REGION } = require("./lib/config");

const { auth } = functions.region(REGION);

exports.createUser = auth.user().onCreate(async (user) => {
  logger.log(`CREATE USER: `, user);

  const data = {
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    name: user.displayName,
    email: user.email,
    phone: user.phoneNumber,
    role: "STAFF",
    imageUrl: user.photoURL,

    id: user.uid,
    isActive: true,

    nameLowercase: String(user?.displayName).toLowerCase(),
  };

  return usersCollection.doc(user.uid).set(data, { merge: true });
});
