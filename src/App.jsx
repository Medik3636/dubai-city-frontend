import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TapToEarn from './components/TapToEarn';

function App() {
  useEffect(() => {
    // Telegram Web App sozlamalari
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white">
        <Routes>
          <Route path="/" element={<TapToEarn />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;