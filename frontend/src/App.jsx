import { useState } from "react";
import "./App.css";

export default function App() {
    const [message, setMessage] = useState("");

    const [selected, setSelected] = useState({
        cpp: { md5: true, sha1: true, sha2: true },
        cs: { md5: false, sha1: false, sha2: false },
        python: { md5: false, sha1: false, sha2: false }
    });

    const [results, setResults] = useState({});

    const toggle = (lang, algo) => {
        setSelected(prev => ({
            ...prev,
            [lang]: { ...prev[lang], [algo]: !prev[lang][algo] }
        }));
    };

    const handleSubmit = async () => {
        const output = {};

        for (const lang of Object.keys(selected)) {
            for (const algo of Object.keys(selected[lang])) {
                if (!selected[lang][algo]) continue;

                const res = await fetch(
                    `http://localhost:3001/api/hash?lang=${lang}&algo=${algo}&message=${encodeURIComponent(message)}`
                );

                const text = await res.text();

                if (!output[lang]) output[lang] = {};
                output[lang][algo] = text;
            }
        }

        setResults(output);
    };

    return (
        <div className="container">
            <div className="form-box">
                <h1>Generator Skrótów</h1>
                <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Wpisz wiadomość"
                    className="input"
                />
                <div className="groups">
                    {/* C++ */}
                    <div className="group">
                        <h3>C++</h3>
                        {Object.keys(selected.cpp).map(algo => (
                            <label key={algo} className="checkbox">
                                <input
                                    type="checkbox"
                                    checked={selected.cpp[algo]}
                                    onChange={() => toggle("cpp", algo)}
                                />
                                {algo.toUpperCase()}
                            </label>
                        ))}
                    </div>

                    {/* C# */}
                    <div className="group">
                        <h3>C#</h3>
                        {Object.keys(selected.cs).map(algo => (
                            <label key={algo} className="checkbox">
                                <input
                                    type="checkbox"
                                    checked={selected.cs[algo]}
                                    onChange={() => toggle("cs", algo)}
                                />
                                {algo.toUpperCase()}
                            </label>
                        ))}
                    </div>

                    {/* Python */}
                    <div className="group">
                        <h3>Python</h3>
                        {Object.keys(selected.python).map(algo => (
                            <label key={algo} className="checkbox">
                                <input
                                    type="checkbox"
                                    checked={selected.python[algo]}
                                    onChange={() => toggle("python", algo)}
                                />
                                {algo.toUpperCase()}
                            </label>
                        ))}
                    </div>
                </div>

                <button className="btn" onClick={handleSubmit}>Generuj</button>

                <h2>Wyniki:</h2>
                <pre className="results">
                    {JSON.stringify(results, null, 2)}
                </pre>
            </div>
        </div>
    );
}
