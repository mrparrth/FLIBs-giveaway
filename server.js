const express = require("express");
const { google } = require("googleapis");
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/deadline", async (req, res) => {
  const email = req.query.email;
  if (!email) return res.status(400).json({ error: "Missing email parameter" });

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT),
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth: await auth.getClient() });
    const spreadsheetId = "1GdnUkSQgPPNjf3oTUFdrXaGcs5Z7e93A18m9X7RmrMQ";
    const range = "TypeformSubmissions";
    const response = await sheets.spreadsheets.values.get({ spreadsheetId, range });
    const [header, ...rows] = response.data.values;
    const emailIdx = header.indexOf("Email");
    const deadlineIdx = header.indexOf("Deadline");
    if (emailIdx === -1 || deadlineIdx === -1) return res.status(500).json({ error: "Missing columns" });
    const row = rows.find((r) => r[emailIdx] === email);
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json({ deadline: row[deadlineIdx] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Fetch failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
