import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { useDispatch, useSelector } from "react-redux";
import AddStudent from "../../components/modal/AddStudent";
import AddTeacher from "../../components/modal/AddTeacher";
import { toast } from "react-toastify";
import {
  getDashboardStats,
  getAllProjects,
} from "../../store/slices/adminSlice.js";
import { downloadProjectFile } from "../../store/slices/projectSlice.js";
import { getNotifications } from "../../store/slices/notificationSlice.js";
import {
  toggleStudentModal,
  toggleTeacherModal,
} from "../../store/slices/popupSlice.js";
import {
  User,
  Box,
  AlertCircle,
  Folder,
  AlertTriangle,
  Plus as PlusIcon,
  FileText as FileTextIcon,
  CheckCircle,
  Users,
  ShieldCheck,
  TrendingUp,
  X,
  Search,
  Download,
  Activity,
  BarChart3,
  ChevronRight,
  Clock,
  Award,
  CheckCircle2,
  XCircle,
  CalendarDays,
} from "lucide-react";

// ✨ Smart Detailed Time Formatter (e.g., "Mar 10 • 2:30 PM")
const formatDetailedTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date
    .toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
    .replace(",", " •"); // Formats like: "Mar 10 • 2:30 PM"
};

const AdminDashboard = () => {
  const { isCreateStudentModalOpen, isCreateTeacherModalOpen } = useSelector(
    (state) => state.popup,
  );
  const dispatch = useDispatch();
  const { stats, projects } = useSelector((state) => state.admin);

  // Bulletproof notification selector
  const notifications = useSelector((state) => {
    const notifState = state.notification || state.notifications || {};
    return notifState.notifications || notifState.data || notifState.list || [];
  });

  const [isReportsModelOpen, setIsReportsModelOpen] = useState(false);
  const [reportSearch, setReportSearch] = useState("");

  useEffect(() => {
    dispatch(getDashboardStats());
    dispatch(getNotifications());
    dispatch(getAllProjects());
  }, [dispatch]);

  const nearingDeadlines = useMemo(() => {
    const now = new Date();
    const threeDays = 3 * 24 * 60 * 60 * 1000;
    return (projects || []).filter((project) => {
      if (!project.deadline) return false;
      const d = new Date(project.deadline);
      return d >= now && d.getTime() - now.getTime() <= threeDays;
    }).length;
  }, [projects]);

  const files = useMemo(() => {
    return (projects || []).flatMap((p) =>
      (p.files || []).map((f) => ({
        projectId: p._id,
        fileId: f._id,
        fileName: f.fileName,
        uploadedAt: f.uploadedAt,
        projectTitle: p.title,
        studentName: p.student?.name,
      })),
    );
  }, [projects]);

  const filteredFiles = files.filter((file) => {
    return (
      (file.fileName || "")
        .toLowerCase()
        .includes(reportSearch.toLowerCase()) ||
      (file.studentName || "")
        .toLowerCase()
        .includes(reportSearch.toLowerCase()) ||
      (file.projectTitle || "")
        .toLowerCase()
        .includes(reportSearch.toLowerCase())
    );
  });

  const handleDownload = async (projectId, fileId,file) => {
       try {
         const res = await dispatch(
           downloadProjectFile({
             projectId,
             fileId,
           }),
         ).unwrap();
   
         const fileUrl = res.fileUrl || file.fileUrl;
         window.open(fileUrl, "_blank");
       } catch (error) {
         console.error("Enter downloading file", error);
         toast.error("Failed to download file.Please try again...");
       }
     };

  const supervisorBucket = useMemo(() => {
    const map = new Map();
    (projects || []).forEach((project) => {
      if (!project?.supervisor?.name) return;
      const name = project?.supervisor?.name;
      map.set(name, (map.get(name) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [projects]);

  // ✨ The Bouncer Filter: Hides personal mail & noise, keeps only high-level signals!
  const latestNotifications = useMemo(() => {
    return (notifications || [])
      .filter((n) => {
        const msg = (n.message || "").toLowerCase();
        const type = (n.type || "").toLowerCase();

        // 🛑 Hide Personal Inbox Messages
        if (
          msg.startsWith("you ") ||
          msg.startsWith("your ") ||
          msg.includes("you have been")
        ) {
          return false;
        }

        // 🛑 Hide Noisy Requests & Micro-Updates
        if (
          msg.includes("requested") ||
          type === "feedback" ||
          type === "general"
        ) {
          return false;
        }

        return true;
      })
      .slice(0, 7); // Show latest 7
  }, [notifications]);

  // ✨ Smart Iconography: Maps the action to a beautiful UI icon
  const getActivityStyling = (type, message) => {
    const msg = (message || "").toLowerCase();
    const t = (type || "").toLowerCase();

    if (msg.includes("completed") || msg.includes("100%"))
      return {
        Icon: Award,
        color: "bg-purple-100 text-purple-600 ring-purple-50",
      };
    if (
      t === "approval" ||
      msg.includes("accepted") ||
      msg.includes("supervised")
    )
      return {
        Icon: CheckCircle2,
        color: "bg-emerald-100 text-emerald-600 ring-emerald-50",
      };
    if (
      t === "rejection" ||
      msg.includes("declined") ||
      msg.includes("rejected")
    )
      return { Icon: XCircle, color: "bg-rose-100 text-rose-600 ring-rose-50" };
    if (t === "deadline" || msg.includes("alert"))
      return {
        Icon: AlertTriangle,
        color: "bg-orange-100 text-orange-600 ring-orange-50",
      };

    return { Icon: Activity, color: "bg-blue-100 text-blue-600 ring-blue-50" };
  };

  const dashboardStats = [
    {
      title: "Total Students",
      value: stats?.totalStudents ?? 0,
      bg: "bg-blue-50 text-blue-600",
      Icon: User,
    },
    {
      title: "Total Teachers",
      value: stats?.totalTeachers ?? 0,
      bg: "bg-emerald-50 text-emerald-600",
      Icon: Box,
    },
    {
      title: "Pending Requests",
      value: stats?.pendingRequests ?? 0,
      bg: "bg-orange-50 text-orange-600",
      Icon: AlertCircle,
    },
    {
      title: "Active Projects",
      value: stats?.totalProjects ?? 0,
      bg: "bg-indigo-50 text-indigo-600",
      Icon: Folder,
    },
    {
      title: "Nearing Deadlines",
      value: nearingDeadlines,
      bg: "bg-rose-50 text-rose-600",
      Icon: AlertTriangle,
    },
  ];

  const actionButtons = [
    {
      title: "Add Student",
      desc: "Register a new student account",
      onClick: () => dispatch(toggleStudentModal()),
      color: "bg-blue-600 hover:bg-blue-700",
      iconBg: "bg-blue-500",
      Icon: PlusIcon,
    },
    {
      title: "Add Teacher",
      desc: "Register a new faculty member",
      onClick: () => dispatch(toggleTeacherModal()),
      color: "bg-emerald-600 hover:bg-emerald-700",
      iconBg: "bg-emerald-500",
      Icon: PlusIcon,
    },
    {
      title: "View Reports",
      desc: "Search and download documents",
      onClick: () => setIsReportsModelOpen(true),
      color: "bg-slate-800 hover:bg-slate-900",
      iconBg: "bg-slate-700",
      Icon: FileTextIcon,
    },
  ];

  const dashboardCards = [
    {
      title: "Assigned Students",
      value: (projects || []).filter((r) => !!r.supervisor).length,
      Icon: CheckCircle,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Unassigned Students",
      value: (projects || []).filter((r) => !r.supervisor).length,
      Icon: AlertTriangle,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
    {
      title: "Available Teachers",
      value: stats?.availableTeachers ?? 0,
      Icon: Users,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
  ];

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-12">
      {/* 1. Executive Dark Header */}
      <div className="bg-slate-900 rounded-3xl shadow-xl overflow-hidden relative border border-slate-800">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl">
              <ShieldCheck className="w-10 h-10 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                Admin Command Center
              </h1>
              <p className="text-indigo-200/80 font-medium text-base mt-1.5 max-w-xl">
                System overview, faculty assignments, and complete project
                oversight.
              </p>
            </div>
          </div>

          <div className="mt-6 md:mt-0 relative z-10 flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100 shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-sm font-semibold text-slate-600 tracking-wide">
              System Online
            </span>
          </div>
        </div>
      </div>

      {/* 2. Top Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {dashboardStats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex justify-between items-start mb-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 pr-4">
                {stat.title}
              </p>
              <div
                className={`p-2.5 rounded-xl shrink-0 transition-transform group-hover:scale-110 ${stat.bg}`}
              >
                <stat.Icon className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-3xl font-black text-slate-800 tracking-tight">
              {stat.value}
            </h3>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
              <TrendingUp className="w-3.5 h-3.5" /> Live Metric
            </div>
          </div>
        ))}
      </div>

      {/* 3. Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {dashboardCards.map((card, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-5 hover:border-indigo-200 transition-colors"
          >
            <div className={`p-4 rounded-2xl ${card.bg} ${card.color}`}>
              <card.Icon className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">
                {card.title}
              </h4>
              <p className="text-2xl font-black text-slate-800">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 4. Main Content Split */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column: Chart */}
        <div className="xl:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-indigo-500" />
            <h3 className="text-lg font-bold text-slate-800">
              Distribution by Supervisor
            </h3>
          </div>
          <div className="p-8 flex-1">
            {supervisorBucket.length === 0 ?
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50">
                <BarChart3 className="w-10 h-10 text-slate-300 mb-2" />
                <p className="text-slate-500 font-medium">
                  No distribution data available
                </p>
              </div>
            : <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={supervisorBucket}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f1f5f9"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12, fill: "#64748b", fontWeight: 500 }}
                      axisLine={false}
                      tickLine={false}
                      dy={10}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#64748b", fontWeight: 500 }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      cursor={{ fill: "#f8fafc" }}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                      formatter={(value) => [
                        <span className="font-bold text-indigo-600">
                          {value}
                        </span>,
                        "Projects Assigned",
                      ]}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
                      {supervisorBucket.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={index % 2 === 0 ? "#6366f1" : "#818cf8"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            }
          </div>
        </div>

        {/* Right Column: Premium Audit Log ✨ */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="px-6 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-indigo-500" />
              <h3 className="text-lg font-bold text-slate-800">Audit Log</h3>
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
              Live
            </span>
          </div>

          <div className="p-6 flex-1 overflow-y-auto max-h-[400px]">
            {latestNotifications.length === 0 ?
              <div className="text-center py-12 text-slate-400 font-medium flex flex-col items-center">
                <Clock className="w-8 h-8 mb-2 opacity-30" />
                No system milestones recorded yet.
              </div>
            : <div className="relative ml-4 space-y-6">
                {latestNotifications.map((n) => {
                  const styleInfo = getActivityStyling(n.type, n.message);
                  const StylizedIcon = styleInfo.Icon;

                  return (
                    <div key={n._id} className="relative pl-8 group">
                      {/* Timeline Line */}
                      <span className="absolute left-[-15px] top-8 bottom-[-32px] w-[2px] bg-slate-100 group-last:hidden z-0"></span>

                      {/* ✨ Icon Timeline Marker */}
                      <div
                        className={`absolute -left-[27px] top-1 w-7 h-7 rounded-full ring-4 ring-white flex items-center justify-center shadow-sm z-10 ${styleInfo.color}`}
                      >
                        <StylizedIcon className="w-3.5 h-3.5" />
                      </div>

                      {/* Clean Message UI */}
                      <div className="flex flex-col gap-1.5 bg-white border border-transparent rounded-xl transition-all group-hover:bg-slate-50 -mt-1 p-2">
                        <p className="font-semibold text-slate-700 text-sm leading-snug">
                          {n.message}
                        </p>

                        {/* ✨ Precise Timestamp (Replaced the bulky badges) */}
                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mt-1">
                          <CalendarDays className="w-3.5 h-3.5 opacity-70" />
                          <span>{formatDetailedTime(n.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            }
          </div>
        </div>
      </div>

      {/* 5. Rich Quick Actions */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-4 px-2">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {actionButtons.map((btn, idx) => (
            <button
              key={idx}
              onClick={btn.onClick}
              className={`group relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${btn.color}`}
            >
              <div className="relative z-10 flex items-start justify-between">
                <div>
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-white ${btn.iconBg}`}
                  >
                    <btn.Icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-1">
                    {btn.title}
                  </h4>
                  <p className="text-white/80 text-sm font-medium">
                    {btn.desc}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-700"></div>
            </button>
          ))}
        </div>
      </div>

      {/* Modals */}
      {isReportsModelOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl shadow-sm border border-indigo-50">
                  <FileTextIcon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight">
                    Project Reports Master List
                  </h3>
                  <p className="text-sm font-medium text-slate-500 mt-0.5">
                    Search and download submitted documents
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsReportsModelOpen(false)}
                className="text-slate-400 hover:text-slate-700 hover:bg-slate-200 p-2.5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 pb-4">
              <div className="relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm font-semibold text-slate-700 placeholder:text-slate-400 shadow-sm"
                  placeholder="Search by file name, project title, or student name..."
                  value={reportSearch}
                  onChange={(e) => setReportSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="p-8 pt-2 overflow-y-auto flex-1">
              {filteredFiles.length === 0 ?
                <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                  <FileTextIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-700">
                    No files found
                  </h3>
                  <p className="text-slate-500 text-sm mt-1 font-medium">
                    Try adjusting your search terms.
                  </p>
                </div>
              : <div className="space-y-3">
                  {filteredFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white border border-slate-200 rounded-2xl hover:shadow-md hover:border-indigo-300 transition-all group"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-800 text-base truncate mb-1">
                          {file.fileName}
                        </p>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 truncate uppercase tracking-wider">
                          <span className="text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100">
                            {file.studentName || "Unknown Student"}
                          </span>
                          <span>•</span>
                          <span className="truncate">
                            {file.projectTitle || "Untitled Project"}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          handleDownload(file.projectId, file.fileId, file)
                        }
                        className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-indigo-600 hover:text-white hover:border-indigo-600 shadow-sm transition-all shrink-0"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              }
            </div>
          </div>
        </div>
      )}

      {isCreateStudentModalOpen && <AddStudent />}
      {isCreateTeacherModalOpen && <AddTeacher />}
    </div>
  );
};

export default AdminDashboard;
