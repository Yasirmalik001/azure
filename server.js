require("dotenv").config();
const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
  })
);
app.use(bodyParser.json());

async function submitToZoho(data) {
  try {
    const response = await axios.post(
      `${process.env.ZOHO_API_URL}?auth_type=apikey&zapikey=${process.env.ZOHO_API_KEY}`,
      { data: [data] },
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${process.env.ZOHO_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error submitting to Zoho:",
      error.response ? error.response.data : error.message
    );
    throw new Error("Error submitting to Zoho");
  }
}

app.post("/submit-form", async (req, res) => {
  try {
    const formData = {
      Last_Name: req.body.lastName,
      First_Name: req.body.firstName,
      Email: req.body.email,
      Phone: req.body.phone,
      Description: req.body.description,
      Zip_Code: req.body.zip,
      Selected_Options: req.body.selectedOptions,
    };
    const zohoResponse = await submitToZoho(formData);
    res
      .status(200)
      .json({
        message: "Form data submitted successfully to Zoho",
        zohoResponse,
      });
  } catch (error) {
    console.error("Error in /submit-form route:", error);
    res
      .status(500)
      .json({
        error: "Failed to submit data to Zoho",
        message: error.message || "An unknown error occurred",
      });
  }
});

app.use((req, res) =>
  res
    .status(404)
    .json({
      error: "Not Found",
      message: "The requested endpoint does not exist.",
    })
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
