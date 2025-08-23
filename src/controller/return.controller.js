const Product = require("../model/product.model");
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
    invoiceNo,
    sku,
    customerName,
    salesPrice,
    returnDate,
    processed,
  } = req.body;
console.log(req.body, "Return body");
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

    const findSale = await Sales.findOne({ invoiceNo });
    console.log(findSale, "Finding sale");
    if (!findSale) {
      return res
        .status(404)
        .json({ message: "Sale not found for this invoice number" });
    }

    if (quantityReturned > findSale.quantity) {
      return res
        .status(400)
        .json({ message: "Return quantity exceeds sold quantity" });
    }

    const totalReturnAmount = Number(quantityReturned) * Number(salesPrice);

    const newReturn = await Return.create({
      SalesId: findSale._id,
      quantityReturned,
      reason,
      invoiceNo,
      sku,
      customerName,
      salesPrice,
      returnDate,
      processed,
      totalReturnAmount,
      teamAdmin: teamAdminId,
      createdBy: req.user._id,
    });


    const product = await Product.findOne({ sku });
    if (product) {
      product.quantity += quantityReturned;
      await product.save();
    }
    sendNotification("new-return", newReturn);

    res
      .status(201)
      .json({ message: "Return created successfully", return: newReturn });
  } catch (error) {
    console.error("Error creating sales return:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


const updateSalesReturn = async (req, res) => {
  const { id } = req.params;
  const { processed, reason } = req.body;

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
    const updatedSalesReturn = await Return.findOneAndUpdate(
      { _id: id, teamAdmin: teamAdminId },
      { processed, reason },
      { new: true }
    );

    if (!updatedSalesReturn) {
      return res.status(404).json({ message: "Sales return not found" });
    }
    sendNotification("update-return", updatedSalesReturn);

    res.status(200).json({
      message: "Sales return updated successfully",
      salesReturn: updatedSalesReturn,
    });
  } catch (error) {
    console.error("Error updating sales return:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteSalesReturn = async (req, res) => {
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
    const deletedSalesReturn = await Return.findOneAndDelete({
      _id: id,
      teamAdmin: teamAdminId,
    });

    if (!deletedSalesReturn) {
      return res.status(404).json({ message: "Sales return not found" });
    }
    sendNotification("delete-return", deletedSalesReturn);

    res.status(200).json({
      message: "Sales return deleted successfully",
      salesReturn: deletedSalesReturn,
    });
  } catch (error) {
    console.error("Error deleting sales return:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createSalesReturn,
  getSalesReturns,
  updateSalesReturn,
  deleteSalesReturn
};
