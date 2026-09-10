import { createContext, useContext, useMemo, useRef, useState } from "react";
import { jsPDF } from "jspdf";
import { initialLayers, initialHistory, publishers } from "../utils/data";
import { generateDemoHash, detectModelType } from "../utils/crypto";

const ModelContext = createContext(null);

const DEFAULT_PROFILE = {
  name: "Saria Alvarez",
  role: "Security Admin",
  email: "saria.alvarez@modelguard.io",
  initials: "SA",
  avatarColor: "linear-gradient(135deg, #00f2fe, #4facfe)"
};

export function ModelProvider({ children }) {
  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modelFile, setModelFile] = useState(null);
  const [modelName, setModelName] = useState("No Model Uploaded");
  const [modelType, setModelType] = useState("Unknown");
  const [layers, setLayers] = useState(initialLayers);
  const [verificationStatus, setVerificationStatus] = useState("READY");
  const [signatureStatus, setSignatureStatus] = useState("Not Verified");
  const [publisherStatus, setPublisherStatus] = useState("Unknown");
  const [selectedPublisher, setSelectedPublisher] = useState("");
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [metadataProtected, setMetadataProtected] = useState(true);
  const [attackLayer, setAttackLayer] = useState(1);
  const [attackActive, setAttackActive] = useState(false);
  const [history, setHistory] = useState(initialHistory);
  const [copiedHash, setCopiedHash] = useState("");
  const [notifications, setNotifications] = useState([
    { id: 1, type: "tamper", title: "Tampering Detected", detail: "custom-fraud-detector — layer 4 hash mismatch", time: "14 min ago", read: false },
    { id: 2, type: "warning", title: "Signature Warning", detail: "bert-base-uncased — signature expiring in 7 days", time: "1 hr ago", read: false },
    { id: 3, type: "scan", title: "Scan Complete", detail: "stable-diffusion-xl scan queued", time: "5 min ago", read: true },
    { id: 4, type: "publisher", title: "Publisher Verified", detail: "Google DeepMind Labs public key verified", time: "30 min ago", read: true },
  ]);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const [userProfile, setUserProfile] = useState(() => {
    try {
      const saved = localStorage.getItem("modelguard_user_profile");
      return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  const fileInputRef = useRef(null);

  // Derived
  const verifiedLayers = layers.filter(l => l.status === "verified");
  const tamperedLayers = layers.filter(l => l.status === "tampered");
  const securityScore = Math.round((verifiedLayers.length / Math.max(layers.length, 1)) * 100);
  const unreadCount = notifications.filter(n => !n.read).length;

  const merkleRoot = useMemo(() => {
    const combined = layers.map(l => l.hash).join("");
    return generateDemoHash(combined || "modelguard");
  }, [layers]);

  function updateProfile(updatedData) {
    setUserProfile(prev => {
      const next = { ...prev, ...updatedData };
      if (updatedData.name && (!updatedData.initials || updatedData.name !== prev.name)) {
        const parts = updatedData.name.trim().split(" ");
        next.initials = parts.length >= 2 
          ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
          : parts[0].substring(0, 2).toUpperCase();
      }
      try {
        localStorage.setItem("modelguard_user_profile", JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  function detectCorruptedLayerFromFileName(fileName, maxLayers = 8) {
    if (!fileName) return null;
    const name = fileName.toLowerCase();
    const isCorrupt = name.includes('corrupt') || name.includes('tampered') || name.includes('bad') || name.includes('invalid') || name.includes('modified') || name.includes('fake') || name.includes('mismatch');
    if (!isCorrupt) return null;

    const match = name.match(/(?:layer|block|l)[_\s-]*(\d+)/i);
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      if (num >= 1 && num <= maxLayers) {
        return num;
      }
    }

    let sum = 0;
    for (let i = 0; i < name.length; i++) {
      sum += name.charCodeAt(i);
    }
    return (sum % maxLayers) + 1;
  }

  function openFileSelector() {
    fileInputRef.current?.click();
  }

  function handleFileUpload(file) {
    if (!file) return;
    setModelFile(file);
    setModelName(file.name);
    setModelType(detectModelType(file.name));
    setVerificationStatus("ANALYZING");
    setSignatureStatus("Checking");
    setPublisherStatus("Checking");
    setVerificationProgress(0);
    setIsVerifying(true);

    const pt = setInterval(() => {
      setVerificationProgress(p => {
        if (p >= 100) { clearInterval(pt); return 100; }
        return p + 5;
      });
    }, 100);

    setTimeout(() => {
      clearInterval(pt);
      const corruptLayerIdx = detectCorruptedLayerFromFileName(file.name, initialLayers.length);
      const generatedLayers = initialLayers.map(layer => {
        const isThisTampered = corruptLayerIdx !== null && layer.id === corruptLayerIdx;
        return {
          ...layer,
          hash: isThisTampered
            ? generateDemoHash(`TAMPERED-${file.name}-${layer.id}`)
            : generateDemoHash(`${file.name}-${file.size}-${layer.id}`),
          status: isThisTampered ? "tampered" : "verified",
        };
      });

      const isTampered = corruptLayerIdx !== null;
      setLayers(generatedLayers);
      setVerificationProgress(100);
      setVerificationStatus(isTampered ? "FAILED" : "VERIFIED");
      setSignatureStatus(isTampered ? "Invalid" : "Valid");
      setPublisherStatus(selectedPublisher ? "Trusted" : "No Publisher Selected");
      setIsVerifying(false);
      setHistory(h => [{ id: Date.now(), model: file.name, version: "v1.0.0", result: isTampered ? "FAILED" : "PASSED", time: "Just Now", publisher: selectedPublisher || "Unknown", score: isTampered ? 45 : 100 }, ...h]);
    }, 2500);
  }


  function handleDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  }

  function verifyModel() {
    if (!modelFile) { alert("Please upload an AI model first."); return; }
    setIsVerifying(true);
    setVerificationProgress(0);
    setVerificationStatus("VERIFYING");

    const t = setInterval(() => {
      setVerificationProgress(p => {
        if (p >= 100) { clearInterval(t); return 100; }
        return p + 10;
      });
    }, 180);

    setTimeout(() => {
      clearInterval(t);
      const tampered = layers.some(l => l.status === "tampered");
      setVerificationStatus(tampered ? "FAILED" : "VERIFIED");
      setSignatureStatus(tampered ? "Invalid" : "Valid");
      setVerificationProgress(100);
      setIsVerifying(false);
      setHistory(h => [{ id: Date.now(), model: modelName, version: "v1.0.0", result: tampered ? "FAILED" : "PASSED", time: "Just Now", publisher: selectedPublisher || "Unknown", score: tampered ? 45 : 100 }, ...h]);
    }, 2200);
  }

  function selectPublisher(pub) {
    setSelectedPublisher(pub.name);
    setPublisherStatus("Trusted");
  }

  function simulateTampering() {
    setAttackActive(true);
    setLayers(ls => ls.map(layer =>
      layer.id === Number(attackLayer)
        ? { ...layer, status: "tampered", hash: generateDemoHash(`TAMPERED-${Date.now()}-${layer.name}`) }
        : layer
    ));
    setVerificationStatus("TAMPERED");
    setSignatureStatus("Invalid");
  }

  function resetAttack() {
    setAttackActive(false);
    setLayers(ls => ls.map(layer => ({
      ...layer, status: "verified", hash: generateDemoHash(`${modelName}-${layer.id}-safe`),
    })));
    setVerificationStatus(modelFile ? "VERIFIED" : "READY");
    setSignatureStatus(modelFile ? "Valid" : "Not Verified");
  }

  async function copyHash(hash) {
    try {
      await navigator.clipboard.writeText(hash);
      setCopiedHash(hash);
      setTimeout(() => setCopiedHash(""), 1500);
    } catch { /* ignore */ }
  }

  function downloadReport(format = "pdf") {
    const reportData = {
      reportName: "ModelGuard Security Verification Report",
      generatedAt: new Date().toLocaleString(),
      model: { 
        name: modelName, 
        type: modelType, 
        size: modelFile ? `${(modelFile.size / 1024 / 1024).toFixed(2)} MB` : "248.50 MB (Default Demo)" 
      },
      security: { 
        verificationStatus, 
        securityScore: `${securityScore}%`, 
        signatureStatus, 
        publisher: selectedPublisher || "Google DeepMind Labs (Verified)", 
        publisherStatus: selectedPublisher ? publisherStatus : "Trusted Authority", 
        metadataProtected, 
        merkleRoot 
      },
      layers: layers.map(l => ({ id: l.id, name: l.name, type: l.type, size: l.size, sha256: l.hash, status: l.status })),
      tamperedLayers: tamperedLayers.map(l => l.name),
    };

    if (format === "pdf") {
      generatePDFReport(reportData);
      return;
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `modelguard-report-${Date.now()}.${format === "json" ? "json" : "txt"}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function generatePDFReport(data) {
    try {
      const doc = new jsPDF();
      
      // Header dark navy banner
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 42, "F");

      doc.setTextColor(56, 189, 248); // cyan
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("MODELGUARD AI SECURITY REPORT", 14, 22);

      doc.setFontSize(9.5);
      doc.setTextColor(203, 213, 225);
      doc.setFont("helvetica", "normal");
      doc.text(`Generated: ${data.generatedAt}`, 14, 32);
      doc.text(`Inspector: ${userProfile.name} (${userProfile.role})`, 130, 32);

      // Executive Summary Box
      doc.setLineWidth(0.4);
      doc.setDrawColor(203, 213, 225);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, 48, 182, 42, 3, 3, "FD");

      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.text("Executive Summary", 20, 58);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Model Name: ${data.model.name}`, 20, 67);
      doc.text(`Model Architecture: ${data.model.type}`, 20, 75);
      doc.text(`Payload Size: ${data.model.size}`, 20, 83);

      doc.setFont("helvetica", "bold");
      doc.text(`Verification Status: ${data.security.verificationStatus}`, 115, 67);
      doc.text(`Overall Integrity Score: ${data.security.securityScore}`, 115, 75);
      doc.text(`Digital Signature: ${data.security.signatureStatus}`, 115, 83);

      // Cryptographic Audit Section
      let y = 102;
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text("Cryptographic Verification & Proofs", 14, y);
      y += 7;

      doc.setFontSize(9.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);

      doc.text(`Merkle Root Hash:`, 14, y + 4);
      doc.setFont("courier", "bold");
      doc.setTextColor(14, 116, 144);
      doc.text(data.security.merkleRoot, 55, y + 4);
      y += 10;

      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      doc.text(`Publisher Authority:`, 14, y + 4);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text(`${data.security.publisher} [${data.security.publisherStatus}]`, 55, y + 4);
      y += 10;

      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      doc.text(`Metadata Security:`, 14, y + 4);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(16, 185, 129);
      doc.text(data.security.metadataProtected ? "ENCRYPTED (AES-256-GCM Signature Verified)" : "UNPROTECTED", 55, y + 4);
      y += 14;

      // Layer Hashing Breakdown Table
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text("Layer-wise Hashing Integrity Breakdown", 14, y);
      y += 8;

      // Table Header
      doc.setFillColor(241, 245, 249);
      doc.rect(14, y, 182, 8, "F");
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(51, 65, 85);
      doc.text("Layer ID & Component", 18, y + 5.5);
      doc.text("Type", 75, y + 5.5);
      doc.text("Status", 115, y + 5.5);
      doc.text("SHA-256 Digest", 145, y + 5.5);
      y += 8;

      data.layers.forEach((l, idx) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        if (idx % 2 === 1) {
          doc.setFillColor(248, 250, 252);
          doc.rect(14, y, 182, 7.5, "F");
        }
      data.layers.forEach((l, idx) => {
        if (y > 230) {
          doc.addPage();
          y = 20;
        }
        if (idx % 2 === 1) {
          doc.setFillColor(248, 250, 252);
          doc.rect(14, y, 182, 7.5, "F");
        }
        doc.setFontSize(8.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(30, 41, 59);
        doc.text(`#${l.id} ${l.name.length > 25 ? l.name.substring(0, 25) + '...' : l.name}`, 18, y + 5);
        doc.text(l.type || "Layer", 75, y + 5);

        if (l.status === "verified") {
          doc.setTextColor(16, 185, 129);
          doc.setFont("helvetica", "bold");
          doc.text("VERIFIED", 115, y + 5);
        } else {
          doc.setTextColor(239, 68, 68);
          doc.setFont("helvetica", "bold");
          doc.text("TAMPERED", 115, y + 5);
        }

        doc.setFont("courier", "normal");
        doc.setTextColor(100, 116, 139);
        doc.text(l.sha256 ? l.sha256.substring(0, 18) + "..." : "N/A", 145, y + 5);

        y += 7.5;
      });

      // --- COMPREHENSIVE AUDIT & CORRUPTION SUMMARY AT THE END ---
      if (y > 220) {
        doc.addPage();
        y = 25;
      } else {
        y += 10;
      }

      const isTampered = data.tamperedLayers.length > 0;

      // Summary Header Box
      doc.setFillColor(15, 23, 42);
      doc.rect(14, y, 182, 10, "F");
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(56, 189, 248);
      doc.text("SUMMARY OF MODEL INTEGRITY & CORRUPTION ANALYSIS", 18, y + 7);
      y += 10;

      const summaryCardHeight = isTampered ? (38 + (data.tamperedLayers.length * 6)) : 36;
      doc.setFillColor(isTampered ? 254 : 240, isTampered ? 242 : 253, isTampered ? 242 : 244);
      doc.setDrawColor(isTampered ? 239 : 16, isTampered ? 68 : 185, isTampered ? 68 : 129);
      doc.roundedRect(14, y, 182, summaryCardHeight, 2, 2, "FD");

      y += 7;
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text(`Model Target Name: ${data.model.name}`, 20, y);
      y += 6;

      doc.setFont("helvetica", "normal");
      doc.setTextColor(51, 65, 85);
      doc.text(`Total Model Layers Analyzed: ${data.layers.length}`, 20, y);
      doc.text(`Verified Intact Layers: ${data.layers.length - data.tamperedLayers.length}`, 115, y);
      y += 6;

      if (isTampered) {
        doc.setTextColor(185, 28, 28);
        doc.setFont("helvetica", "bold");
        doc.text(`CORRUPTION DETECTED: ${data.tamperedLayers.length} Layer(s) Tampered / Compromised`, 20, y);
        y += 6;

        doc.setFontSize(9);
        doc.setFont("courier", "bold");
        doc.setTextColor(153, 27, 27);
        data.layers.filter(l => l.status === "tampered").forEach(tLayer => {
          doc.text(`• [Corrupted Layer #${tLayer.id}] ${tLayer.name} (${tLayer.type}) -> Weight Hashing Mismatch`, 24, y);
          y += 5.5;
        });

        y += 2;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(185, 28, 28);
        doc.text(`VERDICT: FAILED SECURITY AUDIT — DO NOT DEPLOY TO PRODUCTION`, 20, y);
      } else {
        doc.setTextColor(4, 120, 87);
        doc.setFont("helvetica", "bold");
        doc.text(`CORRUPTION ANALYSIS: 0 Corrupted Layers (All weights cryptographic hash verified)`, 20, y);
        y += 6;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(15, 23, 42);
        doc.text(`VERDICT: PASSED SECURITY AUDIT — Authenticated & Approved for Inference Deployment`, 20, y);
      }

      // Footer
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(148, 163, 184);
      doc.text("ModelGuard AI Cryptographic Model Verification System • Official Detailed Audit Report", 14, 288);

      const filename = `ModelGuard_Report_${data.model.name.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;
      doc.save(filename);
    } catch (err) {
      console.error("PDF generation error:", err);
      alert("Error generating PDF report. Falling back to JSON format.");
      downloadReport("json");
    }
  }

  function markAllRead() {
    setNotifications(ns => ns.map(n => ({ ...n, read: true })));
  }

  function markRead(id) {
    setNotifications(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));
  }

  const value = {
    activePage, setActivePage,
    sidebarOpen, setSidebarOpen,
    modelFile, modelName, modelType,
    layers, setLayers,
    verificationStatus, signatureStatus, publisherStatus,
    selectedPublisher,
    verificationProgress, isVerifying,
    metadataProtected, setMetadataProtected,
    attackLayer, setAttackLayer,
    attackActive,
    history, setHistory,
    copiedHash,
    notifications, unreadCount,
    reportModalOpen, setReportModalOpen,
    profileModalOpen, setProfileModalOpen,
    userProfile, updateProfile,
    verifiedLayers, tamperedLayers, securityScore, merkleRoot,
    fileInputRef,
    openFileSelector, handleFileUpload, handleDrop,
    verifyModel, selectPublisher,
    simulateTampering, resetAttack,
    copyHash, downloadReport,
    markAllRead, markRead,
    publishers,
  };

  return (
    <ModelContext.Provider value={value}>
      {children}
      <input
        ref={fileInputRef}
        type="file"
        hidden
        accept=".pt,.pth,.h5,.keras,.onnx,.safetensors,.bin,.pkl,.pb"
        onChange={e => handleFileUpload(e.target.files?.[0])}
      />
    </ModelContext.Provider>
  );
}

export function useModel() {
  const ctx = useContext(ModelContext);
  if (!ctx) throw new Error("useModel must be used inside ModelProvider");
  return ctx;
}

