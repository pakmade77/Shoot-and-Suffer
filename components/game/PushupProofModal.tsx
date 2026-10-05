"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Upload,
  Download,
  Share2,
  X,
  Sparkles,
  CheckCircle,
  RefreshCw,
  Dumbbell,
  AlertCircle,
  Flame,
} from "lucide-react";
import { sounds } from "@/lib/sound";

interface PushupProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  loserName: string;
  loserNickname?: string | null;
  pushupAmount: number;
  score: number;
  gameId: string;
}

export function PushupProofModal({
  isOpen,
  onClose,
  loserName,
  loserNickname,
  pushupAmount,
  score,
  gameId,
}: PushupProofModalProps) {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [compositeImage, setCompositeImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stop camera helper
  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  // Start camera helper
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API not supported in this browser.");
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error(err);
      setCameraError("Tidak dapat mengakses kamera. Silakan pilih unggah foto galeri.");
      setIsCameraActive(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setCapturedImage(null);
      setCompositeImage(null);
      setCameraError(null);
    }
  }, [isOpen, stopCamera]);

  // Generate Watermarked Canvas Image
  const generateWatermarkedImage = useCallback(
    (baseImageSrc: string) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const targetWidth = 900;
        const targetHeight = 1200;
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // 1. Draw Background photo (cover fit)
        ctx.fillStyle = "#0d1117";
        ctx.fillRect(0, 0, targetWidth, targetHeight);

        // Aspect ratio cover calculation
        const hRatio = targetWidth / img.width;
        const vRatio = targetHeight / img.height;
        const ratio = Math.max(hRatio, vRatio);
        const centerShiftX = (targetWidth - img.width * ratio) / 2;
        const centerShiftY = (targetHeight - img.height * ratio) / 2;
        ctx.drawImage(img, 0, 0, img.width, img.height, centerShiftX, centerShiftY, img.width * ratio, img.height * ratio);

        // 2. Dark Cyber/Streetball Gradient Overlays
        const topGrad = ctx.createLinearGradient(0, 0, 0, 320);
        topGrad.addColorStop(0, "rgba(5, 7, 12, 0.92)");
        topGrad.addColorStop(0.7, "rgba(5, 7, 12, 0.6)");
        topGrad.addColorStop(1, "rgba(5, 7, 12, 0)");
        ctx.fillStyle = topGrad;
        ctx.fillRect(0, 0, targetWidth, 320);

        const bottomGrad = ctx.createLinearGradient(0, targetHeight - 420, 0, targetHeight);
        bottomGrad.addColorStop(0, "rgba(5, 7, 12, 0)");
        bottomGrad.addColorStop(0.3, "rgba(5, 7, 12, 0.75)");
        bottomGrad.addColorStop(1, "rgba(5, 7, 12, 0.98)");
        ctx.fillStyle = bottomGrad;
        ctx.fillRect(0, targetHeight - 420, targetWidth, 420);

        // 3. Cyber Neon Border & Frame
        ctx.strokeStyle = "rgba(249, 115, 22, 0.7)";
        ctx.lineWidth = 14;
        ctx.strokeRect(18, 18, targetWidth - 36, targetHeight - 36);

        ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
        ctx.lineWidth = 2;
        ctx.strokeRect(30, 30, targetWidth - 60, targetHeight - 60);

        // 4. TOP HEADER: LEAGUE BANNER
        ctx.fillStyle = "#f97316";
        ctx.fillRect(50, 48, targetWidth - 100, 52);

        ctx.fillStyle = "#ffffff";
        ctx.font = "900 24px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("🏀 SHOOT & SUFFER LEAGUE • FITNESS TAX RECEIPT", targetWidth / 2, 82);

        // Subheader timestamp
        const nowStr = new Date().toLocaleString("id-ID", {
          dateStyle: "full",
          timeStyle: "short",
        });
        ctx.fillStyle = "#cbd5e1";
        ctx.font = "600 18px sans-serif";
        ctx.fillText(`VERIFIED MATCH • ${nowStr.toUpperCase()}`, targetWidth / 2, 134);

        // 5. BOTTOM WATERMARK: SUFFERER DETAILS
        // Box container
        ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
        ctx.strokeStyle = "rgba(244, 63, 94, 0.6)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(50, targetHeight - 340, targetWidth - 100, 280, 24);
        ctx.fill();
        ctx.stroke();

        // Loser Name Tag
        ctx.fillStyle = "#f43f5e";
        ctx.font = "900 20px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("💀 OFFICIAL TAXPAYER / SUFFERER", targetWidth / 2, targetHeight - 300);

        ctx.fillStyle = "#ffffff";
        ctx.font = "900 48px sans-serif";
        ctx.fillText(loserName.toUpperCase(), targetWidth / 2, targetHeight - 245);

        if (loserNickname) {
          ctx.fillStyle = "#fbbf24";
          ctx.font = "bold 22px sans-serif";
          ctx.fillText(`"${loserNickname}"`, targetWidth / 2, targetHeight - 212);
        }

        // TAX PAID BADGE
        ctx.fillStyle = "#e11d48";
        ctx.beginPath();
        ctx.roundRect(targetWidth / 2 - 250, targetHeight - 190, 500, 60, 16);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.font = "900 28px sans-serif";
        ctx.fillText(`💪 ${pushupAmount} PUSH-UPS PAID IN FULL!`, targetWidth / 2, targetHeight - 148);

        // Footnote stats
        ctx.fillStyle = "#94a3b8";
        ctx.font = "600 16px sans-serif";
        ctx.fillText(
          `Match Score: ${score}/3 Hits • Game ID: #${gameId.slice(-6)} • Stamped & Approved ✅`,
          targetWidth / 2,
          targetHeight - 88
        );

        // Set resulting data URL
        const finalDataUrl = canvas.toDataURL("image/png");
        setCompositeImage(finalDataUrl);
        sounds.playVictory();
      };
      img.src = baseImageSrc;
    },
    [loserName, loserNickname, pushupAmount, score, gameId]
  );

  // Capture Snapshot from Camera
  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 1280;
    canvas.height = videoRef.current.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setCapturedImage(dataUrl);
    stopCamera();
    generateWatermarkedImage(dataUrl);
  };

  // Upload Photo from Disk / Mobile Camera
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      setCapturedImage(src);
      generateWatermarkedImage(src);
    };
    reader.readAsDataURL(file);
  };

  // Download Generated Proof
  const handleDownload = () => {
    if (!compositeImage) return;
    sounds.playClick();
    const link = document.createElement("a");
    link.download = `bukti-pushup-${loserName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.png`;
    link.href = compositeImage;
    link.click();
  };

  // Share to WhatsApp with Meme Text
  const handleShareWhatsApp = () => {
    sounds.playClick();
    const caption = `🚨 *BUKTI LUNAS PUSH-UP KANTOR* 🚨%0A%0ASi *@${loserName}* baru saja menyelesaikan hukuman *${pushupAmount} PUSH-UPS* di Shoot & Suffer! 💪💀%0A%0A🎯 Skor: ${score}/3 Hits%0A🏆 Status: LUNAS & BEROTOT 🔥%0A%0A_Shoot & Suffer Coffee Break League_`;
    const waUrl = `https://wa.me/?text=${caption}`;
    window.open(waUrl, "_blank");
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative z-10 w-full max-w-lg rounded-3xl border-2 border-victim-red/50 bg-surface p-6 shadow-2xl space-y-5 my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-victim-red/20 text-victim-red">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase text-white tracking-wide">
                  📸 Kamera Bukti Hukuman
                </h3>
                <p className="text-xs text-gray-400">
                  Foto selfie {loserName} saat push-up + watermark resmi!
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {cameraError && (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-rose-300 flex items-center gap-2.5 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{cameraError}</span>
            </div>
          )}

          {/* VIEWPORT / PREVIEW AREA */}
          <div className="relative aspect-[3/4] w-full rounded-2xl border-2 border-dashed border-white/20 bg-black/60 overflow-hidden flex flex-col items-center justify-center shadow-inner">
            {compositeImage ? (
              /* FINAL COMPOSITED IMAGE PREVIEW */
              <div className="relative h-full w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={compositeImage}
                  alt="Bukti Push-up"
                  className="h-full w-full object-contain"
                />
                <div className="absolute top-3 right-3 rounded-full bg-emerald-500/90 text-white text-[11px] font-black uppercase px-3 py-1 flex items-center gap-1 shadow-lg">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Watermarked
                </div>
              </div>
            ) : isCameraActive ? (
              /* LIVE CAMERA FEED */
              <div className="relative h-full w-full">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="h-full w-full object-cover"
                />
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                  <button
                    type="button"
                    onClick={handleCapturePhoto}
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-victim-red border-4 border-white text-white shadow-2xl hover:scale-105 active:scale-95 transition-all"
                  >
                    <Camera className="w-7 h-7" />
                  </button>
                </div>
              </div>
            ) : (
              /* INITIAL PLACEHOLDER */
              <div className="p-6 text-center space-y-4">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-victim-red/15 text-4xl border border-victim-red/30">
                  💪
                </div>
                <div>
                  <p className="font-bold text-base text-white">
                    Ambil Foto {loserName} Sedang Push-up
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Hukuman: <strong className="text-rose-400">{pushupAmount} Push-ups</strong>
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={startCamera}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-hoop-orange to-hoop-amber px-5 py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-hoop-orange/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    <Camera className="w-4 h-4" />
                    Buka Kamera
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-xs font-black uppercase tracking-wider text-gray-200 hover:bg-white/10 hover:text-white transition-all"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Foto
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
              </div>
            )}
          </div>

          {/* ACTION BUTTONS (AFTER GENERATION) */}
          {compositeImage && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-hoop-orange to-hoop-amber py-3.5 px-4 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-hoop-orange/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Download className="w-4 h-4" />
                  Download PNG
                </button>

                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 py-3.5 px-4 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-emerald-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Share2 className="w-4 h-4" />
                  Share WhatsApp
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setCompositeImage(null);
                  setCapturedImage(null);
                }}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-bold text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Ambil Ulang Foto
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
