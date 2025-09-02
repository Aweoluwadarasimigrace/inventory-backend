const Purchase = require("../model/purchase.model");
const Sales = require("../model/sales.model");

const getDashboardStats = async (req, res) => {
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

    const salesOvertime = await Sales.aggregate([
      { $match: { teamAdmin: teamAdminId } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          sales: { $sum: "$totalCost" },
          totalQuantity: { $sum: "$quantity" },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 7 },
    ]);

    const purchaseOvertime = await Purchase.aggregate([
      { $match: { teamAdmin: teamAdminId } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          purchases: { $sum: "$totalcost" },
          totalQuantity: { $sum: "$quantity" },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 7 },
    ]);

    // Sales = Revenue
const totalSales = await Sales.aggregate([
  { $match: { teamAdmin: teamAdminId } },
  {
    $group: {
      _id: { $dateToString: { format: "%Y-%m", date: "$date" } }, // Group by Year-Month
      totalRevenue: { $sum: "$totalCost" }, // revenue earned
    },
  },
  { $sort: { _id: 1 } } // Sort by month
]);

// Purchases = Cost
const totalPurchases = await Purchase.aggregate([
  { $match: { teamAdmin: teamAdminId } },
  {
    $group: {
      _id: { $dateToString: { format: "%Y-%m", date: "$date" } }, // Group by Year-Month
      totalCost: { $sum: "$totalcost" }, // money spent
    },
  },
  { $sort: { _id: 1 } }
]);



const totalQuantitySold = await Sales.aggregate([
  { $match: { teamAdmin: teamAdminId } },
  {
    $group: {
      _id: null,
      totalQuantity: { $sum: "$quantity" },
    },
  },
  { $sort: { _id: 1 } }
]);

const totalQuantityPurchased = await Purchase.aggregate([
  { $match: { teamAdmin: teamAdminId } },
  {
    $group: {
      _id: null,
      totalQuantity: { $sum: "$quantity" },
    },
  },
  { $sort: { _id: 1 } }
]);

    res.json({
      salesOvertime,
      purchaseOvertime,
      totalSales: totalSales || {},
      totalPurchases: totalPurchases || {},
      totalQuantitySold: totalQuantitySold || {},
      totalQuantityPurchased: totalQuantityPurchased || {},
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getDashboardStats,
};
