const express = require("express")
const { getPdfDownload } = require("../controller/pdfdownload.controller")

const router = express.Router()

router.get("/pdfdocument", getPdfDownload)

module.exports= router