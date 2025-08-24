const Sales = require("../model/sales.model");

const getOverview = (req, res) => {
  // Logic to get report overview
  try {

    let teamAdminId;

    if(req.user.role === "admin"){
      teamAdminId = req.user._id;
    }else if(req.user.role === "sales representative" || req.user.role === "product manager"){
      teamAdminId = req.user.createdBy;
    }

    const overview = Sales.aggregate([
      {
        $match: { teamAdmin: teamAdminId },
      },
      {
        $group: {
        _id:null,
        totalRevenue: {$sum: "$salesPrice"},
        totalQuantity: {$sum: "$quantity"},
        totalTransactions: {$sum: 1}
      }
      }
    ])

    res.status(200).json(overview[0])
  } catch (error) {
    console.error("Error fetching report overview:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getDailySales = async (req, res) => {
  try {

  let teamAdminId;

  if(req.user.role === "admin"){
    teamAdminId = req.user._id;
  }else if(req.user.role === "sales representative" || req.user.role === "product manager"){
    teamAdminId = req.user.createdBy;
  }
    // Aggregation allows us to process and transform data (like grouping, summing, sorting).
    // The result will be stored in sales.
    const totalSalesDocument = await Sales.countDocuments({teamAdmin: teamAdminId});
    const sales = await Sales.aggregate([
      {
        $match: { teamAdmin: teamAdminId },
        // $group is used to group documents together by a certain key.
        $group: {
          _id: {
            day: { $dayOfMonth: "$date" },
            month: { $month: "$date" },
            year: { $year: "$date" },
          },
          totalSales: { $sum: "$salesPrice" },
          totalQuantity: { $sum: "$quantity" },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
          "_id.day": 1,
        },
      },
    ]);

    res.status(200).json({totalSales: totalSalesDocument, dailySales: sales});
  } catch (error) {
    console.error("Error fetching daily sales:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getMonthlySales = async (req, res) => {
  try {

    let teamAdminId;

    if(req.user.role === "admin"){
      teamAdminId = req.user._id;
    }else if(req.user.role === "sales representative" || req.user.role === "product manager"){
      teamAdminId = req.user.createdBy;
    }

    const totalSalesDocument = await Sales.countDocuments({teamAdmin: teamAdminId});

    const sales = await Sales.aggregate([
      {
        $match: { teamAdmin: teamAdminId },
        $group: {
          _id: {
            month: { $month: "$date" },
            year: { $year: "$date" },
          },
          totalSales: { $sum: "$salesPrice" },
          totalQuantity: { $sum: "$quantity" },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    res.status(200).json({totalSales: totalSalesDocument, monthlySales: sales});
  } catch (error) {
    console.error("Error fetching monthly sales:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getYearlySales = async (req, res) => {
  try {

    let teamAdminId;
    if(req.user.role === "admin"){
      teamAdminId = req.user._id;
    }else if(req.user.role === "sales representative" || req.user.role === "product manager"){
      teamAdminId = req.user.createdBy;
    }

    const sales = await Sales.aggregate([
      {
        $match: { teamAdmin: teamAdminId },
        $group: {
          _id: {
            year: { $year: "$date" },
          },
          totalSales: { $sum: "$salesPrice" },
          totalQuantity: { $sum: "$quantity" },
        },
      },
      {
        $sort: {
          "_id.year": 1,
        },
      },
    ]);

    res.status(200).json({totalSales: totalSalesDocument, yearlySales: sales});
  } catch (error) {
    console.error("Error fetching yearly sales:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getOverview,
  getDailySales,
  getMonthlySales,
  getYearlySales,
};

