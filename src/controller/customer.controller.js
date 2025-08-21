const Customer = require("../model/customer.model");
const PDFDocument = require("pdfkit");

const getAllCustomer = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
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
    const totalCustomer = await Customer.countDocuments({ teamAdmin: teamAdminId });
    const customer = await Customer.find({ teamAdmin: teamAdminId }).skip(skip).limit(limit);
    if (customer.length === 0) {
      return res.status(200).json([]);
    }

    return res.status(200).json({
      total: totalCustomer,
      page,
      totalPages: Math.ceil(totalCustomer / limit),
      customers: customer,
    });
  } catch (error) {
    return res
      .status(400)
      .json({ message: "An error occurred", error: error.message });
  }
};

const createCustomer = async (req, res) => {
  const {
    firstname,
    lastname,
    email,
    contact,
    number,
    countrycode,
    address,
    country,
    state,
    city,
  } = req.body;
  console.log(req.body);
  if (
    !firstname ||
    !lastname ||
    !email ||
    !contact ||
    !number ||
    !countrycode ||
    !address ||
    !country
  ) {
    return res.status(404).json({ message: "please fill out all fields" });
  }

  try {
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res.status(400).json({
        status: "FAILED",
        message: "User Already Registered",
      });
    }
    // this is the admin id that is join them together

    let teamAdminId;

    if (req.user.role === "admin") {
      teamAdminId = req.user._id;
    } else if (
      req.user.role === "sales representative" ||
      req.user.role === "product manager"
    ) {
      teamAdminId = req.user.createdBy;
    }

    const customerData = {
      firstname,
      lastname,
      email,
      contact,
      number,
      countrycode,
      address,
      country,
      state,
      city,
      teamAdmin: teamAdminId,
      createdBy: req.user._id,
    };

    const createdCustomer = await Customer.create(customerData);

    res
      .status(201)
      .json({ message: "user created successfully", createdCustomer });
  } catch (error) {
    return res
      .status(400)
      .json({ message: "an error occured", error: error.message });
  }
};

const editCustomer = async (req, res) => {
  const { id } = req.params;
  console.log(id);
  if (!id) {
    return res.status(400).json({ message: "id is required" });
  }
  const { contact, number, countrycode, address, city, state, country } =
    req.body;
  console.log(req.body);
  const updateCustomer = {};

  let teamAdminId;

  if (req.user.role === "admin") {
    teamAdminId = req.user._id;
  } else if (
    req.user.role === "sales representative" ||
    req.user.role === "product manager"
  ) {
    teamAdminId = req.user.createdBy;
  }

  if (contact) {
    updateCustomer.contact = contact || "";
  }

  if (number) {
    updateCustomer.number = number || "";
  }
  if (countrycode) {
    updateCustomer.countrycode = countrycode || "";
  }
  if (address) {
    updateCustomer.address = address || "";
  }
  if (city) {
    updateCustomer.city = city || "";
  }
  if (state) {
    updateCustomer.state = state || "";
  }
  if (country) {
    updateCustomer.country = country || "";
  }
  try {
    const updatedCustomer = await Customer.findOneAndUpdate(
      { _id: id, teamAdmin: teamAdminId },
      updateCustomer,
      { new: true }
    );

    if (!updatedCustomer) {
      return res
        .status(404)
        .json({ message: "User not found or unauthorized" });
    }

    res
      .status(200)
      .json({ message: "User updated", customer: updatedCustomer });
  } catch (error) {
    res.status(500).json({ message: "Update failed", error: error.message });
  }
};

const deleteCustomer = async (req, res) => {
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
    const deleteCustomer = await Customer.findByIdAndDelete({
      _id: id,
      teamAdmin: teamAdminId,
    });
    if (!deleteCustomer) {
      return res
        .status(404)
        .json({ message: "customer not found or unauthorized" });
    }

    res.status(200).json({ message: "customer deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error deleting user", error: error.message });
  }
};

const getPdfDownloadCustomer = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized - no user data" });
    }

    let teamAdminId;

    if (req.user.role === "admin") {
      teamAdminId = req.user._id;
    } else if (
      req.user.role === "sales representative" ||
      req.user.role === "product manager"
    ) {
      teamAdminId = req.user.createdBy;
    } else {
      return res.status(403).json({ message: "Access denied" });
    }

    const customers = await Customer.find({ teamAdmin: teamAdminId });

    const doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="customer.pdf"');

    doc.pipe(res);
    doc.fontSize(20).text("Customer List", { align: "center" });
    doc.moveDown(2);

    // Define table
    const table = {
      headers: ["S/N", "First Name", "Last Name", "Email", "Contact", "Address", "City", "State", "Country"],
      rows: customers.map((customer, index) => [
        index + 1,
        customer.firstname,
        customer.lastname,
        customer.email,
        customer.contact,
        customer.address,
        customer.city,
        customer.state,
        customer.country
      ]),
    };

    // Draw table
    await doc.table(table, {
      prepareHeader: () => doc.font("Helvetica-Bold").fontSize(12),
      prepareRow: (row, i) => doc.font("Helvetica").fontSize(10),
    });

    doc.end();
  } catch (error) {
    console.error("PDF generation error:", error);
    res.status(500).json({ message: "Failed to generate PDF" });
  }
};

module.exports = {
  getAllCustomer,
  createCustomer,
  editCustomer,
  deleteCustomer,
  getPdfDownloadCustomer,
};
