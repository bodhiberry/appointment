"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Users, Search, Filter, ExternalLink, Loader2,
  CheckCircle, XCircle, Clock, LogOut, FileText,
  CheckCircle2, Image as ImageIcon, ChevronDown, ChevronUp
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700 border-amber-200",
  APPROVED: "bg-blue-100 text-blue-700 border-blue-200",
  CHECKED_IN: "bg-green-100 text-green-700 border-green-200",
  COMPLETED: "bg-slate-100 text-slate-700 border-slate-200",
  REJECTED: "bg-red-100 text-red-700 border-red-200",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  CHECKED_IN: "Checked In",
  COMPLETED: "Completed",
  REJECTED: "Rejected",
};

export default function AdminDashboard() {
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    setLoading(true);
    try {
      const res = await fetch("/api/requests");
      if (!res.ok) throw new Error();
      setRequests(await res.json());
    } catch {
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(requestId: string, status: string) {
    setUpdatingId(requestId);
    try {
      const res = await fetch(`/api/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Status updated to ${STATUS_LABELS[status]}`);
      fetchRequests();
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  }

  const filtered = requests.filter((r) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      r.name.toLowerCase().includes(q) ||
      r.requestId.toLowerCase().includes(q) ||
      r.citizenshipNo.toLowerCase().includes(q) ||
      r.organization.toLowerCase().includes(q);
    const matchStatus = statusFilter === "ALL" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "PENDING").length,
    approved: requests.filter((r) => r.status === "APPROVED").length,
    completed: requests.filter((r) => r.status === "COMPLETED").length,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Nav */}
      <header className="sticky top-0 z-40 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <div>
              <span className="font-bold text-slate-900">SM Admin</span>
              <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Dashboard</span>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total", value: stats.total, color: "text-slate-900", bg: "bg-white" },
            { label: "Pending", value: stats.pending, color: "text-amber-700", bg: "bg-amber-50" },
            { label: "Approved", value: stats.approved, color: "text-blue-700", bg: "bg-blue-50" },
            { label: "Completed", value: stats.completed, color: "text-slate-600", bg: "bg-slate-100" },
          ].map((s) => (
            <div key={s.label} className={cn("rounded-2xl border p-5", s.bg)}>
              <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">{s.label}</p>
              <p className={cn("text-3xl font-bold mt-1", s.color)}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, ID, citizenship, organization..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <select
              className="pl-10 pr-6 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 appearance-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="CHECKED_IN">Checked In</option>
              <option value="COMPLETED">Completed</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          <button onClick={fetchRequests} className="px-4 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-colors">
            Refresh
          </button>
        </div>

        {/* Table */}
        <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20 gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-slate-500">Loading records...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <Users className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500">No requests found</p>
            </div>
          ) : (
            <div className="divide-y">
              {filtered.map((req) => (
                <div key={req.id}>
                  {/* Row */}
                  <div
                    className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/70 cursor-pointer transition-colors"
                    onClick={() => setExpandedId(expandedId === req.requestId ? null : req.requestId)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-900 truncate">{req.name}</p>
                        <span className={cn("px-2 py-0.5 rounded-full text-xs font-bold border shrink-0", STATUS_COLORS[req.status])}>
                          {STATUS_LABELS[req.status] ?? req.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        {req.organization} · {req.purpose} · Meet: {req.personToMeet}
                      </p>
                      <p className="text-xs font-mono text-slate-400 mt-0.5">{req.requestId}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {req.documentUrl && (
                        <span className="text-blue-500"><ImageIcon className="w-4 h-4" /></span>
                      )}
                      {expandedId === req.requestId ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Detail */}
                  {expandedId === req.requestId && (
                    <div className="bg-slate-50 border-t px-6 py-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Info */}
                        <div className="space-y-3">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Visitor Details</h3>
                          {[
                            ["Name", req.name],
                            ["Citizenship / ID", req.citizenshipNo],
                            ["Organization", req.organization],
                            ["Purpose", req.purpose],
                            ["Person to Meet", req.personToMeet],
                            ["Visit Date", new Date(req.visitDate).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })],
                            ["Visit Time", req.visitTime],
                            ["Phone", req.phone],
                            ["Email", req.email],
                          ].map(([label, value]) => (
                            <div key={label} className="flex gap-2">
                              <span className="text-xs text-slate-400 w-32 shrink-0">{label}</span>
                              <span className="text-sm text-slate-800 font-medium">{value}</span>
                            </div>
                          ))}
                        </div>

                        {/* Document + Actions */}
                        <div>
                          {req.documentUrl ? (
                            <div className="mb-5">
                              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Citizenship Document</h3>
                              <a href={req.documentUrl} target="_blank" rel="noopener noreferrer" className="block">
                                <img
                                  src={req.documentUrl}
                                  alt="Citizenship Document"
                                  className="rounded-xl border object-cover max-h-48 w-full hover:opacity-90 transition-opacity"
                                />
                                <p className="text-xs text-blue-600 mt-1">Click to view full size</p>
                              </a>
                            </div>
                          ) : (
                            <div className="mb-5 bg-white border border-dashed rounded-xl p-4 text-center text-slate-400 text-sm">
                              <FileText className="w-6 h-6 mx-auto mb-1" />
                              No document uploaded
                            </div>
                          )}

                          {/* Action Buttons */}
                          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Actions</h3>
                          <div className="flex flex-wrap gap-2">
                            {req.status === "PENDING" && (
                              <>
                                <button
                                  onClick={() => updateStatus(req.requestId, "APPROVED")}
                                  disabled={updatingId === req.requestId}
                                  className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-500 transition-colors disabled:opacity-50"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  Approve
                                </button>
                                <button
                                  onClick={() => updateStatus(req.requestId, "REJECTED")}
                                  disabled={updatingId === req.requestId}
                                  className="flex items-center gap-1.5 px-3 py-2 bg-red-100 text-red-700 text-sm font-medium rounded-xl hover:bg-red-200 transition-colors disabled:opacity-50"
                                >
                                  <XCircle className="w-4 h-4" />
                                  Reject
                                </button>
                              </>
                            )}
                            {req.status === "APPROVED" && (
                              <button
                                onClick={() => updateStatus(req.requestId, "REJECTED")}
                                disabled={updatingId === req.requestId}
                                className="flex items-center gap-1.5 px-3 py-2 bg-red-100 text-red-700 text-sm font-medium rounded-xl hover:bg-red-200 transition-colors disabled:opacity-50"
                              >
                                <XCircle className="w-4 h-4" />
                                Revoke Approval
                              </button>
                            )}
                            {req.status === "CHECKED_IN" && (
                              <button
                                onClick={() => updateStatus(req.requestId, "COMPLETED")}
                                disabled={updatingId === req.requestId}
                                className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-700 transition-colors disabled:opacity-50"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                Mark as Completed
                              </button>
                            )}
                            {req.status === "COMPLETED" && (
                              <span className="px-3 py-2 bg-slate-100 text-slate-500 text-sm rounded-xl">
                                Visit Completed
                              </span>
                            )}
                            <button
                              onClick={() => router.push(`/verify/${req.requestId}`)}
                              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-200 transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                              View QR Page
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
