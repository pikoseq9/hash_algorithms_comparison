import { useEffect, useState, useRef } from "react";
import Ranking from "./compare/Ranking";
import Charts from "./compare/Charts";

export default function CompareView() {
    const [isLoading, setIsLoading] = useState(true);
    const [rawData, setRawData] = useState([]);
    const [hashTypes, setHashTypes] = useState([]);
    const [activeHashIndex, setActiveHashIndex] = useState(0);
    const [activeIndex, setActiveIndex] = useState(0);
    const [hashAnimDir, setHashAnimDir] = useState(null);
    
    const touchStartY = useRef(null);
    const isScrolling = useRef(false);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('http://localhost:3001/api/compare');
                const data = await response.json();

                const formattedData = data.map(item => ({
                    language: item.language,
                    hashType: item.hashType,
                    avgTime: parseFloat(item.avgTime),
                    cpuUsage: parseFloat(item.avgCPU),
                    ramUsage: parseFloat(item.avgRAM)
                }));

                const uniqueHashes = [...new Set(formattedData.map(item => item.hashType))];

                setRawData(formattedData);
                setHashTypes(uniqueHashes);
                if (uniqueHashes.length > 0) setActiveHashIndex(0);

            } catch (err) {
                console.error('Error fetching data:', err);
                setRawData([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleTouchStart = (e) => {
        touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
        if (touchStartY.current === null) return;
        const touchEndY = e.changedTouches[0].clientY;
        const diff = touchStartY.current - touchEndY;

        if (Math.abs(diff) > 50) {
            if (diff > 0) handleNextSection();
            else handlePrevSection();
        }
        touchStartY.current = null;
    };

    const handleWheel = (e) => {
        if (isScrolling.current) return;
        if (Math.abs(e.deltaY) < 10) return;

        if (e.deltaY > 0) handleNextSection();
        else handlePrevSection();

        isScrolling.current = true;
        setTimeout(() => { isScrolling.current = false; }, 1000);
    };

    const handlePrevSection = () => {
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : sections.length - 1));
    };

    const handleNextSection = () => {
        setActiveIndex((prev) => (prev < sections.length - 1 ? prev + 1 : 0));
    };

    const handlePrevHash = () => {
        setHashAnimDir("left");
        setActiveHashIndex(prev =>
            prev > 0 ? prev - 1 : hashTypes.length - 1
        );
    };

    const handleNextHash = () => {
        setHashAnimDir("right");
        setActiveHashIndex(prev =>
            prev < hashTypes.length - 1 ? prev + 1 : 0
        );
    };

    if (isLoading) return <h1 className="loading">Pobieranie wyników...</h1>;
    if (rawData.length === 0) return <h1 className="loading">Brak danych</h1>;

    const currentHash = hashTypes[activeHashIndex];
    const currentData = rawData.filter(item => item.hashType === currentHash);

    const sections = [
        <div key={`charts-${currentHash}`} className={`compare-section ${hashAnimDir === "right" ? "anim-right" : "anim-left" }`}>
            <Charts data={currentData} />
        </div>,

        <div key={`ranking-${currentHash}`} className={`compare-section ${hashAnimDir === "right" ? "anim-right" : "anim-left" }`}>
            <Ranking data={currentData} />
        </div>,

        <div key={`tiles-${currentHash}`} className={`compare-section summary-tiles ${hashAnimDir === "right" ? "anim-right" : "anim-left" }`}>
             <div className="tile">
                <h3>Najszybszy ({currentHash})</h3>
                <p>{currentData.sort((a,b) => a.avgTime - b.avgTime)[0]?.language}</p>
            </div>

            <div className="tile">
                <h3>Najmniej RAM ({currentHash})</h3>
                <p>{currentData.sort((a,b) => a.ramUsage - b.ramUsage)[0]?.language}</p>
            </div>

            <div className="tile">
                <h3>Najmniej CPU ({currentHash})</h3>
                <p>{currentData.sort((a,b) => a.cpuUsage - b.cpuUsage)[0]?.language}</p>
            </div>
        </div>
    ];

    return (
        <div className="compare-body" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} onWheel={handleWheel}>
            
            <div className="hash-header">
                Algorytm: <strong>{currentHash}</strong>
            </div>

            <button className="scroll-btn top-btn" onClick={handlePrevSection} disabled={activeIndex === 0}>
                ↑
            </button>

            <button className="scroll-btn left-btn" onClick={handlePrevHash}>
                ←
            </button>
            
            <button className="scroll-btn right-btn" onClick={handleNextHash}>
                →
            </button>

            <div className="compare-view-container">
                {sections.map((section, index) => (
                    <div
                        key={index}
                        className={`compare-slide ${index === activeIndex ? "active" : ""} `}
                    >
                        {section}
                    </div>
                ))}
            </div>

            <button className="scroll-btn bottom-btn" onClick={handleNextSection} disabled={activeIndex === sections.length - 1}>
                ↓
            </button>
        </div>
    );
}