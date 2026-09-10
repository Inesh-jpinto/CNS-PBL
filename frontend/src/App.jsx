import { Routes, Route } from "react-router-dom";
import { ModelProvider } from "./context/ModelContext";
import Shell from "./layout/Shell";

// Page Imports
import DashboardPage from "./pages/DashboardPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ActivityPage from "./pages/ActivityPage";
import NotificationsPage from "./pages/NotificationsPage";
import ModelUploadPage from "./pages/ModelUploadPage";
import HashVerificationPage from "./pages/HashVerificationPage";
import LayerVerificationPage from "./pages/LayerVerificationPage";
import MerkleTreePage from "./pages/MerkleTreePage";
import SignaturePage from "./pages/SignaturePage";
import HashComparisonPage from "./pages/HashComparisonPage";
import ModelRegistryPage from "./pages/ModelRegistryPage";
import ModelDetailsPage from "./pages/ModelDetailsPage";
import PublishersPage from "./pages/PublishersPage";
import ProvenancePage from "./pages/ProvenancePage";
import VersionControlPage from "./pages/VersionControlPage";
import FingerprintPage from "./pages/FingerprintPage";
import HistoryPage from "./pages/HistoryPage";
import LogsPage from "./pages/LogsPage";
import ReportsPage from "./pages/ReportsPage";
import CertificatesPage from "./pages/CertificatesPage";
import ManifestPage from "./pages/ManifestPage";
import AttackSimulatorPage from "./pages/AttackSimulatorPage";
import RiskAssessmentPage from "./pages/RiskAssessmentPage";
import MetadataPage from "./pages/MetadataPage";
import SystemHealthPage from "./pages/SystemHealthPage";
import SettingsPage from "./pages/SettingsPage";

export default function App() {
  return (
    <ModelProvider>
      <Routes>
        <Route element={<Shell />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/activity" element={<ActivityPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/models/upload" element={<ModelUploadPage />} />
          <Route path="/verification/hash" element={<HashVerificationPage />} />
          <Route path="/verification/layers" element={<LayerVerificationPage />} />
          <Route path="/verification/merkle" element={<MerkleTreePage />} />
          <Route path="/verification/signature" element={<SignaturePage />} />
          <Route path="/verification/comparison" element={<HashComparisonPage />} />
          <Route path="/models" element={<ModelRegistryPage />} />
          <Route path="/models/:modelId" element={<ModelDetailsPage />} />
          <Route path="/registry/publishers" element={<PublishersPage />} />
          <Route path="/registry/provenance" element={<ProvenancePage />} />
          <Route path="/registry/versions" element={<VersionControlPage />} />
          <Route path="/registry/fingerprint" element={<FingerprintPage />} />
          <Route path="/records/history" element={<HistoryPage />} />
          <Route path="/records/logs" element={<LogsPage />} />
          <Route path="/records/reports" element={<ReportsPage />} />
          <Route path="/records/certificates" element={<CertificatesPage />} />
          <Route path="/records/manifest" element={<ManifestPage />} />
          <Route path="/security/attack-simulator" element={<AttackSimulatorPage />} />
          <Route path="/security/risk" element={<RiskAssessmentPage />} />
          <Route path="/security/metadata" element={<MetadataPage />} />
          <Route path="/system/health" element={<SystemHealthPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </ModelProvider>
  );
}