const { default: mongoose } = require("mongoose");

const returnSchema = new mongoose.Schema({
  SalesId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Sales",
    required: true,
  },
  quantityReturned: { type: Number },
  reason: { type: String },
  invoiceNo: { type: String },
  sku: { type: String },
  customerName: { type: String },
  salesPrice: { type: Number },
  returnDate: { type: Date, required: true },
  processed: { type: Boolean, default: false },
  totalReturnAmount: { type: Number },
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
