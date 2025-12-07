import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function Charts({ data }) {

    return (
        <>
        {data.map(score => (
            <div className="compare-group-chart animate" key={score.language}>
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
        </>
    )
    
}