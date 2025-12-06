import { useState } from "react";
import { Outlet, Link } from "react-router-dom";

export default function App() {
    const [currentView, setCurrentView] = useState('hash');

  return (
    <div className="app">
      <Link
        className="route-btn"
        onClick={() => setCurrentView(currentView === 'hash' ? 'compare' : 'hash')}
        to={currentView === 'hash' ? "/compare" : "/"}
        >
        {currentView === 'hash' ? (
            <>
            Go to compare dashboard
            <i className="fa-solid fa-chart-simple"></i>
            </>
        ) : (
            <>
            Go back hashing
            <i className="fa-solid fa-house"></i>
            </>
        )}
        </Link>
      <Outlet />
    </div>
  );
}