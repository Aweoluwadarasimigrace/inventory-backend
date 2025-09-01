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

    const totalSales = await Sales.aggregate([
      { $match: { teamAdmin: teamAdminId } },
      {
        $group: {
           _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          totalSales: { $sum: "$totalCost" },
          totalQuantity: { $sum: "$quantity" },
        },
      },
    ]);

    const totalPurchases = await Purchase.aggregate([
      { $match: { teamAdmin: teamAdminId } },
      {
        $group: {
         _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          totalPurchases: { $sum: "$totalcost" },
          totalQuantity: { $sum: "$quantity" },
        },
      },
    ]);

    res.json({
      salesOvertime,
      purchaseOvertime,
      totalSales: totalSales || {},
      totalPurchases: totalPurchases || {},
      revenue: (totalSales?.totalSales || 0) - (totalPurchases?.totalPurchases || 0),
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getDashboardStats,
};
