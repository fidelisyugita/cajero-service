exports.FIREBASE_CONFIG = {
  apiKey: "AIzaSyDiHVGQ0uONoh3EFaXSq1j3mHS5xLPBZZg",
  authDomain: "cajero-babi.firebaseapp.com",
  databaseURL: "https://cajero-babi-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "cajero-babi",
  storageBucket: "cajero-babi.appspot.com",
  messagingSenderId: "576542997724",
  appId: "1:576542997724:web:6f04b8aef41285bc728819",
  measurementId: "G-Y9GKQNFZ1Z",
};

exports.REGION = "asia-southeast1";
exports.LIMIT_PER_PAGE = 20;

exports.ERROR_MESSAGE = {
  unauthorized: {
    code: 401,
    message: "Unauthorized",
  },
  invalidToken: {
    code: 405,
    message: "Invalid token",
  },
  invalidEmailPassword: {
    code: 405,
    message: "Invalid email or password",
  },
  invalidInput: {
    code: 405,
    message: "Invalid input",
  },
  invalidImage: {
    code: 405,
    message: "Invalid image",
  },
  alreadyExists: {
    code: 405,
    message: "Data already exists",
  },
};
