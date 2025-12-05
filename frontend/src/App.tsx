import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { FilterProvider } from './context/FilterContext';
import { Header } from './components/layout/Header';
import { HomePage } from './pages/HomePage';
import { CohortAnalysisPage } from './pages/CohortAnalysisPage';
import { FunnelPage } from './pages/FunnelPage';
import { MapPage } from './pages/MapPage';
import { MethodologyPage } from './pages/MethodologyPage';
import './App.css';

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <FilterProvider>
        <div className="app">
          <Header />
          <main className="app-main">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/cohorts" element={<CohortAnalysisPage />} />
              <Route path="/funnel" element={<FunnelPage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/methodology" element={<MethodologyPage />} />
            </Routes>
          </main>
        </div>
      </FilterProvider>
    </BrowserRouter>
  );
}

export default App;
