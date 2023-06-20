require("dotenv").config();
const express = require("express");
const router = express.Router();
const { User } = require("./schema/UserSchema");
const xlsx = require("xlsx");

const model = ["randomforest", "knn", "lgbm", "svr"];
const path = [
  "C:\\Users\\Hp\\Desktop\\pvcast\\Model\\uploads\\processed_data_RF.csv",
  "C:\\Users\\Hp\\Desktop\\pvcast\\Model\\uploads\\processed_data_KNN.csv",
  "C:\\Users\\Hp\\Desktop\\pvcast\\Model\\uploads\\processed_data_LGBM.csv",
  "C:\\Users\\Hp\\Desktop\\pvcast\\Model\\uploads\\processed_data_SVR.csv",
];

router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  // const {model} = req.query;
  const filePath = "C:\\Users\\Hp\\Downloads\\test.xlsx"; // for date and time
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    const extractedData = jsonData.slice(1).map((row) => {
      const numericValue = parseFloat(row[3]);
      const dateObject = xlsx.SSF.parse_date_code(numericValue);

      return {
        date: `${String(dateObject.m).padStart(2, "0")}/${String(
          dateObject.d
        ).padStart(2, "0")}/${String(dateObject.y)}`,
        time: dateObject.H + ":" + dateObject.M + ":" + dateObject.S,
      };
    });

    const data = {
      date: new Date(),
      randomforest: [],
      knn: [],
      lgbm: [],
      svr: [],
    };
    for (let i = 0; i < model.length; i++) {
      const filePath2 = path[i];
      const workbook2 = xlsx.readFile(filePath2);
      const sheetName2 = workbook2.SheetNames[0];
      const worksheet2 = workbook2.Sheets[sheetName2];
      const jsonData2 = xlsx.utils.sheet_to_json(worksheet2);

      for (let index = 0; index < jsonData.length - 1; index++) {
        const Predictedpv = jsonData2[index];
        if (Predictedpv) {
          if (i === 0) {
            data.randomforest[index] = {
              ...extractedData[index],
              PredictedPV: Predictedpv[0],
            };
          } else if (i === 1) {
            data.knn[index] = {
              ...extractedData[index],
              PredictedPV: Predictedpv[0],
            };
          } else if (i === 2) {
            data.lgbm[index] = {
              ...extractedData[index],
              PredictedPV: Predictedpv[0],
            };
          } else {
            data.svr[index] = {
              ...extractedData[index],
              PredictedPV: Predictedpv[0],
            };
          }
        }
      }
    }

    const updateData = await User.findById(userId);
    if (!updateData) {
      return res.status(404).json({ error: "User not found" });
    }
    updateData.PredictedData.push(data);
    updateData.isCalcDone = true;
    await updateData.save();

    // Send status 200
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error reading Excel file");
  }
}); //ok for now

router.get("/data/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const data = await User.findById(userId);
    res.send(data.PredictedData);
  } catch (error) {
    console.log(error);
  }
}); //ok for

module.exports = router;
