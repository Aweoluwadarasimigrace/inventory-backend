const Return = require("../model/return.model");
const Sales = require("../model/sales.model");
const sendNotification = require("../pusher/sendnotificaion");
const Product = require("../model/product.model");
const PDFDocument = require("pdfkit-table");

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

    const salesReturns = await Return.find({ teamAdmin: teamAdminId })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    res.status(200).json({
      total: totalReturns,
      page,
      totalPages: Math.ceil(totalReturns / limit),
      salesReturns,
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
    productName,
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

    const totalReturnAmount = Number(salesPrice) * Number(quantityReturned);

    const newReturn = await Return.create({
      SalesId: findSale._id,
      quantityReturned,
      reason,
      invoiceNo,
      sku,
      productName,
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
  const { processed, reason, customerName, productName } = req.body;

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
      { processed, reason, customerName, productName },
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

export const getSalesReturnPdf = async (req, res) => {
 

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

    const returns = await Return.find({ teamAdmin: teamAdminId });

    const doc = new PDFDocument({ margin: 30, size: "A4" });
    //  “Hey browser! I’m sending you a PDF file — not an image, not text, not a video. Just a PDF.”
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="sales Return.pdf"');
  
    doc.pipe(res);
  
    doc.fontSize(16).text("Sales Return", { align: "center" });
    doc.moveDown(2);
  
    // Define table
    const table = {
      headers: [
        "S/N",
        "Date",
        "Quantity Returned",
        "Reason",
        "Invoice No",
        "SKU",
        "Product Name",
        "Customer Name",
        "Sale Price",
        "Processed",
         "Total Amount",
      ],
      rows: returns.map((returnItem, index) => [
        index + 1,
        new Date(returnItem.returnDate).toLocaleDateString(),
        returnItem.quantityReturned,
        returnItem.reason,
        returnItem.invoiceNo,
        returnItem.sku,
        returnItem.productName,
        returnItem.customerName,
        returnItem.salesPrice,
        returnItem.processed,
        returnItem.totalReturnAmount,
      ]),
    };
  
    // Draw table
    await doc.table(table, {
      prepareHeader: () => doc.font("Helvetica-Bold").fontSize(12),
      prepareRow: (row, i) => doc.font("Helvetica").fontSize(10),
    });
  
    doc.end();
}

module.exports = {
  createSalesReturn,
  getSalesReturns,
  updateSalesReturn,
  deleteSalesReturn,
  getSalesReturnPdf
};
