const express = require("express");
const cors = require("cors");
const { execFile } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/hash", (req, res) => {
    const { lang, algo, message } = req.query;

    if (!lang || !algo || !message)
        return res.status(400).send("Brakuje parametrów!");

    const exePath = path.join(__dirname, lang, `${algo}.exe`);

    if (!fs.existsSync(exePath)) {
        return res.status(404).send(`Brak implementacji dla ${algo} w  ${lang}`);
    }

    execFile(exePath, [message], (error, stdout) => {
        if (error) {
            console.error("Error running exe:", error);
            return res.status(500).send("Error executing hash function");
        }

        res.send(stdout.trim());
    });
});

app.listen(3001, () => console.log("Backend running on http://localhost:3001"));
