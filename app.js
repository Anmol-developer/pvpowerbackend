require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const { User } = require("./schema/UserSchema");
const fs = require("fs");
const XLSX = require("xlsx");

app.use(cors());
app.use(express.json());

const uri = process.env.URI;

mongoose.set("strictQuery", false);
mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("connected!");
  });

app.post("/", (req, res) => {
  const { name, email, password } = req.body;
  User.findOne({ email })
    .then((data) => {
      if (data) {
        console.log("user already exists");
      } else {
        User.create({ name, email, password })
          .then((data) => {
            console.log(data);
            console.log(data.id);
          })
          .catch((err) => console.log(err));
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/log", (req, res) => {
  const filePath = "C:\\Users\\Hp\\Downloads\\trial_forecast.xlsx";
  const workbook = XLSX.readFile(filePath);
  const binaryData = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }); // to store in mongoDB
  const ForecastSheetName = workbook.SheetNames[0];
  const ForecastSheet = workbook.Sheets[ForecastSheetName];
  const excelData = XLSX.utils.sheet_to_json(ForecastSheet, { header: 1 });
  const extractedData = excelData.slice(1).map((row) => {
    const numericValue = parseFloat(row[2]);
      const dateObject = XLSX.SSF.parse_date_code(numericValue);
      
      return {
        date: `${String(dateObject.m).padStart(2, "0")}/${String(
          dateObject.d
        ).padStart(2, "0")}/${String(dateObject.y)}`,
        time: dateObject.H + ":" + dateObject.M + ":" + dateObject.S,
        ActualPV: row[0],
        PredictedPV : row[1]
      };
  })

  res.send(extractedData);

  // console.log(workbook);
});

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.listen(5000, () => {
  console.log("app listening on port 5000");
});
