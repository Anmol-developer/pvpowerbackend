require("dotenv").config();
const express = require("express");
const download = express.Router();

// Endpoint to download the Excel file
download.get('/:model',(req,res)=>{
    const {model} = req.params;
    const filePath =
    `C:\\Users\\Hp\\Desktop\\pvcast\\Model\\uploads\\processed_data_${model.toUpperCase()}.csv`; // Update with the actual file path
    res.download(filePath, (err) => {
        if (err) {
          console.log(err);
          res.status(500).send("Error downloading file");
        }
      });
})

module.exports = download;
