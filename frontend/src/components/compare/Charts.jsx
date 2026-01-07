import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";

const METRICS = [
    { key: "avgTime", label: "Średni czas (s)" },
    { key: "cpuUsage", label: "CPU (%)" },
    { key: "ramUsage", label: "RAM (MB)" }
];

export default function Charts({ data }) {

    return (
        <>
            {METRICS.map(metric => (
                <div className="compare-group-chart animate" key={metric.key}>
                    <h2>{metric.label}</h2>

                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data}>
                            <XAxis dataKey="language" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar
                                dataKey={metric.key}
                                name={metric.label}
                                fill="#8884d8"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            ))}
        </>
    );
}
