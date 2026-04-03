"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";
import { CheckCircle2, Download, ArrowLeft, Printer, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function RequestSuccessPage() {
  const { id } = useParams();
  const router = useRouter();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchRequest() {
      try {
        const response = await fetch(`/api/requests/${id}`);
        if (!response.ok) throw new Error("Not found");
        setRequest(await response.json());
      } catch {
        toast.error("Failed to load request details");
        router.push("/request");
      } finally {
        setLoading(false);
      }
    }
    fetchRequest();
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const verificationUrl = `${window.location.origin}/verify/${id}`;

  const handleDownload = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) {
      toast.error("QR code not ready yet");
      return;
    }
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `visitor-pass-${id}.png`;
    link.href = url;
    link.click();
    toast.success("QR code downloaded!");
  };

  const handlePrint = () => window.print();

  return (
    <div className="container max-w-xl px-4 py-12 mx-auto">
      <div className="p-6 text-center bg-white border rounded-2xl shadow-sm sm:p-10">
        <div className="flex justify-center mb-6">
          <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <h1 className="mb-2 text-2xl font-bold text-slate-900 sm:text-3xl">Submission Successful!</h1>
        <p className="mb-8 text-slate-500 text-sm">
          Your request is <strong>pending admin approval</strong>. Save this QR code — show it at the entrance after approval.
        </p>

        {/* QR Code — canvas-based for reliable download */}
        <div ref={qrRef} className="inline-block p-6 mb-8 bg-slate-50 rounded-2xl border border-slate-100">
          <QRCodeCanvas
            value={verificationUrl}
            size={200}
            level="H"
            includeMargin={true}
          />
          <div className="mt-3 text-xs font-mono text-slate-500 select-all">
            ID: {id}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-4 text-left bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Visitor</p>
            <p className="font-semibold text-slate-900">{request?.name}</p>
          </div>
          <div className="p-4 text-left bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Date & Time</p>
            <p className="font-semibold text-slate-900">
              {request?.visitDate && new Date(request.visitDate).toLocaleDateString()} at {request?.visitTime || "N/A"}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-500 transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            Download QR Pass
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>

        <button
          onClick={() => router.push("/")}
          className="mt-6 text-sm font-medium text-slate-500 hover:text-blue-600 flex items-center justify-center gap-2 mx-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>
      </div>
    </div>
  );
}
