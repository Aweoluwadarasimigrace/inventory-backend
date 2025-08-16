const Product = require("../model/product.model");
const cloudinary = require("../utils/cloudinary.config");
const streamifier = require("streamifier");
const getAllProduct = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 0) * limit;
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

    const totalProduct = await Product.countDocuments();

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

    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    // Upload to cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "products" },
        (err, uploadResult) => {
          if (err) {
            console.error("Cloudinary error:", err);
            return reject(err);
          }
          resolve(uploadResult);
        }
      );
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });
    const payload = {
      name,
      category,
      sku,
      quantity,
      price,
      description,
        image: result.secure_url,
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
      .jsonO({ message: "product updated", product: updatedProduct });
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
    const deletedProduct = await Product.findByIdAndUpdate({
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
module.exports = {
  getAllProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
