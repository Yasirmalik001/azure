require("dotenv").config();

const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
  })
);
app.use(bodyParser.json());

// Zoho API Integration Function
async function submitToZoho(data) {
  try {
    console.log("Submitting data to Zoho: ", data);

    const response = await axios.post(
      `${process.env.ZOHO_API_URL}?auth_type=apikey&zapikey=${process.env.ZOHO_API_KEY}`,
      {
        data: [data],
      },
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${process.env.ZOHO_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Zoho Response: ", response.data);
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
  const {
    firstName,
    lastName,
    email,
    phone,
    description,
    zip,
    selectedOptions,
  } = req.body;
  console.log("Received Form Data: ", req.body);

  try {
    const formData = {
      Last_Name: lastName,
      First_Name: firstName,
      Email: email,
      Phone: phone,
      Description: description,
      Zip_Code: zip,
      Selected_Options: selectedOptions,
    };

    const zohoResponse = await submitToZoho(formData);
    res.status(200).json({
      message: "Form data submitted successfully to Zoho",
      zohoResponse,
    });
  } catch (error) {
    console.error("Error in /submit-form route:", error);
    res.status(500).json({
      error: "Failed to submit data to Zoho",
      message: error.message || "An unknown error occurred",
    });
  }
});

// Handle invalid routes
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: "The requested endpoint does not exist.",
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
