const { default: mongoose } = require("mongoose");

const purchaseSchema = new mongoose.Schema({
  sku: { type: String, required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  supplier: { type: String, required: true },
  purchasePrice: { type: Number, required: true },
  totalCost: { type: Number, required: true }, // quantity * price (+tax if you add later)
  date: { type: Date, required: true }, // chosen by user, not auto
  received: { type: Boolean, default: false }, // track if item delivered
  teamAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Auth",
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Auth",
    required: true,
  },
}, {
    timestamps: true
}
);
const Purchase = mongoose.model("Purchase", purchaseSchema);

module.exports = Purchase;
