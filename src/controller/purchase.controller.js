const Purchase = require("../model/purchase.model");
const sendNotification = require("../pusher/sendnotificaion");
const Product = require("../model/product.model");

const createPurchase = async (req, res) => {
  const {
    sku,
    productName,
    quantity,
    supplier,
    purchasePrice,
    date,
    received,
    paymentStatus,
    paymentMethod,
  } = req.body;

  try {
    let teamAdminId;
    if (req.user.role === "admin") {
      teamAdminId = req.user._id;
    } else if (
      req.user.role === "sales representative" ||
      req.user.role === "product manager"
    ) {
      teamAdminId = req.user.createdBy;
    }

    let product = await Product.findOne({ sku, teamAdmin: teamAdminId });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.quantity += quantity;
    await product.save();

    const totalcost = purchasePrice * quantity;
    const invoiceNo = `INV-${Date.now()}`;

    const payload = {
      sku,
      invoiceNo,
      productName,
      quantity,
      supplier,
      purchasePrice,
      totalcost,
      date,
      received,
      paymentStatus,
      paymentMethod,
      teamAdmin: teamAdminId,
      createdBy: req.user._id,
    };

    const purchase = await Purchase.create(payload);
    sendNotification(`new_purchase_created ${payload.sku}`);
    res.status(201).json( purchase);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPurchases = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    let teamAdminId;

    if (req.user.role === "admin") {
      teamAdminId = req.user._id;
    } else if (
      req.user.role === "sales representative" ||
      req.user.role === "product manager"
    ) {
      teamAdminId = req.user.createdBy;
    }

    const totalPurchases = await Purchase.countDocuments({
      teamAdmin: teamAdminId,
    });
    const purchases = await Purchase.find({ teamAdmin: teamAdminId })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    res.status(200).json({
      total: totalPurchases,
      page,
      totalPages: Math.ceil(totalPurchases / limit),
      purchases,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updatePurchase = async (req, res) => {
  const { id } = req.params;

  const { productName, supplier, received, paymentStatus, paymentMethod } =
    req.body;

  let teamAdminId;

  if (req.user.role === "admin") {
    teamAdminId = req.user._id;
  } else if (
    req.user.role === "sales representative" ||
    req.user.role === "product manager"
  ) {
    teamAdminId = req.user.createdBy;
  }

  try {
    const updatedPurchase = await Purchase.findOneAndUpdate(
      { _id: id, teamAdmin: teamAdminId },
      { productName, supplier, received, paymentStatus, paymentMethod },
      { new: true }
    );
    if (!updatedPurchase) {
      return res.status(404).json({ message: "Purchase not found" });
    }

    sendNotification(`Purchase updated: ${updatedPurchase.sku}`);
    res
      .status(200)
      .json({
        message: "Purchase updated successfully",
        purchase: updatedPurchase,
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deletePurchase = async (req, res) => {
  const { id } = req.params;

  let teamAdminId;
  if (req.user.role === "admin") {
    teamAdminId = req.user._id;
  } else if (
    req.user.role === "sales representative" ||
    req.user.role === "product manager"
  ) {
    teamAdminId = req.user.createdBy;
  }

  try {
    const deletePurchase = await Purchase.findOneAndDelete({
      _id: id,
      teamAdmin: teamAdminId,
    });
    if (!deletePurchase) {
      return res.status(404).json({ message: "Purchase not found" });
    }

    sendNotification(`Purchase deleted: ${deletePurchase.sku}`);
    res.status(200).json({ message: "Purchase deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPurchase,
  getPurchases,
  updatePurchase,
  deletePurchase,
};
