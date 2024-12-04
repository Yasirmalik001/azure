require("dotenv").config(); // Ensure this is added to use environment variables

const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const cors = require("cors");
const apiKey = process.env.ZOHO_API_KEY;
const accessToken = process.env.ZOHO_ACCESS_TOKEN;

const app = express();

// Enable CORS for all origins (be more restrictive in production)
app.use(cors());

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Zoho API Integration
async function submitToZoho(data) {
  const {
    firstName,
    lastName,
    email,
    phone,
    description,
    zip,
    selectedOptions,
  } = data;

  try {
    console.log("Submitting data to Zoho: ", {
      firstName,
      lastName,
      email,
      phone,
      description,
      zip,
      selectedOptions,
    });

    // Ensure you're using a secure, environment-based API key
    const response = await axios.post(
      "https://www.zohoapis.com/crm/v2/functions/inbound_lead/actions/execute?auth_type=apikey&zapikey=1003.18845a2854d8dc5f15927993eaf46472.1854d4111934cca38863a9b173fd80e8",
      {
        data: [
          {
            Last_Name: lastName,
            First_Name: firstName,
            Email: email,
            Phone: phone,
            Description: description,
            Zip_Code: zip,
            Selected_Options: selectedOptions,
          },
        ],
      },
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${process.env.ZOHO_ACCESS_TOKEN}`,
        },
      }
    );

    console.log("Zoho Response: ", response.data);
    return response.data;
  } catch (error) {
    console.error("Error submitting to Zoho:", error.message || error);
    throw new Error("Error submitting to Zoho");
  }
}

// Endpoint to Receive Data from Shopify Form
app.post("/submit-form", async (req, res) => {
  const formData = req.body;

  console.log("Received Form Data: ", formData);

  try {
    const zohoResponse = await submitToZoho(formData);
    res.json({
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

// Handle invalid routes (404)
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: "The requested endpoint does not exist.",
  });
});

const PORT = process.env.PORT || 3000;
app.listen(8080, "localhost", () => {
  console.log("Server running on http://localhost:8080");
});
