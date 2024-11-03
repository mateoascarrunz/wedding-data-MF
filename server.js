const express = require ("express");
const {google} = require ("googleapis");
const cors = require('cors');
require('dotenv').config();
const credentialPath = process.env.GOOGLE_CREDENTIALS_PATH;

const app = express();

app.use(cors({
  origin: "http://127.0.0.1:5173", // Reemplaza con el dominio de tu frontend
  methods: ["GET", "POST"],
}));
app.use(express.json());

app.get("/api/fetch-data", async (req, res) => {
  try {
    console.log("Request to fetch data started");
    const auth = new google.auth.GoogleAuth({
      keyFile: credentialPath,
      scopes: "https://www.googleapis.com/auth/spreadsheets",
    });

    const client = await auth.getClient();
    console.log("Auth client created");

    const googleSheets = google.sheets({ version: "v4", auth: client });
    const spreadsheetId = process.env.SPREADSHEET_ID;

    const metaData = await googleSheets.spreadsheets.get({
      auth,
      spreadsheetId,
    });
    console.log("Spreadsheet metadata:", metaData.data);

    const getRows = await googleSheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range: "Hoja1!A:E",
    });
    console.log("Rows fetched:", getRows.data);

    res.send(getRows.data);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("An error occurred while fetching Google Sheets data.");
  }
});

app.post("/api/update-data", async (req, res) => {
  const id = req.body.id;
  const invitadoStatus = req.body.invitadoStatus;

  const auth = new google.auth.GoogleAuth({
    keyFile: credentialPath,
    scopes: "https://www.googleapis.com/auth/spreadsheets",
  });

  const client = await auth.getClient();
  const googleSheets = google.sheets({ version: "v4", auth: client });
  const spreadsheetId = process.env.SPREADSHEET_ID; // Replace with your actual spreadsheet ID

  try {
    // First, retrieve the current data in column E for the specific row with the given 'id'
    const currentData = await googleSheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range: `Hoja1!E${id}`,
    });

    // Update the cell in column E with the 'invitadoStatus'
    const updateData = await googleSheets.spreadsheets.values.update({
      auth,
      spreadsheetId,
      range: `Hoja1!E${id}`,
      valueInputOption: "RAW", // You may need to adjust this based on your data
      resource: {
        values: [[invitadoStatus]],
      },
    });

    // Check if the update was successful
    if (updateData.status === 200) {
      console.log(`Updated row ${id} in column E with: ${invitadoStatus}`);
      res.status(200).send("Data updated successfully");
    } else {
      console.error("Failed to update data in Google Sheets");
      res.status(500).send("Failed to update data in Google Sheets");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while updating Google Sheets data.");
  }
});
app.get("/", (req, res) => {
    const htmlResponse = "<html><body><h1>Successful</h1></body></html>";
    res.setHeader("Content-Type", "text/html");
    res.status(200).send(htmlResponse);
  });


  
app.listen(1337, () => console.log("Server is running on port 1337"));
