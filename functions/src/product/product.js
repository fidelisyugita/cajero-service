const { logger, https } = require("firebase-functions/v2");
const { isNil, isEmpty } = require("ramda");

const { v4 } = require("uuid");

const { LIMIT_PER_PAGE } = require("../lib/config");
const { authenticate } = require("../lib/authHelper");
const {
  productsCollection,
  serverTimestamp,
  usersCollection,
} = require("../lib/firebaseHelper");
// const { generatePdfProduct } = require("../lib/pdfHelper");
const { upload } = require("../lib/storageHelper");
const { thinObject, standarizeData } = require("../lib/transformHelper");

const express = require("express");
const app = express();
app.use(authenticate);

app.get("/", async (req, res) => {
  const categoryId = String(req?.query?.categoryId || "");
  const keyword = String(req?.query?.keyword || "").toLowerCase();

  const limit = Number(req?.query?.limit || LIMIT_PER_PAGE);
  const offset = req?.query?.page ? limit * Number(req.query.page) : 0;
  logger.log(
    `GET PRODUCTS BY CATEGORY: "${categoryId}", WITH KEYWORD: "${keyword}", LIMIT: "${limit}", OFFSET: "${offset}"`
  );

  try {
    let productRef = productsCollection;
    if (!isEmpty(categoryId))
      productRef = productsCollection.where("category.id", "==", categoryId);

    const querySnapshot = await productRef
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

    let pId = v4();
    if (req?.body?.id) {
      pId = req?.body?.id;
      delete req?.body?.stock;
      delete req?.body?.sold;
    }

    const vList = body?.variants.map((va) => thinObject(va));

    let data = {
      category: thinObject(body?.category),
      name: body?.name,
      color: body?.color,
      measureUnit: thinObject(body?.measureUnit),
      note: body?.note,

      buyingPrice: body?.buyingPrice,
      sellingPrice: body?.sellingPrice,
      stock: body?.stock,
      sold: body?.sold,

      commission: body?.commission,
      commissionByPercent: body?.commissionByPercent,

      variants: vList,

      nameLowercase: String(body?.name).toLowerCase(),
    };

    Object.keys(data).forEach((key) => isNil(data[key]) && delete data[key]);
    logger.log(`PRODUCT DATA: `, data);

    const doc = await usersCollection.doc(req.user.uid).get();
    const user = {
      id: req.user.uid,
      email: req.user.email,
      name: doc.data().name || "-",
    };
    logger.log(`SAVE PRODUCT BY: `, user);
    data = { ...data, updatedBy: user, updatedAt: serverTimestamp() };

    if (body?.imageBase64) {
      logger.log("UPLOAD IMAGE FOR PRODUCT ID: ", pId);
      const publicUrl = await upload(body.imageBase64, pId, "products/");
      if (publicUrl) data.imageUrl = publicUrl;
    }

    data = {
      ...data,
      isActive: true,
      createdBy: user,
      createdAt: serverTimestamp(),
    };
    const docRef = await productsCollection.doc(pId).set(data, { merge: true });
    data = { ...data, id: docRef.id };

    return res.status(200).json(data);
  } catch (error) {
    logger.error(error.message);
    return res.status(500).json(error);
  }
});

app.get("/:productId", async (req, res) => {
  const productId = req.params.productId;
  logger.log(`GET PRODUCT WITH ID: "${productId}"`);

  try {
    const doc = await productsCollection.doc(productId).get();
    return res.status(200).json(standarizeData(doc.data(), productId));
  } catch (error) {
    logger.error(error.message);
    return res.status(500).json(error);
  }
});

app.delete("/:productId", async (req, res) => {
  const productId = req.params.productId;
  logger.log(`SOFT-DELETE PRODUCT WITH ID: "${productId}"`);

  try {
    await productsCollection
      .doc(productId)
      .set({ isActive: false }, { merge: true });
    return res.status(200).json({ ok: true });
  } catch (error) {
    logger.error(error.message);
    return res.status(500).json(error);
  }
});

// app.post("/pdf/:productId", async (req, res) => {
//   const productId = req.params.productId;
//   logger.log(`GENERATE PDF FOR PRODUCT WITH ID: "${productId}"`);
//   try {
//     const doc = await productsCollection.doc(productId).get();
//     if (!doc.exists) return res.status(405).json(ERROR_MESSAGE.invalidInput);

//     const product = { ...doc.data(), id: doc.id };

//     generatePdfProduct(product, (pdf) => {
//       return res
//         .status(200)
//         .contentType("application/pdf")
//         .attachment(`${product.name} - ${moment().format("D MMM YYYY")}.pdf`)
//         .end(pdf);
//     });
//   } catch (error) {
//     logger.error(error.message);
//     return res.status(500).json(error);
//   }
// });

module.exports = https.onRequest(app);
