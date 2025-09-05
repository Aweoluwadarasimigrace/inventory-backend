const Customer = require("../model/customer.model");
const Product = require("../model/product.model");
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
      totalQuantitySold: totalQuantitySold[0],
      totalQuantityPurchased: totalQuantityPurchased[0],
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


const getTotalProduct = async(req,res)=>{
 let teamAdminId;

    if(req.user.role === "admin"){
      teamAdminId = req.user._id;
    }else if(req.user.role === "sales representative" || req.user.role === "product manager"){
      teamAdminId = req.user.createdBy;
    }

try {
  
    const totalProductsInStock = await Product.aggregate([
      { $match: { teamAdmin: teamAdminId } },
      {
        $group: {
          _id: "$sku",
          name: { $first: "$name" },
          totalQuantity: { $sum: "$quantity" },
        },
      },
       { $sort: { totalQuantity: -1 } }
    ]);

    res.json({
      totalProductsInStock: totalProductsInStock,
    });
} catch (error) {
  console.error("Error fetching total products:", error);
}
};


const outofStockProducts = async(req,res)=>{
   let teamAdminId;

    if(req.user.role === "admin"){
      teamAdminId = req.user._id;
    }else if(req.user.role === "sales representative" || req.user.role === "product manager"){
      teamAdminId = req.user.createdBy;
    }

  try {
    const outofStock = await Product.find({teamAdmin: teamAdminId, quantity: 0});
    res.json({count: outofStock.length, items: outofStock})
  } catch (error) {
    console.error("Error fetching out of stock products:", error);
  }
}

const totalCustomer = async(req,res)=>{
   let teamAdminId;

    if(req.user.role === "admin"){
      teamAdminId = req.user._id;
    }else if(req.user.role === "sales representative" || req.user.role === "product manager"){
      teamAdminId = req.user.createdBy;
    }

  try {
    const totalCustomers = await Customer.countDocuments({teamAdmin: teamAdminId});
    res.json({count: totalCustomers});
  } catch (error) {
    console.error("Error fetching total customers:", error);
  }
};

const totalProduct = async(req,res)=>{
 let teamAdminId;

    if(req.user.role === "admin"){
      teamAdminId = req.user._id;
    }else if(req.user.role === "sales representative" || req.user.role === "product manager"){
      teamAdminId = req.user.createdBy;
    }

    try {
      const totalProduct = await Product.countDocuments({teamAdmin: teamAdminId})
      res.json({count: totalProduct})
    } catch (error) {
       console.error("Error fetching total product:", error);
    }

}

const lowStockProducts = async(req,res)=>{

  let teamAdminId;

    if(req.user.role === "admin"){
      teamAdminId = req.user._id;
    }else if(req.user.role === "sales representative" || req.user.role === "product manager"){
      teamAdminId = req.user.createdBy;
    }

  try {
    const lowStock = await Product.find({teamAdmin: teamAdminId, quantity: {$lt: 5}});
    res.json({count: lowStock.length, items: lowStock})
  } catch (error) {
    console.error("Error fetching low stock products:", error);
  }
}

const totalSalesPermonth = async(req,res)=>{

  let teamAdminId;

    if(req.user.role === "admin"){
      teamAdminId = req.user._id;
    }else if(req.user.role === "sales representative" || req.user.role === "product manager"){
      teamAdminId = req.user.createdBy;
    }

  try {
     const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const sales = await Sales.aggregate([

      { $match: { teamAdmin: teamAdminId , date: { $gte: startOfMonth}} },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalCost" },
          totalQuantity: { $sum: "$quantity" }
        },
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({total: sales[0]?.totalSales, totalQuantity: sales[0]?.totalQuantity});
  } catch (error) {
    console.error("Error fetching total sales per month:", error);
  }
};

const topSellingProduct = async (req, res) => {
  let teamAdminId;

  if (req.user.role === "admin") {
    teamAdminId = req.user._id;
  } else if (req.user.role === "sales representative" || req.user.role === "product manager") {
    teamAdminId = req.user.createdBy;
  }

  try {
    const topProduct = await Sales.aggregate([
      { $match: { teamAdmin: teamAdminId } },
      {
        $group: {
          _id: "$sku",
          name: { $first: "$productName" },
          image: {$second: "$image"},
          totalEarned: {$sum: "$totalCost"},
          totalQuantity: { $sum: "$quantity" }
        },
      },
      { $sort: { totalQuantity: -1 } }, 
      { $limit: 7 }
    ]);

    res.json(topProduct);
  } catch (error) {
    console.error("Error fetching top selling product:", error);
  }
};

module.exports = {
  getDashboardStats,
  getTotalProduct,
  outofStockProducts,
  totalCustomer,
  totalProduct,
  lowStockProducts,
  totalSalesPermonth,
  topSellingProduct
};
