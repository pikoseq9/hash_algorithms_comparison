const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;

// Mapowanie frontendowych wartości na te, które akceptuje benchmark.ps1
const langMap = { cpp: "Cpp", cs: "CSharp", python: "Python" };
const algoMap = { md5: "MD5", sha1: "SHA1", sha2: "SHA2" };

app.get("/api/hash", (req, res) => {
    const { lang, algo, message } = req.query;

    if (!lang || !algo || !message) {
        return res.status(400).send("Brakuje parametrów!");
    }

    const psLang = langMap[lang.toLowerCase()];
    const psAlgo = algoMap[algo.toLowerCase()];

    if (!psLang || !psAlgo) {
        return res.status(400).send("Niepoprawny język lub algorytm");
    }

    const psScript = path.resolve(__dirname, "../comparison/benchmark.ps1");

    // Wywołanie PowerShell z poprawnymi argumentami
    const cmd = `powershell -ExecutionPolicy Bypass -File "${psScript}" "${message}" "${psAlgo}" "${psLang}"`;

    exec(cmd, { encoding: "utf8" }, (error, stdout, stderr) => {
        if (error) {
            console.error("Błąd PowerShell:", error);
            return res.status(500).send("Błąd w wykonywaniu skryptu");
        }
        if (stderr) console.error("PowerShell stderr:", stderr);

        // Ostatnia linia stdout to hash
        const lines = stdout.trim().split(/\r?\n/);
        const hash = lines[lines.length - 1];

        res.send(hash); // frontend dostaje czysty hash
    });
});

app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
