const { logger, https } = require("firebase-functions/v2");
const { ERROR_MESSAGE } = require("../src/lib/config");
const { usersCollection, fauth } = require("../src/lib/firebaseHelper");
const { standarizeUser } = require("./lib/transformHelper");

// const admin = require("firebase-admin");
// if (!admin.apps.length) admin.initializeApp();

const R = require("ramda");

// LOGIN START
exports.login = https.onRequest(async (req, res) => {
  logger.log(`LOGIN USING rawBody: `, req.rawBody);
  logger.log(`LOGIN USING query: `, req.query);
  const { email, password } = req.body;
  logger.log(`LOGIN USING EMAIL: "${email}"`);

  if (R.isEmpty(email) || R.isEmpty(password)) {
    return res.status(405).json(ERROR_MESSAGE.invalidEmailPassword);
  }

  try {
    const userCredential = await fauth.signInWithEmailAndPassword(
      fauth.getAuth(),
      email,
      password
    );
    const { uid, stsTokenManager } = userCredential.user;

    const promises = [];
    promises.push(usersCollection.doc(uid).get());
    // promises.push(admin.auth().createCustomToken(uid));
    const promisesResult = await Promise.all(promises);

    const data = {
      user: standarizeUser(promisesResult[0].data(), uid),
      // customToken: promisesResult[1],
      accessToken: stsTokenManager.accessToken,
      refreshToken: stsTokenManager.refreshToken,
    };
    return res.status(200).json(data);
  } catch (error) {
    logger.error(error.message);
    return res.status(500).json(error);
  }
});
// LOGIN END

exports.logout = https.onRequest(async (req, res) => {
  try {
    await fauth.signOut(fauth.getAuth());
    return res.status(200).json({ ok: true });
  } catch (error) {
    logger.error(error.message);
    return res.status(500).json(error);
  }
});

exports.resetPassword = https.onRequest(async (req, res) => {
  const { email } = req.body;
  if (R.isEmpty(email)) return res.status(405).json(ERROR_MESSAGE.invalidInput);

  try {
    await fauth.sendPasswordResetEmail(fauth.getAuth(), email);
    return res.status(200).json({ ok: true });
  } catch (error) {
    logger.error(error.message);
    return res.status(500).json(error);
  }
});
