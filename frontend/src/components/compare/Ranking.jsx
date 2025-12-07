export default function Ranking({ data }) {
    const sorted = [...data].sort((a, b) => 
        a.avgTime + a.cpuUsage + a.ramUsage - (b.avgTime + b.cpuUsage + b.ramUsage)
    );

    return (
        <div className="ranking-container">
            <h2 className="ranking-title">Ranking języków</h2>

            <div className="ranking-table-wrapper">
                <table className="ranking-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Język</th>
                            <th>AVG czas</th>
                            <th>CPU (%)</th>
                            <th>RAM (MB)</th>
                            <th>Wskaźnik</th>
                        </tr>
                    </thead>

                    <tbody>
                        {sorted.map((x, i) => {
                            const score = (x.avgTime * 0.5 + x.cpuUsage * 0.3 + x.ramUsage * 0.2).toFixed(3);

                            return (
                                <tr key={x.language}>
                                    <td>{i + 1}</td>
                                    <td>{x.language.toUpperCase()}</td>
                                    <td>{x.avgTime}</td>
                                    <td>{x.cpuUsage}</td>
                                    <td>{x.ramUsage}</td>
                                    <td>{score}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <p className="ranking-formula">
                Wzór wskaźnika:  
                <b> 0.5·avgTime + 0.3·CPU + 0.2·RAM </b>
            </p>
        </div>
    );
}
