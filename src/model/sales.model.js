const { default: mongoose } = require("mongoose");


const salesSchema = new mongoose.Schema({
    sku:{
        type: String,
        required: true
    },
    invoiceNo: {
        type: String,
        required: true,
        unique: true
    },
    productName: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    customer: {
        type: String,
        required: true
    },
    salesPrice: {
        type: Number,
        required: true
    },
    totalCost: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    fulfilled: {
        type: Boolean,
        default: false
    },
    teamAdmin:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Auth",
        required: true
    },
    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Auth",
        required: true
    }
}, {
    timestamps: true
}
)

const Sales = mongoose.model("sales", salesSchema);
module.exports = Sales;
