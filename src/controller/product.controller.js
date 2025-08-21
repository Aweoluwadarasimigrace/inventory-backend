const Product = require("../model/product.model");
const uploadToCloudinary = require("../utils/cloudinary.config");
const PDFDocument = require("pdfkit-table");
const getAllProduct = async (req, res) => {
  console.log("Fetching all products...");
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

    const totalProduct = await Product.countDocuments({
      teamAdmin: teamAdminId,
    });

    const products = await Product.find({ teamAdmin: teamAdminId })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    if (products.length === 0) {
      return res.status(400).json({ message: "no product created yet" });
    }

    return res.status(200).json({
      total: totalProduct,
      page,
      totalPages: Math.ceil(totalProduct / limit),
      products,
    });
  } catch (error) {
    return res
      .status(400)
      .json({ message: "An error occurred", error: error.message });
  }
};

const createProduct = async (req, res) => {
  const { name, category, sku, quantity, price, description } = req.body;
  console.log(req.body);
  console.log(req.file);
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

    // Upload to cloudinary
    let imageUrl = null;
    if (req.file) {
      console.log("Uploading to Cloudinary...");
      const result = await uploadToCloudinary(req.file.buffer);
      imageUrl = result.secure_url;
    }

    const payload = {
      name,
      category,
      sku,
      quantity,
      price,
      description,
      image: imageUrl,
      teamAdmin: teamAdminId,
      createdBy: req.user._id,
    };

    const products = await Product.create(payload);

    res.status(201).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message || "Server error" });
  }
};

const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, category, sku, quantity, price, description } = req.body;
  console.log(req.body);

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
    let updateData = {
      name,
      category,
      sku,
      quantity,
      price,
      description,
    };
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "products" },
          (err, uploadResult) => {
            if (err) return reject(err);
            resolve(uploadResult);
          }
        );

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });

      updateData.image = result.secure_url;
    }
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: id, teamAdmin: teamAdminId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "failed to update product" });
    }

    res
      .status(200)
      .json({ message: "product updated", product: updatedProduct });
  } catch (error) {
    res.status(500).json({ message: "Update failed", error: error.message });
  }
};

const deleteProduct = async (req, res) => {
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
    const deletedProduct = await Product.findByIdAndDelete({
      _id: id,
      teamAdmin: teamAdminId,
    });

    if (!deletedProduct) {
      return res.status(404).json({ message: "unable to delete product" });
    }
    res.status(200).json({ message: "product deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error deleting user", error: error.message });
  }
};

const getPdfDownloadProduct = async (req, res) => {
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

  const products = await Product.find({ teamAdmin: teamAdminId });

  const doc = new PDFDocument();
  //  “Hey browser! I’m sending you a PDF file — not an image, not text, not a video. Just a PDF.”
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", 'attachment; filename="products.pdf"');

  doc.pipe(res);
  doc.fontSize(16).text("product List", { align: "center" });
  doc.moveDown(2);

  // Define table
  const table = {
    headers: ["S/N", "Product Name", "Category", "SKU", "Quantity", "Price"],
    rows: products.map((product, index) => [
      index + 1,
      product.name,
      product.category,
      product.sku,
      product.quantity,
      product.price,
    ]),
  };

  // Draw table
  await doc.table(table, {
    prepareHeader: () => doc.font("Helvetica-Bold").fontSize(12),
    prepareRow: (row, i) => doc.font("Helvetica").fontSize(10),
  });

  doc.end();
};

// Draw table

module.exports = {
  getAllProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getPdfDownloadProduct,
};
