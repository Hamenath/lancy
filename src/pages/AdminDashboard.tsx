import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { 
  Users, 
  Briefcase, 
  FileText, 
  ShieldAlert, 
  Activity, 
  AlertTriangle, 
  Search
} from "lucide-react";
import { adminService } from "../services/adminService";
import type { 
  DashboardStats, 
  AdminUser, 
  AdminProject, 
  AdminDispute, 
  AdminAuditLog 
} from "../services/adminService";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "projects" | "disputes" | "audit">("overview");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [usersList, setUsersList] = useState<AdminUser[]>([]);
  const [projectsList, setProjectsList] = useState<AdminProject[]>([]);
  const [disputesList, setDisputesList] = useState<AdminDispute[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [selectedDispute, setSelectedDispute] = useState<AdminDispute | null>(null);
  const [resolutionText, setResolutionText] = useState("");
  const [suspendReason, setSuspendReason] = useState("");
  const [selectedUserForSuspend, setSelectedUserForSuspend] = useState<AdminUser | null>(null);

  useEffect(() => {
    if (!user) return;

    async function loadData() {
      try {
        const [s, u, p, d, a] = await Promise.all([
          adminService.getDashboardStats(),
          adminService.getUsers(1, 20, undefined, undefined, userSearch),
          adminService.getProjects(1, 20),
          adminService.getDisputes(),
          adminService.getAuditLogs(1, 20),
        ]);
        if (s) setStats(s);
        if (u) setUsersList(u.items);
        if (p) setProjectsList(p.items);
        if (d) setDisputesList(d);
        if (a) setAuditLogs(a.items);
      } catch (err) {
        console.error("Error loading admin dashboard:", err);
      }
    }

    loadData();
  }, [user, userSearch]);

  const handleSuspend = async () => {
    if (!selectedUserForSuspend || !suspendReason.trim()) return;
    await adminService.suspendUser(selectedUserForSuspend.id, suspendReason.trim());
    setSelectedUserForSuspend(null);
    setSuspendReason("");
    const updated = await adminService.getUsers(1, 20);
    if (updated) setUsersList(updated.items);
  };

  const handleRestore = async (userId: string) => {
    await adminService.restoreUser(userId);
    const updated = await adminService.getUsers(1, 20);
    if (updated) setUsersList(updated.items);
  };

  const handleModerateProject = async (projectId: string, status: string) => {
    await adminService.moderateProject(projectId, status);
    const updated = await adminService.getProjects(1, 20);
    if (updated) setProjectsList(updated.items);
  };

  const handleResolveDispute = async () => {
    if (!selectedDispute || !resolutionText.trim()) return;
    await adminService.resolveDispute(selectedDispute.id, resolutionText.trim());
    setSelectedDispute(null);
    setResolutionText("");
    const updated = await adminService.getDisputes();
    if (updated) setDisputesList(updated);
  };

  if (!user || (user as any).role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center p-6 space-y-4">
        <ShieldAlert className="size-12 text-red-500" />
        <h2 className="text-xl font-bold">Access Restricted</h2>
        <p className="text-xs text-neutral-400 text-center max-w-sm">
          You must be authenticated as a system Administrator to view the Trust & Safety control panel.
        </p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black text-white antialiased flex flex-col justify-between">
      <div className="flex-1 flex flex-col">
        <Navbar />

        <div className="flex-1 w-full px-4 md:px-8 pt-28 pb-12 flex flex-col lg:flex-row gap-8">
          {/* Admin Sidebar Navigation */}
          <aside className="w-full lg:w-64 border border-neutral-900 bg-neutral-950/40 p-4 rounded-none h-fit space-y-2">
            <div className="border-b border-neutral-900 pb-3 mb-2 px-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-primary">Lancy Control Panel</span>
              <h2 className="text-sm font-black tracking-tight text-white">Trust & Safety</h2>
            </div>

            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold transition-colors rounded-none ${
                activeTab === "overview" ? "bg-white text-black" : "text-neutral-400 hover:text-white hover:bg-neutral-900"
              }`}
            >
              <Activity className="size-4" /> Overview & Metrics
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold transition-colors rounded-none ${
                activeTab === "users" ? "bg-white text-black" : "text-neutral-400 hover:text-white hover:bg-neutral-900"
              }`}
            >
              <Users className="size-4" /> User Management
            </button>
            <button
              onClick={() => setActiveTab("projects")}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold transition-colors rounded-none ${
                activeTab === "projects" ? "bg-white text-black" : "text-neutral-400 hover:text-white hover:bg-neutral-900"
              }`}
            >
              <Briefcase className="size-4" /> Project Moderation
            </button>
            <button
              onClick={() => setActiveTab("disputes")}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold transition-colors rounded-none ${
                activeTab === "disputes" ? "bg-white text-black" : "text-neutral-400 hover:text-white hover:bg-neutral-900"
              }`}
            >
              <AlertTriangle className="size-4" /> Disputes & Reports
            </button>
            <button
              onClick={() => setActiveTab("audit")}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold transition-colors rounded-none ${
                activeTab === "audit" ? "bg-white text-black" : "text-neutral-400 hover:text-white hover:bg-neutral-900"
              }`}
            >
              <FileText className="size-4" /> Immutable Audit Logs
            </button>
          </aside>

          {/* Main Control Panel Panel */}
          <main className="flex-1 border border-neutral-900 bg-neutral-950/20 p-6 rounded-none space-y-6">
            {activeTab === "overview" && stats && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold">Platform Metrics Overview</h3>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="border border-neutral-900 bg-neutral-950 p-4 rounded-none space-y-1">
                    <span className="text-[10px] text-neutral-500 font-bold uppercase">Total Users</span>
                    <p className="text-2xl font-black">{stats.totalUsers}</p>
                    <p className="text-[10px] text-neutral-400">{stats.activeFreelancers} Freelancers | {stats.activeClients} Clients</p>
                  </div>
                  <div className="border border-neutral-900 bg-neutral-950 p-4 rounded-none space-y-1">
                    <span className="text-[10px] text-neutral-500 font-bold uppercase">Marketplace Volume</span>
                    <p className="text-2xl font-black text-brand-primary">{stats.formattedTotalVolume}</p>
                    <p className="text-[10px] text-neutral-400">{stats.completedContracts} Completed Contracts</p>
                  </div>
                  <div className="border border-neutral-900 bg-neutral-950 p-4 rounded-none space-y-1">
                    <span className="text-[10px] text-neutral-500 font-bold uppercase">Active Projects</span>
                    <p className="text-2xl font-black">{stats.activeProjects}</p>
                    <p className="text-[10px] text-neutral-400">{stats.activeContracts} Active Contracts</p>
                  </div>
                  <div className="border border-neutral-900 bg-neutral-950 p-4 rounded-none space-y-1">
                    <span className="text-[10px] text-neutral-500 font-bold uppercase">Open Disputes & Reports</span>
                    <p className="text-2xl font-black text-yellow-400">{stats.openDisputes + stats.openReports}</p>
                    <p className="text-[10px] text-neutral-400">{stats.openDisputes} Disputes | {stats.openReports} Reports</p>
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-900 pb-4">
                  <h3 className="text-base font-bold">User Management</h3>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-2.5 size-4 text-neutral-500" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full h-9 pl-9 pr-3 text-xs bg-neutral-900 border border-neutral-800 text-white rounded-none focus:outline-none focus:border-white"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto border border-neutral-900">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-900 text-neutral-400 uppercase text-[10px] font-bold">
                      <tr>
                        <th className="p-3">User</th>
                        <th className="p-3">Role</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Joined</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-900">
                      {usersList.map((u) => (
                        <tr key={u.id} className="hover:bg-neutral-900/50">
                          <td className="p-3 font-bold">{u.name} <span className="block text-[10px] text-neutral-500 font-normal">{u.email}</span></td>
                          <td className="p-3 font-semibold">{u.role}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded-none ${
                              u.status === "ACTIVE" ? "bg-green-950 text-green-400 border border-green-800" : "bg-red-950 text-red-400 border border-red-800"
                            }`}>
                              {u.status}
                            </span>
                          </td>
                          <td className="p-3 text-neutral-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                          <td className="p-3 text-right">
                            {u.status === "ACTIVE" ? (
                              <button
                                onClick={() => setSelectedUserForSuspend(u)}
                                className="px-2.5 py-1 text-[10px] bg-red-950 text-red-400 hover:bg-red-900 border border-red-800 font-bold transition-colors cursor-pointer rounded-none"
                              >
                                Suspend
                              </button>
                            ) : (
                              <button
                                onClick={() => handleRestore(u.id)}
                                className="px-2.5 py-1 text-[10px] bg-green-950 text-green-400 hover:bg-green-900 border border-green-800 font-bold transition-colors cursor-pointer rounded-none"
                              >
                                Restore
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Projects Tab */}
            {activeTab === "projects" && (
              <div className="space-y-4">
                <h3 className="text-base font-bold border-b border-neutral-900 pb-3">Project Moderation</h3>
                <div className="overflow-x-auto border border-neutral-900">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-900 text-neutral-400 uppercase text-[10px] font-bold">
                      <tr>
                        <th className="p-3">Project Title</th>
                        <th className="p-3">Client</th>
                        <th className="p-3">Budget</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-900">
                      {projectsList.map((p) => (
                        <tr key={p.id} className="hover:bg-neutral-900/50">
                          <td className="p-3 font-bold">{p.title}</td>
                          <td className="p-3 text-neutral-300">{p.client?.name || "Client"}</td>
                          <td className="p-3 font-mono">${p.budget.toLocaleString()} {p.currency}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 text-[9px] font-bold border border-neutral-800 bg-neutral-900 text-white">
                              {p.status}
                            </span>
                          </td>
                          <td className="p-3 text-right space-x-2">
                            {p.status === "HIDDEN" ? (
                              <button
                                onClick={() => handleModerateProject(p.id, "OPEN")}
                                className="px-2.5 py-1 text-[10px] bg-green-950 text-green-400 border border-green-800 font-bold hover:bg-green-900 cursor-pointer"
                              >
                                Restore
                              </button>
                            ) : (
                              <button
                                onClick={() => handleModerateProject(p.id, "HIDDEN")}
                                className="px-2.5 py-1 text-[10px] bg-red-950 text-red-400 border border-red-800 font-bold hover:bg-red-900 cursor-pointer"
                              >
                                Hide
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Disputes Tab */}
            {activeTab === "disputes" && (
              <div className="space-y-4">
                <h3 className="text-base font-bold border-b border-neutral-900 pb-3">Contract Disputes</h3>
                {disputesList.length === 0 ? (
                  <p className="text-xs text-neutral-500 text-center py-8">No open contract disputes.</p>
                ) : (
                  <div className="space-y-3">
                    {disputesList.map((d) => (
                      <div key={d.id} className="border border-neutral-900 bg-neutral-950 p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{d.contract?.title}</span>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 bg-yellow-950 text-yellow-400 border border-yellow-800 uppercase">
                              {d.status}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-400 mt-1">Reason: {d.reason}</p>
                          <p className="text-[11px] text-neutral-500 mt-0.5">{d.description}</p>
                        </div>
                        {d.status !== "RESOLVED" && (
                          <button
                            onClick={() => setSelectedDispute(d)}
                            className="px-3 py-1.5 text-xs bg-white text-black font-bold hover:bg-neutral-200 cursor-pointer"
                          >
                            Resolve Dispute
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Audit Logs Tab */}
            {activeTab === "audit" && (
              <div className="space-y-4">
                <h3 className="text-base font-bold border-b border-neutral-900 pb-3">Immutable Append-Only Audit Trail</h3>
                <div className="overflow-x-auto border border-neutral-900">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-900 text-neutral-400 uppercase text-[10px] font-bold">
                      <tr>
                        <th className="p-3">Timestamp</th>
                        <th className="p-3">Actor</th>
                        <th className="p-3">Action</th>
                        <th className="p-3">Entity</th>
                        <th className="p-3">Metadata</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-900 font-mono text-[11px]">
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-neutral-900/50">
                          <td className="p-3 text-neutral-400">{new Date(log.createdAt).toLocaleString()}</td>
                          <td className="p-3 text-white font-bold">{log.actor?.name || log.actorId}</td>
                          <td className="p-3 text-brand-primary font-bold">{log.action}</td>
                          <td className="p-3 text-neutral-300">{log.entityType} ({log.entityId.slice(0, 8)})</td>
                          <td className="p-3 text-neutral-400 truncate max-w-xs">{log.metadata || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Suspend User Modal */}
      {selectedUserForSuspend && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-950 border border-neutral-800 p-6 max-w-md w-full space-y-4 rounded-none">
            <h3 className="text-sm font-bold text-red-400">Suspend User Account</h3>
            <p className="text-xs text-neutral-400">
              Provide a reason for suspending <strong className="text-white">{selectedUserForSuspend.name}</strong>.
            </p>
            <textarea
              required
              rows={3}
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              placeholder="Enter suspension reason..."
              className="w-full p-2.5 text-xs bg-neutral-900 border border-neutral-800 text-white rounded-none focus:outline-none focus:border-white"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSelectedUserForSuspend(null)}
                className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSuspend}
                className="px-4 py-1.5 text-xs bg-red-600 text-white font-bold hover:bg-red-700 cursor-pointer"
              >
                Confirm Suspension
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Dispute Modal */}
      {selectedDispute && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-neutral-950 border border-neutral-800 p-6 max-w-md w-full space-y-4 rounded-none">
            <h3 className="text-sm font-bold text-white">Resolve Contract Dispute</h3>
            <p className="text-xs text-neutral-400">
              Enter official administrative resolution for <strong className="text-white">{selectedDispute.contract?.title}</strong>.
            </p>
            <textarea
              required
              rows={4}
              value={resolutionText}
              onChange={(e) => setResolutionText(e.target.value)}
              placeholder="Enter official resolution details..."
              className="w-full p-2.5 text-xs bg-neutral-900 border border-neutral-800 text-white rounded-none focus:outline-none focus:border-white"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSelectedDispute(null)}
                className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleResolveDispute}
                className="px-4 py-1.5 text-xs bg-white text-black font-bold hover:bg-neutral-200 cursor-pointer"
              >
                Submit Resolution
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
