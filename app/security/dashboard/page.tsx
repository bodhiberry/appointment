"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ShieldCheck, 
  MoreVertical,
  ExternalLink,
  ChevronRight,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function SecurityDashboard() {
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    setLoading(true);
    try {
      const response = await fetch("/api/requests");
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  }

  const filteredRequests = requests.filter(req => {
    const matchesSearch = 
      req.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.requestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.organization.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "ALL" || req.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-amber-100 text-amber-700 border-amber-200";
      case "APPROVED": return "bg-blue-100 text-blue-700 border-blue-200";
      case "CHECKED_IN": return "bg-green-100 text-green-700 border-green-200";
      case "REJECTED": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="container max-w-7xl px-4 py-8 mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Security Dashboard</h1>
          <p className="text-slate-500">Manage and verify visitor requests for SM entry.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl border border-blue-100 flex items-center gap-2 font-semibold">
            <Users className="w-5 h-5" />
            <span>{requests.length} Total Visits</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, ID, or organization..."
            className="w-full pl-10 pr-4 py-2 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <select
            className="w-full pl-10 pr-4 py-2 bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 appearance-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="CHECKED_IN">Checked In</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
        <button 
          onClick={fetchRequests}
          className="px-4 py-2 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors"
        >
          Refresh Data
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-slate-500 font-medium">Loading visitor records...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900">No requests found</h3>
            <p className="text-slate-500">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Visitor</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Organization</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Purpose</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{req.name}</div>
                      <div className="text-xs font-mono text-slate-400">{req.requestId}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{req.organization}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <div>{req.purpose}</div>
                      <div className="text-xs text-slate-400">Meeting: {req.personToMeet}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-bold border",
                        getStatusColor(req.status)
                      )}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => router.push(`/verify/${req.requestId}`)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Verify Pass"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
