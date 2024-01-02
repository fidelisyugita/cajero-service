const { FIREBASE_CONFIG } = require("./config");

// const firebase = require("firebase/app");
// firebase.initializeApp(FIREBASE_CONFIG);

const fauth = require("firebase/auth");

// const admin = require("firebase-admin");
// if (!admin.apps.length) admin.initializeApp();

const { firestore, storage } = require("firebase-admin");

// const {firestore, storage} = admin;
const { arrayUnion, arrayRemove, serverTimestamp, increment } =
  firestore.FieldValue;

const storageBucket = storage().bucket(FIREBASE_CONFIG.storageBucket);

const db = firestore();
db.settings({ ignoreUndefinedProperties: true });
// MASTER START
const configDoc = db.collection("master").doc("config");
const inventoryDoc = db.collection("master").doc("inventory");

const measureUnitsCollection = db.collection("measureUnits");
const productCategoriesCollection = db.collection("productCategories");
const variantsCollection = db.collection("variants");
const transactionStatusesCollection = db.collection("transactionStatuses");
const paymentMethodCollection = db.collection("paymentMethod");
const transactionTypesCollection = db.collection("transactionTypes");
const buyingStatusesCollection = db.collection("buyingStatuses");
const buyingTypesCollection = db.collection("buyingTypes");
// MASTER END

const usersCollection = db.collection("users");
const contactsCollection = db.collection("contacts");
const attendancesCollection = db.collection("attendances");

const productsCollection = db.collection("products");
const transactionsCollection = db.collection("transactions");
const buyingsCollection = db.collection("buyings");

module.exports = {
  storageBucket,

  arrayUnion,
  arrayRemove,
  serverTimestamp,
  increment,

  configDoc,
  inventoryDoc,

  measureUnitsCollection,
  productCategoriesCollection,
  variantsCollection,
  transactionStatusesCollection,
  paymentMethodCollection,
  transactionTypesCollection,
  buyingStatusesCollection,
  buyingTypesCollection,

  usersCollection,
  contactsCollection,
  attendancesCollection,

  productsCollection,
  transactionsCollection,
  buyingsCollection,

  fauth,
};
