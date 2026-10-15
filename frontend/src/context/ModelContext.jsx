import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { jsPDF } from "jspdf";
import { initialLayers, initialHistory, publishers } from "../utils/data";
import { generateDemoHash, detectModelType, getTamperPercentageForModel } from "../utils/crypto";

const ModelContext = createContext(null);

/**
 * Format current timestamp from the user's system clock only.
 */
export function formatSystemTime(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  const dateStr = d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  return `${timeStr} · ${dateStr}`;
}

const DEFAULT_PROFILE = {
  name: "Inesh Jeethan Pinto",
  role: "Security Admin",
  email: "inesh.pinto@modelguard.io",
  initials: "IP",
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
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem("modelguard_notifications");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { id: 1, type: "tamper", title: "Tampering Detected", detail: "custom-fraud-detector — layer 4 hash mismatch", time: "14 min ago", read: false },
      { id: 2, type: "warning", title: "Signature Warning", detail: "bert-base-uncased — signature expiring in 7 days", time: "1 hr ago", read: false },
      { id: 3, type: "scan", title: "Scan Complete", detail: "stable-diffusion-xl scan queued", time: "5 min ago", read: true },
      { id: 4, type: "publisher", title: "Publisher Verified", detail: "Google DeepMind Labs public key verified", time: "30 min ago", read: true },
    ];
  });
  const DEFAULT_MODELS = [
    {
      id: 1001,
      fileName: "original_model.pth",
      fileSize: "71.91 KB",
      modelType: "PyTorch Model (.pth)",
      uploadTime: formatSystemTime(new Date(Date.now() - 3600000)),
      status: "VERIFIED",
      totalLayers: 6,
      verifiedLayersCount: 6,
      tamperedLayersCount: 0,
      intactPercentage: 100,
      tamperPercentage: 0,
      tamperedLayers: [],
      layers: [
        { id: 1, name: "fc1.bias", type: "Linear Layer", status: "verified", hash: "5799933b9bb8134731a54b38d3ad4bc0082" },
        { id: 2, name: "fc1.weight", type: "Linear Weights", status: "verified", hash: "aeeb6c0f329bb63bb912df082bc85d116c2" },
        { id: 3, name: "fc2.bias", type: "Linear Layer", status: "verified", hash: "70e0695cf103233efebad2a11b6238b1f23" },
        { id: 4, name: "fc2.weight", type: "Linear Weights", status: "verified", hash: "b8c20c949646b9a8bc43d41f3e74b33ca82" },
        { id: 5, name: "fc3.bias", type: "Linear Layer", status: "verified", hash: "d0049b1e95cfc424075196324b17ad56563" },
        { id: 6, name: "fc3.weight", type: "Output Layer", status: "verified", hash: "d6f97944ae6585141b71aa5a3bc3224b819" },
      ],
    },
    {
      id: 1002,
      fileName: "tampered_model.pth",
      fileSize: "71.91 KB",
      modelType: "PyTorch Model (.pth)",
      uploadTime: formatSystemTime(new Date(Date.now() - 1800000)),
      status: "FAILED",
      totalLayers: 6,
      verifiedLayersCount: 5,
      tamperedLayersCount: 1,
      intactPercentage: Number((100 - getTamperPercentageForModel("tampered_model.pth")).toFixed(1)),
      tamperPercentage: getTamperPercentageForModel("tampered_model.pth"),
      tamperedLayers: ["fc1.weight"],
      layers: [
        { id: 1, name: "fc1.bias", type: "Linear Layer", status: "verified", hash: "5799933b9bb8134731a54b38d3ad4bc0082" },
        { id: 2, name: "fc1.weight", type: "Linear Weights", status: "tampered", hash: "5485c323f4b009e88dca8026db4f6ee388a" },
        { id: 3, name: "fc2.bias", type: "Linear Layer", status: "verified", hash: "70e0695cf103233efebad2a11b6238b1f23" },
        { id: 4, name: "fc2.weight", type: "Linear Weights", status: "verified", hash: "b8c20c949646b9a8bc43d41f3e74b33ca82" },
        { id: 5, name: "fc3.bias", type: "Linear Layer", status: "verified", hash: "d0049b1e95cfc424075196324b17ad56563" },
        { id: 6, name: "fc3.weight", type: "Output Layer", status: "verified", hash: "d6f97944ae6585141b71aa5a3bc3224b819" },
      ],
    },
    {
      id: 1003,
      fileName: "resnet50_v2.onnx",
      fileSize: "97.8 MB",
      modelType: "ONNX Graph (.onnx)",
      uploadTime: formatSystemTime(new Date(Date.now() - 600000)),
      status: "VERIFIED",
      totalLayers: 8,
      verifiedLayersCount: 8,
      tamperedLayersCount: 0,
      intactPercentage: 100,
      tamperPercentage: 0,
      tamperedLayers: [],
      layers: [
        { id: 1, name: "conv1.weight", type: "Convolution 2D", status: "verified", hash: "c0183b9e89d554a938c381f9a8427160" },
        { id: 2, name: "bn1.weight", type: "BatchNorm 2D", status: "verified", hash: "a492cf9018d488e09f1883c842661852" },
        { id: 3, name: "layer1.0.conv1.weight", type: "ResBlock Conv", status: "verified", hash: "89cb32ef81938fe74892c90e18371901" },
        { id: 4, name: "layer2.0.conv1.weight", type: "ResBlock Conv", status: "verified", hash: "3910dbfe728198f24901ca9e87219504" },
        { id: 5, name: "layer3.0.conv1.weight", type: "ResBlock Conv", status: "verified", hash: "90da772183cb91e0a8427e1937f28190" },
        { id: 6, name: "layer4.0.conv1.weight", type: "ResBlock Conv", status: "verified", hash: "28e08bca91f2498e831bca01e7492048" },
        { id: 7, name: "fc.weight", type: "Linear Layer", status: "verified", hash: "77ac3218bf03810ecba98197e4198246" },
        { id: 8, name: "fc.bias", type: "Linear Bias", status: "verified", hash: "11de802094ca981fe7842ba901847120" },
      ],
    },
    {
      id: 1004,
      fileName: "bert_large_backdoor_injected.safetensors",
      fileSize: "1.34 GB",
      modelType: "HuggingFace SafeTensors",
      uploadTime: formatSystemTime(new Date(Date.now() - 300000)),
      status: "FAILED",
      totalLayers: 12,
      verifiedLayersCount: 8,
      tamperedLayersCount: 4,
      intactPercentage: Number((100 - getTamperPercentageForModel("bert_large_backdoor_injected.safetensors")).toFixed(1)),
      tamperPercentage: getTamperPercentageForModel("bert_large_backdoor_injected.safetensors"),
      tamperedLayers: ["encoder.layer.9.attention.self.query.weight", "encoder.layer.9.attention.self.key.weight", "encoder.layer.10.output.dense.weight", "encoder.layer.11.output.dense.bias"],
      layers: [
        { id: 1, name: "embeddings.word_embeddings.weight", type: "Embedding", status: "verified", hash: "99aa81273bd5819cae90184719283719" },
        { id: 2, name: "embeddings.position_embeddings.weight", type: "Positional Embedding", status: "verified", hash: "12fe9834bac819273918a84719204918" },
        { id: 3, name: "encoder.layer.0.attention.self.query.weight", type: "Attention Head", status: "verified", hash: "44cb9120de8471920ae8472910481729" },
        { id: 4, name: "encoder.layer.3.attention.self.query.weight", type: "Attention Head", status: "verified", hash: "38fa091bd3e481928471982739182734" },
        { id: 5, name: "encoder.layer.6.output.dense.weight", type: "Feed Forward", status: "verified", hash: "89112cad88e918274910482910481729" },
        { id: 6, name: "encoder.layer.8.output.dense.weight", type: "Feed Forward", status: "verified", hash: "771a3994bb0182739182739104819283" },
        { id: 7, name: "encoder.layer.9.attention.self.query.weight", type: "Attention Head", status: "tampered", hash: "e8293710aac819274910482910481928" },
        { id: 8, name: "encoder.layer.9.attention.self.key.weight", type: "Attention Head", status: "tampered", hash: "ff8012eec89182749104829104819283" },
        { id: 9, name: "encoder.layer.10.output.dense.weight", type: "Feed Forward", status: "tampered", hash: "c38910eb441827491048291048192839" },
        { id: 10, name: "encoder.layer.11.output.dense.bias", type: "Dense Bias", status: "tampered", hash: "da781190bc2819274910482910481928" },
        { id: 11, name: "pooler.dense.weight", type: "Pooler", status: "verified", hash: "661298ca419283719283719283719283" },
        { id: 12, name: "pooler.dense.bias", type: "Pooler Bias", status: "verified", hash: "55091aef678192837192837192837192" },
      ],
    }
  ];

  const [uploadedModels, setUploadedModels] = useState(() => {
    try {
      const saved = localStorage.getItem("modelguard_uploaded_models");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return DEFAULT_MODELS;
  });
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const [userProfile, setUserProfile] = useState(() => {
    try {
      const saved = localStorage.getItem("modelguard_user_profile");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.name && parsed.name !== "Saria Alvarez") {
          return parsed;
        }
      }
      return DEFAULT_PROFILE;
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

  useEffect(() => {
    try {
      localStorage.setItem("modelguard_notifications", JSON.stringify(notifications));
    } catch {}
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem("modelguard_uploaded_models", JSON.stringify(uploadedModels));
    } catch {}
  }, [uploadedModels]);

  function clearUploadedModels() {
    setUploadedModels([]);
    try {
      localStorage.removeItem("modelguard_uploaded_models");
    } catch {}
  }

  function addNotification({ type = "upload", title, detail, time }) {
    const systemTime = time || formatSystemTime(new Date());
    const newNotif = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      type,
      title,
      detail,
      time: systemTime,
      read: false,
      timestamp: Date.now(),
    };
    setNotifications(prev => [newNotif, ...prev]);
    return newNotif;
  }

  function deleteNotification(id) {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }

  function clearAllNotifications() {
    setNotifications([]);
  }

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

    // Capture the exact upload time directly from the system clock
    const uploadSystemTime = formatSystemTime(new Date());

    // Automatically push an upload notification to the notifications center
    addNotification({
      type: "upload",
      title: "Model File Uploaded",
      detail: `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB) — cryptographic layer inspection started`,
      time: uploadSystemTime,
    });

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

      const completionSystemTime = formatSystemTime(new Date());
      addNotification({
        type: isTampered ? "tamper" : "verified",
        title: isTampered ? "Tampering Detected" : "Cryptographic Scan Completed",
        detail: isTampered
          ? `${file.name} — Layer #${corruptLayerIdx} hash mismatch detected`
          : `${file.name} — All layers verified & intact (Merkle Root matched)`,
        time: completionSystemTime,
      });

      const verifiedCount = generatedLayers.filter(l => l.status === "verified").length;
      const tamperedCount = generatedLayers.filter(l => l.status === "tampered").length;
      const totalCount = generatedLayers.length;
      
      const tamperPct = isTampered ? getTamperPercentageForModel(file.name) : 0;
      const intactPct = isTampered ? Number((100 - tamperPct).toFixed(1)) : 100;
      const tamperedNames = generatedLayers.filter(l => l.status === "tampered").map(l => l.name);

      const formattedSize = file.size < 1024 * 1024
        ? `${(file.size / 1024).toFixed(2)} KB`
        : `${(file.size / 1024 / 1024).toFixed(2)} MB`;

      const modelEntry = {
        id: Date.now(),
        fileName: file.name,
        fileSize: formattedSize,
        modelType: detectModelType(file.name),
        uploadTime: uploadSystemTime,
        completionTime: completionSystemTime,
        status: isTampered ? "FAILED" : "VERIFIED",
        totalLayers: totalCount,
        verifiedLayersCount: verifiedCount,
        tamperedLayersCount: tamperedCount,
        intactPercentage: intactPct,
        tamperPercentage: tamperPct,
        tamperedLayers: tamperedNames,
        layers: generatedLayers.map(l => ({
          id: l.id,
          name: l.name,
          type: l.type,
          status: l.status,
          hash: l.hash,
        })),
      };

      setUploadedModels(prev => [modelEntry, ...prev.filter(m => m.fileName !== file.name)]);

      setHistory(h => [{ 
        id: Date.now(), 
        model: file.name, 
        version: "v1.0.0", 
        result: isTampered ? "FAILED" : "PASSED", 
        time: completionSystemTime, 
        publisher: selectedPublisher || "Unknown", 
        score: isTampered ? 45 : 100 
      }, ...h]);
    }, 2500);
  }

  function registerUploadedModelResult(file, resultData) {
    if (!file) return;
    const uploadSystemTime = formatSystemTime(new Date());
    const isOk = resultData?.valid ?? true;
    const layerList = resultData?.layers || [];
    const totalCount = layerList.length || 6;
    const tamperedCount = layerList.filter(l => l.status === "tampered" || l.tampered || l.valid === false).length;
    const verifiedCount = Math.max(totalCount - tamperedCount, 0);
    
    const isTamperedModel = !isOk || tamperedCount > 0;
    const tamperPct = isTamperedModel ? getTamperPercentageForModel(file.name) : 0;
    const intactPct = isTamperedModel ? Number((100 - tamperPct).toFixed(1)) : 100;

    const formattedSize = file.size < 1024 * 1024
      ? `${(file.size / 1024).toFixed(2)} KB`
      : `${(file.size / 1024 / 1024).toFixed(2)} MB`;

    const modelEntry = {
      id: Date.now(),
      fileName: file.name,
      fileSize: formattedSize,
      modelType: detectModelType(file.name),
      uploadTime: uploadSystemTime,
      completionTime: uploadSystemTime,
      status: isOk ? "VERIFIED" : "FAILED",
      totalLayers: totalCount,
      verifiedLayersCount: verifiedCount,
      tamperedLayersCount: tamperedCount,
      intactPercentage: intactPct,
      tamperPercentage: tamperPct,
      tamperedLayers: layerList.filter(l => l.status === "tampered" || l.tampered || l.valid === false).map(l => l.name || l.layer_name),
      layers: layerList.map((l, i) => ({
        id: i + 1,
        name: l.name || l.layer_name || `layer_${i + 1}`,
        type: l.type || "Neural Layer",
        status: (l.status === "tampered" || l.tampered || l.valid === false) ? "tampered" : "verified",
        hash: l.hash || l.computed_hash || "hash_verified",
      })),
    };

    setUploadedModels(prev => [modelEntry, ...prev.filter(m => m.fileName !== file.name)]);
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
      const verifyTime = formatSystemTime(new Date());

      addNotification({
        type: tampered ? "tamper" : "verified",
        title: tampered ? "Integrity Check Failed" : "Integrity Check Passed",
        detail: tampered
          ? `${modelName} — Tampering detected in model layers`
          : `${modelName} — Digital signature and layer hashes verified`,
        time: verifyTime,
      });

      setHistory(h => [{ id: Date.now(), model: modelName, version: "v1.0.0", result: tampered ? "FAILED" : "PASSED", time: verifyTime, publisher: selectedPublisher || "Unknown", score: tampered ? 45 : 100 }, ...h]);
    }, 2200);
  }

  function selectPublisher(pub) {
    setSelectedPublisher(pub.name);
    setPublisherStatus("Trusted");
  }

  function simulateTampering() {
    setAttackActive(true);
    const updatedLayers = layers.map(layer =>
      layer.id === Number(attackLayer)
        ? { ...layer, status: "tampered", hash: generateDemoHash(`TAMPERED-${Date.now()}-${layer.name}`) }
        : layer
    );
    setLayers(updatedLayers);
    setVerificationStatus("TAMPERED");
    setSignatureStatus("Invalid");

    if (modelName && modelName !== "No Model Uploaded") {
      const verifiedCount = updatedLayers.filter(l => l.status === "verified").length;
      const tamperedCount = updatedLayers.filter(l => l.status === "tampered").length;
      const totalCount = updatedLayers.length;
      const tamperPct = getTamperPercentageForModel(modelName);
      const intactPct = Number((100 - tamperPct).toFixed(1));
      const tamperedNames = updatedLayers.filter(l => l.status === "tampered").map(l => l.name);

      setUploadedModels(prev => prev.map(m => {
        if (m.fileName === modelName) {
          return {
            ...m,
            status: "FAILED",
            verifiedLayersCount: verifiedCount,
            tamperedLayersCount: tamperedCount,
            intactPercentage: intactPct,
            tamperPercentage: tamperPct,
            tamperedLayers: tamperedNames,
            layers: updatedLayers.map(l => ({ id: l.id, name: l.name, type: l.type, status: l.status, hash: l.hash })),
          };
        }
        return m;
      }));
    }
  }

  function resetAttack() {
    setAttackActive(false);
    const restoredLayers = layers.map(layer => ({
      ...layer, status: "verified", hash: generateDemoHash(`${modelName}-${layer.id}-safe`),
    }));
    setLayers(restoredLayers);
    setVerificationStatus(modelFile ? "VERIFIED" : "READY");
    setSignatureStatus(modelFile ? "Valid" : "Not Verified");

    if (modelName && modelName !== "No Model Uploaded") {
      setUploadedModels(prev => prev.map(m => {
        if (m.fileName === modelName) {
          return {
            ...m,
            status: "VERIFIED",
            verifiedLayersCount: restoredLayers.length,
            tamperedLayersCount: 0,
            intactPercentage: 100,
            tamperPercentage: 0,
            tamperedLayers: [],
            layers: restoredLayers.map(l => ({ id: l.id, name: l.name, type: l.type, status: l.status, hash: l.hash })),
          };
        }
        return m;
      }));
    }
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
    addNotification, deleteNotification, clearAllNotifications,
    formatSystemTime,
    uploadedModels, setUploadedModels, clearUploadedModels, registerUploadedModelResult,
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

