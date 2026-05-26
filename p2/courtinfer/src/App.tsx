import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainMenu from "@/pages/MainMenu";
import InvestigationMap from "@/pages/InvestigationMap";
import LocationInvestigation from "@/pages/LocationInvestigation";
import Trial from "@/pages/Trial";
import Verdict from "@/pages/Verdict";
import EvidenceBook from "@/pages/EvidenceBook";
import { useGameStore } from "@/store/gameStore";

function GameRoutes() {
  const currentPhase = useGameStore(state => state.currentPhase);
  const showEvidenceBook = useGameStore(state => state.showEvidenceBook);

  return (
    <>
      <Routes>
        <Route path="/" element={<MainMenu />} />
        <Route path="/investigation" element={<InvestigationMap />} />
        <Route path="/investigation/:locationId" element={<LocationInvestigation />} />
        <Route path="/trial" element={<Trial />} />
        <Route path="/verdict" element={<Verdict />} />
      </Routes>
      
      {showEvidenceBook && currentPhase !== 'trial' && <EvidenceBook />}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <GameRoutes />
    </Router>
  );
}
