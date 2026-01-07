const express = require("express");
const cors = require("cors");
const { execFile } = require("child_process");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");
const { parse } = require("csv-parse/sync");


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

    messagetoHash = "\"" + message + "\"";

    execFile(exePath, [messagetoHash], (error, stdout) => {
        if (error) {
            console.error("Error running exe:", error);
            return res.status(500).send("Error executing hash function");
        }

        res.send(stdout.trim());
    });
});
app.get("/api/compare", (req, res) => {
    console.log(" /api/compare START", new Date().toISOString());
    const batPath = path.join(__dirname, "..", "comparison", "benchmark.bat");
    const csvPath = path.join(__dirname, "..", "comparison", "results.csv");

    if (!fs.existsSync(batPath)) {
        return res.status(404).send("Plik benchmark.bat nie istnieje");
    }

    // Uruchom skrypt benchmark.bat
    exec(`"${batPath}"`, { cwd: path.join(__dirname, "..", "comparison") }, (error, stdout, stderr) => {
        if (error) {
            console.error("Error running benchmark.bat:", error);
            return res.status(500).send("Błąd wykonania skryptu: " + stderr);
        }
        console.log("Koniec skryptu")
        // Po zakończeniu skryptu, odczytaj results.csv
        if (!fs.existsSync(csvPath)) {
            return res.status(404).send("Plik results.csv nie został wygenerowany");
        }

        fs.readFile(csvPath, "utf8", (error, data) => {
            if (error) {
                console.error("Error reading CSV:", error);
                return res.status(500).send("Błąd odczytu pliku CSV");
            }

           const records = parse(data, {
    columns: true,
    skip_empty_lines: true
});

const results = {};

for (const row of records) {
    const language = row.Language;
    const hashType = row.HashType;

    const cpu  = Number(row.CPU.replace(",", "."));
    const ram  = Number(row.RAM.replace(",", "."));
    const time = Number(row.Time.replace(",", "."));

    if (Number.isNaN(cpu) || Number.isNaN(ram) || Number.isNaN(time)) continue;

    const key = `${language}-${hashType}`;

    if (!results[key]) {
        results[key] = {
            language,
            hashType,
            cpuSum: 0,
            ramSum: 0,
            timeSum: 0,
            count: 0
        };
    }

    results[key].cpuSum += cpu;
    results[key].ramSum += ram;
    results[key].timeSum += time;
    results[key].count++;
}


            const averaged = Object.values(results).map(item => ({
                language: item.language,
                hashType: item.hashType,
                avgCPU: (item.cpuSum / item.count).toFixed(4),
                avgRAM: (item.ramSum / item.count).toFixed(2),
                avgTime: (item.timeSum / item.count).toFixed(4)
            }));

            const languageOrder = { "CSharp": 1, "Cpp": 2, "Python": 3 };
            averaged.sort((a, b) => {
                const langCompare = (languageOrder[a.language] || 999) - (languageOrder[b.language] || 999);
                if (langCompare !== 0) return langCompare;
                return a.hashType.localeCompare(b.hashType);
            });
            console.log(averaged);
            res.json(averaged);
        });
    });
});
app.listen(3001, () => console.log("Backend running on http://localhost:3001"));