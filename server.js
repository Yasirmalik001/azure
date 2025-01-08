require("dotenv").config(); // Load environment variables from .env into process.env

const express = require("express"); // Import Express framework
const axios = require("axios"); // Import Axios for HTTP requests
const morgan = require("morgan"); // Import Morgan for logging

const app = express(); // Create Express application

// ✅ Middleware - Logging, CORS, and Parsing
app.use(morgan("dev")); // Logs HTTP requests to the console
app.use(express.json()); // Parses JSON body
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded data

const cors = require("cors");

const allowedOrigins = [
  "https://vehicles.ridefox.com",
  "http://localhost:3000",
]; // Add your frontend URLs

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Ensure Express Responds to Preflight Requests
app.options("*", cors());

// ✅ Environment Variables - Ensure These Are Set in Azure
const apiKey = process.env.ZOHO_API_KEY;
const accessToken = process.env.ZOHO_ACCESS_TOKEN;

// ✅ Function to Submit Data to Zoho CRM
async function submitToZoho(data) {
  const {
    firstName,
    lastName,
    email,
    phone = "Not provided",
    description = "No description provided",
    zip,
    userSelection = "No options selected",
    productTitle = "Unknown Product Title",
    selectedColor = "No color selected",
    selectedXP = "No XP package selected",
  } = data;

  try {
    console.log("Submitting Data to Zoho:", {
      Last_Name: lastName,
      First_Name: firstName,
      Email: email,
      Phone: phone,
      Description: description,
      Zip_Code: zip,
      Selected_Options: userSelection,
      Product_Title: productTitle,
      Selected_Color: selectedColor,
      Selected_XP: selectedXP,
    });

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
            Selected_Options: userSelection,
            Product_Title: productTitle,
            Selected_Color: selectedColor,
            Selected_XP: selectedXP,
          },
        ],
      },
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Zoho Response:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Error Submitting to Zoho:",
      error.response?.data || error.message || error
    );
    throw new Error("Error submitting to Zoho");
  }
}

// ✅ Endpoint to Receive Form Data
app.post("/submit-form", async (req, res) => {
  console.log("Received Form Data:", req.body);

  try {
    const zohoResponse = await submitToZoho(req.body);
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

// ✅ Health Check Endpoint (Useful for Azure)
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Service is running" });
});

// ✅ Graceful Shutdown - Handles Azure Restarts Properly
process.on("SIGTERM", () => {
  console.log("🔴 Received SIGTERM, shutting down server...");
  process.exit(0);
});

// ✅ Start the Server on Correct Azure Port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
