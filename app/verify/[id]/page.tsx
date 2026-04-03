"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CheckCircle, XCircle, Clock, Loader2, Search, ShieldCheck, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const STATUS_CONFIG: Record<string, { label: string; icon: any; bg: string; text: string; border: string; subtitle: string }> = {
  APPROVED: {
    label: "Access Granted",
    icon: CheckCircle,
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    subtitle: "This visitor is approved to enter.",
  },
  PENDING: {
    label: "Pending Approval",
    icon: Clock,
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    subtitle: "This request is awaiting admin approval.",
  },
  CHECKED_IN: {
    label: "Currently Checked In",
    icon: ShieldCheck,
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    subtitle: "Visitor has already been checked in.",
  },
  COMPLETED: {
    label: "Visit Completed",
    icon: AlertTriangle,
    bg: "bg-slate-50",
    text: "text-slate-600",
    border: "border-slate-200",
    subtitle: "This visit pass has been used and is no longer valid.",
  },
  REJECTED: {
    label: "Access Denied",
    icon: XCircle,
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    subtitle: "This visitor request has been rejected.",
  },
};

export default function VerificationPage() {
  const { id } = useParams();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (id) fetchById(id as string);
  }, [id]);

  async function fetchById(requestId: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/requests/${requestId}`);
      if (!res.ok) throw new Error("Not found");
      setRequest(await res.json());
    } catch {
      setRequest(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/requests?q=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();
      
      if (data.length > 0) {
        // Prioritize: APPROVED > PENDING > others, then by date (already DESC from API)
        const prioritized = data.sort((a: any, b: any) => {
          const statusOrder: Record<string, number> = { APPROVED: 0, PENDING: 1, CHECKED_IN: 2, COMPLETED: 3, REJECTED: 4 };
          const orderA = statusOrder[a.status] ?? 99;
          const orderB = statusOrder[b.status] ?? 99;
          if (orderA !== orderB) return orderA - orderB;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        
        setRequest(prioritized[0]);
        if (data.length > 1) {
          toast.info(`Found ${data.length} applications. Showing the most relevant one.`);
        }
      } else {
        toast.error("No record found for that ID or citizenship number.");
        setRequest(null);
      }
    } catch {
      toast.error("Search failed. Try again.");
    } finally {
      setSearching(false);
    }
  }

  async function handleCheckIn() {
    if (!request) return;
    setCheckingIn(true);
    try {
      const res = await fetch(`/api/requests/${request.requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CHECKED_IN" }),
      });
      if (!res.ok) throw new Error();
      toast.success("Visitor checked in successfully!");
      setRequest((prev: any) => ({ ...prev, status: "CHECKED_IN" }));
    } catch {
      toast.error("Check-in failed.");
    } finally {
      setCheckingIn(false);
    }
  }

  const config = request ? STATUS_CONFIG[request.status] ?? STATUS_CONFIG.REJECTED : null;
  const StatusIcon = config?.icon;

  return (
    <div className="container max-w-lg px-4 py-12 mx-auto">
      {/* Search Box */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-center mb-2">Gate Verification</h1>
        <p className="text-slate-500 text-sm text-center mb-6">Scan QR or search by Request ID / Citizenship Number</p>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Enter Request ID or Citizenship No..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-500 disabled:opacity-50 transition-colors"
          >
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
          </button>
        </form>
      </div>

      {/* Result */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : !request ? (
        <div className="text-center py-12 border rounded-2xl bg-white">
          <XCircle className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500">No visitor found</p>
          <p className="text-xs text-slate-400 mt-1">Search by ID or citizenship number above</p>
        </div>
      ) : (
        <div className={`rounded-2xl border-2 ${config?.border} ${config?.bg} p-6`}>
          {/* Status Badge */}
          <div className={`flex items-center gap-3 mb-5 ${config?.text}`}>
            {StatusIcon && <StatusIcon className="w-8 h-8" />}
            <div>
              <h2 className="text-xl font-bold">{config?.label}</h2>
              <p className="text-sm opacity-80">{config?.subtitle}</p>
            </div>
          </div>

          {/* Visitor Info */}
          <div className="bg-white rounded-xl border p-4 space-y-2.5 mb-5">
            {[
              ["Name", request.name],
              ["Citizenship / ID", request.citizenshipNo],
              ["Organization", request.organization],
              ["Purpose", request.purpose],
              ["Person to Meet", request.personToMeet],
              ["Visit Date", new Date(request.visitDate).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })],
              ["Visit Time", request.visitTime],
              ["Request ID", request.requestId],
            ].map(([label, value]) => (
              <div key={label} className="flex gap-2 text-sm">
                <span className="text-slate-400 w-32 shrink-0">{label}</span>
                <span className="font-medium text-slate-800">{value}</span>
              </div>
            ))}
          </div>

          {/* Check-In Button */}
          {request.status === "APPROVED" && (
            <button
              onClick={handleCheckIn}
              disabled={checkingIn}
              className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50"
            >
              {checkingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
              {checkingIn ? "Processing..." : "Confirm Check-In"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
