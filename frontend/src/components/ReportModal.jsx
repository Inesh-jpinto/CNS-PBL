import { Download, FileJson, FileText, FileCode, X } from "lucide-react";

export default function ReportModal({ onClose, onDownload }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Export Security Report</h3>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <p className="modal-desc">Choose a format to download the complete security verification report.</p>
        <div className="modal-options">
          <button className="modal-option primary-option" style={{ border: "1px solid var(--cyan-soft)", background: "rgba(0, 242, 254, 0.08)" }} onClick={() => { onDownload("pdf"); onClose(); }}>
            <FileText size={24} style={{ color: "var(--cyan)" }} />
            <strong>PDF Document</strong>
            <span>Detailed summary & proofs</span>
          </button>
          <button className="modal-option" onClick={() => { onDownload("json"); onClose(); }}>
            <FileJson size={24} />
            <strong>JSON</strong>
            <span>Full cryptographic data</span>
          </button>
          <button className="modal-option" onClick={() => { onDownload("txt"); onClose(); }}>
            <FileCode size={24} />
            <strong>TXT</strong>
            <span>Raw text audit summary</span>
          </button>
        </div>
      </div>
    </div>
  );
}

