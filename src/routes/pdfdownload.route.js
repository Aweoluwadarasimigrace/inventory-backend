const express = require("express")
const router = express.Router()
const getPdfDownload = require("../controller/pdfdownload.controller")
router.get("/pdfdocument", getPdfDownload)

module.exports= router