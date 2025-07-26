const Auth = require("../model/auth.model")
const PDFDocument = require("pdfkit");


const getPdfDownload = async (req, res) => {
  const user = await Auth.find();

  const doc = new PDFDocument();
  //  “Hey browser! I’m sending you a PDF file — not an image, not text, not a video. Just a PDF.”
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", 'attachment; filename="users.pdf"');

  doc.pipe(res)

  doc.fontSize(20).text("user's list", {underline:true})

  user.forEach((user, index)=>{
     doc
    .fontSize(12)
    .text(`${index + 1}. ${user.firstName} ${user.lastName} - ${user.email}`);
  })
  doc.end()
};


module.exports = getPdfDownload