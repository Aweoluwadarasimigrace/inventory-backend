const { date } = require("zod/v4");
const Product = require("../model/product.model");
const Sales = require("../model/sales.model");

const createSales = async (req, res) => {
  const {
    sku,
    productName,
    quantity,
    customer,
    salesPrice,
    date,
    fulfilled,
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

    let product = await Product.findOne({ sku , teamAdmin: teamAdminId });
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (product.quantity < quantity) {
      return res.status(400).json({ error: "Insufficient product quantity" });
    }

    product.quantity += quantity;
    await product.save();

    const totalcost = salesPrice * quantity;

    const payload = {
      sku,
      productName,
      quantity,
      customer,
      salesPrice,
      totalCost: totalcost,
      date,
      fulfilled,
      teamAdmin: teamAdminId,
      createdBy: req.user._id,
    };

    const sale = await Sales.create(payload);
    res.status(201).json(sale);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSales = async (req, res) => {
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

    const sales = await Sales.find({ teamAdmin: teamAdminId }).sort({
      date: -1,
    });
    res.status(200).json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateSale = async (req, res) => {
     const { id } = req.params;
  const { customer, date, fulfilled } = req.body;

  let teamAdminId;

  if (req.user.role === "admin") {
    teamAdminId = req.user._id;
  } else if (
    req.user.role === "sales representative" ||
    req.user.role === "product manager"
  ) {
    teamAdminId = req.user.createdBy;
  }

  const updateData = {
    customer,
    date,
    fulfilled
  };

  try {
    const updatedSale = await Sales.findOneAndUpdate(
      { _id: id, teamAdmin: teamAdminId },
      updateData,
      { new: true }
    );
    if (!updatedSale) {
      return res.status(404).json({ error: "Sale not found" });
    }
    res.status(200).json(updatedSale);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteSale = async (req, res) => {
  const { id } = req.params;
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

    const deletedSale = await Sales.findByIdAndDelete({
      _id: id,
      teamAdmin: teamAdminId,
    });
    if (!deletedSale) {
      return res.status(404).json({ error: "Sale not found" });
    }
    res.status(204).json({ message: "Sale deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createSales,
  getSales,
  updateSale,
  deleteSale,
};
