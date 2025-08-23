const Sales = require("../model/sales.model");

const getOverview = (req, res) => {
  // Logic to get report overview
  res.status(200).json({ message: "Report overview" });
};

const getDailySales = async (req, res) => {
  try {
    // Aggregation allows us to process and transform data (like grouping, summing, sorting).
    // The result will be stored in sales.
    const sales = await Sales.aggregate([
      {
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

    res.status(200).json(sales);
  } catch (error) {
    console.error("Error fetching daily sales:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getOverview,
  getDailySales,
};
