const Return = require("../model/return.model");
const Sales = require("../model/sales.model");
const sendNotification = require("../pusher/sendnotificaion");

const getSalesReturns = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    let teamAdminId;

    if (req.user.role === "admin") {
      teamAdminId = req.user._id;
    } else if (
      req.user.role === "product manager" ||
      req.user.role === "sales representative"
    ) {
      teamAdminId = req.user.createdBy;
    }

    const totalReturns = await Return.countDocuments({
      teamAdmin: teamAdminId,
    });

    const returns = await Return.find({ teamAdmin: teamAdminId })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    res.status(200).json({
      total: totalReturns,
      page,
      totalPages: Math.ceil(totalReturns / limit),
      returns,
    });
  } catch (error) {
    console.error("Error retrieving sales returns:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const createSalesReturn = async (req, res) => {
  const {
    quantityReturned,
    reason,
    sku,
    customerName,
    salesPrice,
    returnDate,
    processed,
  } = req.body;

  try {
    let teamAdminId;

    if (req.user.role === "admin") {
      teamAdminId = req.user._id;
    } else if (
      req.user.role === "product manager" ||
      req.user.role === "sales representative"
    ) {
      teamAdminId = req.user.createdBy;
    }

    const findSale = await Sales.findOne({ sku, customerName, salesPrice });

    if (!findSale) {
      return res
        .status(404)
        .json({ message: "Sale not found for this SKU and Customer" });
    }

    if (quantityReturned > findSale.quantity) {
      return res
        .status(400)
        .json({ message: "Return quantity exceeds sold quantity" });
    }

    const totalReturnAmount = quantityReturned * salesPrice;

    const newReturn = await Return.create({
      SalesId: findSale._id,
      quantityReturned,
      reason,
      sku,
      customerName,
      salesPrice,
      returnDate,
      processed,
      totalReturnAmount,
      teamAdmin: teamAdminId,
      createdBy: req.user._id,
    });
    sendNotification("new-return", newReturn);

    res
      .status(201)
      .json({ message: "Return created successfully", return: newReturn });
  } catch (error) {
    console.error("Error creating sales return:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createSalesReturn,
  getSalesReturns
};
