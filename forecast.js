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
// const formatedDate=(date)=>{
//   const temp = new Date(date);
//   const month = String(temp.getMonth()+1).padStart(2, "0")
//   const day = String(temp.getDate()).padStart(2,"0")
//   const year = temp.getFullYear();
//   return `${month}/${day}/${year}`
// }

router.post("/:userId", async (req, res) => {
  const { userId } = req.params;
  const { NextDate } = req.body;
  const time_array = [
    "07:00:00",
    "07:15:00",
    "07:30:00",
    "07:45:00",
    "08:00:00",
    "08:15:00",
    "08:30:00",
    "08:45:00",
    "09:00:00",
    "09:15:00",
    "09:30:00",
    "09:45:00",
    "10:00:00",
    "10:15:00",
    "10:30:00",
    "10:45:00",
    "11:00:00",
    "11:15:00",
    "11:30:00",
    "11:45:00",
    "12:00:00",
    "12:15:00",
    "12:30:00",
    "12:45:00",
    "13:00:00",
    "13:15:00",
    "13:30:00",
    "13:45:00",
    "14:00:00",
    "14:15:00",
    "14:30:00",
    "14:45:00",
    "15:00:00",
    "15:15:00",
    "15:30:00",
    "15:45:00",
    "16:00:00",
    "16:15:00",
    "16:30:00",
    "16:45:00",
    "17:00:00",
  ];

  try {
    const extractedData = [];
    for (let i = 0; i < time_array.length; i++) {
      extractedData[i] = {
        date:NextDate,
        time: time_array[i],
      };
    }

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

      for (let index = 0; index < time_array.length; index++) {
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
