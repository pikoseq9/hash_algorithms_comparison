import { useEffect, useState, useRef } from "react";
import Ranking from "./compare/Ranking";
import Charts from "./compare/Charts";

export default function CompareView() {
    const [isLoading, setIsLoading] = useState(true);
    const [result, setResult] = useState(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const touchStartY = useRef(null);
    const isScrolling = useRef(false);

  useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('http://localhost:3001/api/compare');
                const data = await response.json();
                setResult({ success: true, score: data });
            } catch (err) {
                console.error('Error fetching data:', err);
                setResult({ success: false, score: [] });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []); 

    if (isLoading) return <h1 className="loading">Pobieranie wyników...</h1>;
    
    const handleTouchStart = (e) => {
        touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
        if (touchStartY.current === null) return;
        const touchEndY = e.changedTouches[0].clientY;
        const diff = touchStartY.current - touchEndY;

        if (Math.abs(diff) > 50) {
            if (diff > 0) handleNext();
            else handlePrev();
        }

        touchStartY.current = null;
    };

    const handleWheel = (e) => {
        if (isScrolling.current) return;
        if (Math.abs(e.deltaY) < 10) return;

        if (e.deltaY > 0) handleNext();
        else handlePrev();

        isScrolling.current = true;
        setTimeout(() => { isScrolling.current = false; }, 1000);
    };

    const sections = [
        <div className="compare-section">
            <Charts data={result.score} />
        </div>,

        <div className="compare-section">
            <Ranking data={result.score} />
        </div>,

        <div className="compare-section summary-tiles">
            <div className="tile">
            </div>

            <div className="tile">

            </div>

            <div className="tile">
            </div>
        </div>
    ];

    const handlePrev = () => {
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : sections.length - 1));
    };

    const handleNext = () => {
        setActiveIndex((prev) => (prev < sections.length - 1 ? prev + 1 : 0));
    };

    return (
        <div className="compare-body" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} onWheel={handleWheel}>

            <button className="scroll-btn top-btn" onClick={handlePrev} disabled={activeIndex === 0}>
                ↑
            </button>

            <div className="compare-view-container">
                {sections.map((section, index) => (
                    <div
                        key={index}
                        className={`compare-slide ${index === activeIndex ? "active" : ""}`}
                    >
                        {section}
                    </div>
                ))}
            </div>

            <button className="scroll-btn bottom-btn" onClick={handleNext} disabled={activeIndex === sections.length - 1}>
                ↓
            </button>
        </div>
    );
}
