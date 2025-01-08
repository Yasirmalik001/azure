require("dotenv").config(); // Load environment variables from .env into process.env

const express = require("express"); // Import the Express framework
const axios = require("axios"); // Import Axios for making HTTP requests

const app = express(); // Create an Express application instance

// Use built-in middleware to parse JSON and URL-encoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS for all origins (for production, you might restrict origins here)
app.use(require("cors")());

// Environment Variables
// On Azure, you won't typically have a local .env file. Instead, you'll set these
// environment variables in the Azure portal under "Application Settings" or use Azure Key Vault.
// Make sure to set ZOHO_API_KEY and ZOHO_ACCESS_TOKEN in your Azure environment.
const apiKey = process.env.ZOHO_API_KEY;
const accessToken = process.env.ZOHO_ACCESS_TOKEN;

// Function to Submit Data to Zoho CRM
async function submitToZoho(data) {
  // Destructure incoming data with defaults
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
    // Log payload for debugging
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

    // Send POST request to Zoho
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

    // Log Zoho response
    console.log("Zoho Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error Submitting to Zoho:", error.message || error);
    throw new Error("Error submitting to Zoho");
  }
}

// Endpoint to Receive Form Data
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

// Handle Invalid Routes (404)
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: "The requested endpoint does not exist.",
  });
});

// Start the Server
// On Azure App Service, the PORT environment variable is automatically set.
// Ensure you use process.env.PORT, as Azure will provide a port your app must listen on.
// You don't need to hardcode or configure it separately.
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
