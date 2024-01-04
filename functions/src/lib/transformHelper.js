const { isSameDay } = require("./utils");

exports.thinObject = (obj) => {
  if (obj && obj.id) return { id: obj.id, name: obj.name };
  return null;
};

exports.thinContact = (obj) => {
  if (obj && obj.id)
    return {
      id: obj.id,
      name: obj.name,
      phone: obj.phone,
      address: obj.address,
      note: obj.note,
      description: obj.description,
      email: obj.email,
      alias: obj.alias,
      merchant: obj.merchant,
    };
  return null;
};

exports.thinTransactionProduct = (obj) => {
  const sVariants = obj?.selectedVariants.map((svar) => {
    const vList = svar?.list.map((np) => {
      const res = {
        name: np?.name,
        price: np?.price,
      };
      return res;
    });

    const res = {
      name: svar?.name,
      list: vList,
    };
    return res;
  });

  return {
    id: obj.id,
    name: obj.name,
    note: obj.note,
    buyingPrice: Number(obj.buyingPrice || 0),
    sellingPrice: Number(obj.sellingPrice || 0), // plus variants price

    commission: obj.commissionByPercent
      ? Number(obj.buyingPrice / obj.commissionByPercent || 0)
      : obj.commission,

    selectedVariants: sVariants,

    amount: Number(obj.amount || 0),
  };
};

exports.standarizeData = (docData, id) => {
  const data = {
    ...docData,
    createdAt: docData.createdAt.toDate(),
    updatedAt: docData.updatedAt.toDate(),
    id: id,
  };
  return data;
};

exports.standarizeUser = (docData, id) => {
  let data = this.standarizeData(docData, id);
  if (data?.lastAttend) {
    const attendDate = data.lastAttend.toDate();
    data.lastAttend = attendDate;
    data.isAttendToday = isSameDay(attendDate, new Date());
  } else {
    data.lastAttend = null;
    data.isAttendToday = false;
  }
  return data;
};
