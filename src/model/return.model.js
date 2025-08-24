const { default: mongoose } = require("mongoose");

const returnSchema = new mongoose.Schema({
  SalesId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Sales",
    required: true,
  },
  quantityReturned: { type: Number, required: true },
  reason: { type: String, required: true },
  invoiceNo: { type: String, required: true },
  sku: { type: String, required: true },
  productName: { type: String, required: true },
  customerName: { type: String, required: true },
  salesPrice: { type: Number, required: true },
  returnDate: { type: Date, required: true },
  processed: { type: Boolean, default: false },
  totalReturnAmount: { type: Number, required: true },
  teamAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Auth",
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Auth",
    required: true
       }
});

const Return = mongoose.model("Return", returnSchema);

module.exports = Return;
