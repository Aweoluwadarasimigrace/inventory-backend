const Product = require("../model/product.model");
const Sales = require("../model/sales.model");
const PDFDocument = require("pdfkit-table");
const createSales = async (req, res) => {
  const { sku, productName, quantity, customer, salesPrice, date, fulfilled } =
    req.body;
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
      return res.status(404).json({ error: "Product not found" });
    }

    if (product.quantity < quantity) {
      return res.status(400).json({ error: "Insufficient product quantity" });
    }

    product.quantity -= quantity;
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
    const totalSales = await Sales.countDocuments({ teamAdmin: teamAdminId });

    const sales = await Sales.find({ teamAdmin: teamAdminId }).skip(skip).limit(limit).sort({
      date: -1,
    });
    res.status(200).json({
      total: totalSales,
      page,
      totalPages: Math.ceil(totalSales / limit),
      sales,
    });
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
    fulfilled,
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
    const deletedSale = await Sales.findOneAndDelete({
      _id: id,
      teamAdmin: teamAdminId,
    });

    if (!deletedSale) {
      return res.status(404).json({ message: "Sale not found" });
    }
    res.status(200).json({ message: "Sale deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPdfDownloadSales = async (req, res) => {
  let teamAdminId;
  console.log(req.user);

  if (req.user.role === "admin") {
    teamAdminId = req.user._id;
  } else if (
    req.user.role === "sales representative" ||
    req.user.role === "product manager"
  ) {
    teamAdminId = req.user.createdBy;
  }

  const sales = await Sales.find({ teamAdmin: teamAdminId });

  const doc = new PDFDocument({ margin: 30, size: "A4" });
  //  “Hey browser! I’m sending you a PDF file — not an image, not text, not a video. Just a PDF.”
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", 'attachment; filename="sales.pdf"');

  doc.pipe(res);

  doc.fontSize(16).text("Sales List", { align: "center" });
  doc.moveDown(2);

  // Define table
  const table = {
    headers: [
      "S/N",
      "Date",
      "Product Name",
      "Customer",
      "SKU",
      "Quantity",
      "Sale Price",
      "Total Amount",
      "Fulfilled",
    ],
    rows: sales.map((sale, index) => [
      index + 1,
       new Date(sale.date).toLocaleDateString(),
      sale.productName,
      sale.customer,
      sale.sku,
      sale.quantity,
      sale.salesPrice,
      sale.totalAmount,
      sale.fulfilled,
    ]),
  };

  // Draw table
  await doc.table(table, {
    prepareHeader: () => doc.font("Helvetica-Bold").fontSize(12),
    prepareRow: (row, i) => doc.font("Helvetica").fontSize(10),
  });

  doc.end();
};

module.exports = {
  createSales,
  getSales,
  getPdfDownloadSales,
  updateSale,
  deleteSale,
};
