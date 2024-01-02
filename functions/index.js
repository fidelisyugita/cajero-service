/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// const {onRequest} = require("firebase-functions/v2/https");
// const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
const { initializeApp } = require("firebase-admin/app");
const { setGlobalOptions } = require("firebase-functions/v2");
const firebase = require("firebase/app");

const { REGION, FIREBASE_CONFIG } = require("./src/lib/config");

firebase.initializeApp(FIREBASE_CONFIG);
initializeApp();

setGlobalOptions({ region: REGION });

const master = require("./src/master");

const auto = require("./src/auto");
const auth = require("./src/auth");

const user = require("./src/user");
const attendance = require("./src/attendance");
const dashboard = require("./src/dashboard");

const measureUnit = require("./src/product/measureUnit");

const productCategory = require("./src/product/productCategory");
const product = require("./src/product/product");
const variant = require("./src/product/variant");

const transaction = require("./src/transaction/transaction");
const transactionStatus = require("./src/transaction/transactionStatus");
const transactionType = require("./src/transaction/transactionType");
const paymentMethod = require("./src/transaction/paymentMethod");

// Expose the API as a function
exports.master = master;

exports.auto = auto;
exports.auth = auth;

exports.user = user;
exports.attendance = attendance;
exports.dashboard = dashboard;

exports.productCategory = productCategory;
exports.product = product;
exports.variant = variant;
exports.measureUnit = measureUnit;

exports.transaction = transaction;
exports.transactionStatus = transactionStatus;
exports.transactionType = transactionType;
exports.paymentMethod = paymentMethod;
