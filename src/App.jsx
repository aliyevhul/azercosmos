import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import GetStarted from "./pages/GetStarted";
import Potential from "./pages/Potential";
import PracticalPhases from "./pages/PracticalPhases";
import Training from "./pages/Training";
import Documents from "./pages/Documents";
import Conclusion from "./pages/Conclusion";
import PrivacyPolicy from "./pages/PrivacyPolicy";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/get-started" element={<GetStarted />} />
        <Route path="/potential" element={<Potential />} />
        <Route path="/practical-phases" element={<PracticalPhases />} />
        <Route path="/training" element={<Training />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/conclusion" element={<Conclusion />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      </Route>
    </Routes>
  );
}
