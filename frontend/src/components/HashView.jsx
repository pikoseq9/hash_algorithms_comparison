import { useState } from "react";

export default function HashView() {
    const [message, setMessage] = useState("");
    const [error, setError] = useState(false);

    const [selected, setSelected] = useState({
        cpp: { md5: true, sha1: true, sha2: true },
        cs: { md5: false, sha1: false, sha2: false },
        python: { md5: false, sha1: false, sha2: false }
    });

    const [results, setResults] = useState([]);

    const toggle = (lang, algo) => {
        setSelected(prev => ({
            ...prev,
            [lang]: { ...prev[lang], [algo]: !prev[lang][algo] }
        }));
    };

    const handleEmptyMessage = () => {
        setError(true);
    }

    const handleSubmit = async () => {
        if (message === "") {
            handleEmptyMessage();
            return;
        }
        setError(false);
        setResults([]);
        const promises = [];

        for (const lang of Object.keys(selected)) {
            for (const algo of Object.keys(selected[lang])) {
                if (!selected[lang][algo]) continue;

                const promise = fetch(
                    `http://localhost:3001/api/hash?lang=${lang}&algo=${algo}&message=${encodeURIComponent(message)}`
                )
                .then(res => res.text())
                .then(text => {
                    setResults(prev => [
                        ...prev,
                        { lang, algo, hash: text }
                    ]);
                })
                .catch(err => {
                    console.error(err);
                    setResults(prev => [
                        ...prev,
                        { lang, algo, hash: "Błąd" }
                    ]);
                });

                promises.push(promise);
            }
        }

        await Promise.all(promises);
    };

    return (
        <div className="container">
            <div className="form-box">
                <h1>Generator Skrótów</h1>
                <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Wpisz wiadomość"
                    className={`input ${error ? "input-error" : ""}`}
                />
                <div className="groups">
                    {["cpp", "cs", "python"].map(lang => (
                        <div key={lang} className="group">
                            <h3>{lang.toUpperCase()}</h3>
                            {Object.keys(selected[lang]).map(algo => (
                                <button
                                    key={algo}
                                    className={`checkbox ${selected[lang][algo] ? "chosen" : ""}`}
                                    onClick={() => toggle(lang, algo)}
                                >
                                    {algo.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    ))}
                </div>

                <button className="btn" onClick={handleSubmit}>Generuj</button>

                <h2>Wyniki w kolejności:</h2>
                <ul className="results">
                    {results.map((r, i) => (
                        <li key={i}>
                            <span className="lang">{r.lang.toUpperCase()}</span>
                            <span className="algo">{r.algo.toUpperCase()}</span>
                            <span className="hash">{r.hash}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}