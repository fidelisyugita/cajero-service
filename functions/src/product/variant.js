const { logger, https } = require("firebase-functions/v2");
const R = require("ramda");

const { LIMIT_PER_PAGE } = require("../lib/config");
const { authenticate } = require("../lib/authHelper");
const {
  variantsCollection,
  serverTimestamp,
  usersCollection,
} = require("../lib/firebaseHelper");
const { standarizeData } = require("../lib/transformHelper");

const express = require("express");
const app = express();
app.use(authenticate);

app.get("/", async (req, res) => {
  const keyword = String(req?.query?.keyword || "").toLowerCase();

  const limit = Number(req?.query?.limit || LIMIT_PER_PAGE);
  const offset = req?.query?.page ? limit * Number(req.query.page) : 0;
  logger.log(
    `GET VARIANT WITH KEYWORD: "${keyword}", LIMIT: "${limit}", OFFSET: "${offset}"`
  );

  try {
    const querySnapshot = await variantsCollection
      .where("isActive", "==", true)
      .where("nameLowercase", ">=", keyword)
      .where("nameLowercase", "<=", keyword + "\uf8ff")
      .orderBy("nameLowercase")
      .limit(limit)
      .offset(offset)
      .get();
    const result = querySnapshot.docs.map((doc) =>
      standarizeData(doc.data(), doc.id)
    );

    return res.status(200).json(result);
  } catch (error) {
    logger.error(error.message);
    return res.status(500).json(error);
  }
});

app.post("/", async (req, res) => {
  try {
    const body = req?.body || {};

    const vList = body?.list.map((np) => {
      const res = {
        name: np?.name,
        price: np?.price,
      };
      return res;
    });

    let data = {
      name: body?.name,
      isRequired: body?.isRequired,
      isMultiple: body?.isMultiple,
      description: body?.description,
      list: vList,

      nameLowercase: String(body?.name).toLowerCase(),
    };
    Object.keys(data).forEach((key) => R.isNil(data[key]) && delete data[key]);
    logger.log(`VARIANT DATA: `, data);

    const doc = await usersCollection.doc(req.user.uid).get();
    const user = {
      id: req.user.uid,
      email: req.user.email,
      name: doc.data().name || "-",
    };
    logger.log(`SAVE VARIANT BY: `, user);
    data = { ...data, updatedBy: user, updatedAt: serverTimestamp() };
    if (req?.body?.id) {
      await variantsCollection.doc(req.body.id).set(data, { merge: true });
    } else {
      data = {
        ...data,
        isActive: true,
        createdBy: user,
        createdAt: serverTimestamp(),
      };
      const docRef = await variantsCollection.add(data);
      data = { ...data, id: docRef.id };
    }

    return res.status(200).json(data);
  } catch (error) {
    logger.error(error.message);
    return res.status(500).json(error);
  }
});

app.get("/:variantId", async (req, res) => {
  const variantId = req.params.variantId;
  logger.log(`GET VARIANT WITH ID: "${variantId}"`);

  try {
    const doc = await variantsCollection.doc(variantId).get();
    return res.status(200).json(standarizeData(doc.data(), variantId));
  } catch (error) {
    logger.error(error.message);
    return res.status(500).json(error);
  }
});

app.delete("/:variantId", async (req, res) => {
  const variantId = req.params.variantId;
  logger.log(`SOFT-DELETE VARIANT WITH ID: "${variantId}"`);

  try {
    await variantsCollection
      .doc(variantId)
      .set({ isActive: false }, { merge: true });
    return res.status(200).json({ ok: true });
  } catch (error) {
    logger.error(error.message);
    return res.status(500).json(error);
  }
});

module.exports = https.onRequest(app);
