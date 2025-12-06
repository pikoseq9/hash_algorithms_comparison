import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function CompareView() {
    const [isLoading, setIsLoading] = useState(true);
    const [result, setResult] = useState(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
            setResult({
                success: true,
                score: [
                    { language: "cpp", avgTime: 0.51, cpuUsage: 4.3, ramUsage: 1.23 },
                    { language: "cs", avgTime: 0.75, cpuUsage: 5.1, ramUsage: 1.8 },
                    { language: "python", avgTime: 1.20, cpuUsage: 6.5, ramUsage: 2.5 },
                ],
            });
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    if (isLoading) return <h1 className="loading">Pobieranie wyników...</h1>;
    if (!result.success) return <h1 className="fail-compare">Błąd pobierania wyników</h1>;

    return (
        <div className="compare-body">
            <h1>Porównanie wyników</h1>
            <div className="compare-dashboard">
                {result.score.map((score) => (
                    <div className="compare-group animate" key={score.language}>
                        <h2>{score.language.toUpperCase()}</h2>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={[score]} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                                <XAxis dataKey="language" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="avgTime" fill="#8884d8" name="Średni czas (s)" />
                                <Bar dataKey="cpuUsage" fill="#82ca9d" name="CPU (%)" />
                                <Bar dataKey="ramUsage" fill="#ffc658" name="RAM (MB)" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ))}
            </div>
        </div>
    );
}
