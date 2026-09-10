import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useModel } from "../context/ModelContext";
import ReportModal from "../components/ReportModal";
import ProfileModal from "../components/ProfileModal";

export default function Shell() {
  const { reportModalOpen, setReportModalOpen, downloadReport } = useModel();

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <Topbar />
        <div className="page-content">
          <Outlet />
        </div>
      </main>
      {reportModalOpen && (
        <ReportModal
          onClose={() => setReportModalOpen(false)}
          onDownload={downloadReport}
        />
      )}
      <ProfileModal />
    </div>
  );
}

