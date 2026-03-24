import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  AlertTriangle,
  CheckCircle2,
  FileDown,
  Folder,
  X,
  Search,
  Download,
  Filter,
  Check,
  XCircle,
  Eye,
  Layers
} from "lucide-react";
import {
  approveProject,
  rejectProject,
  getProject,
} from "../../store/slices/adminSlice";
import { downloadProjectFile } from "../../store/slices/projectSlice";

const ProjectsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSupervisor, setFilterSupervisor] = useState("all");
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [reportSearch, setReportSearch] = useState("");
  const [showViewModel, setShowViewModel] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);

  const dispatch = useDispatch();
  const { projects } = useSelector((state) => state.admin);

  const supervisors = useMemo(() => {
    const set = new Set(
      (projects || []).map((p) => p.supervisor?.name || null).filter(Boolean),
    );
    return Array.from(set);
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return (projects || []).filter((p) => {
      const matchesSearch =
        (p.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.student?.name || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "all" || p.status === filterStatus;
      const matchesSupervisor =
        filterSupervisor === "all" || p.supervisor?.name === filterSupervisor;
      return matchesSearch && matchesStatus && matchesSupervisor;
    });
  }, [projects, searchTerm, filterStatus, filterSupervisor]);

  const files = useMemo(() => {
    return (projects || []).flatMap((p) =>
      (p.files || []).map((f) => ({
        projectId: p._id,
        fileId: f._id,
        fileName: f.fileName,
        uploadedAt: f.uploadedAt || f.createdAt,
        projectTitle: p.title,
        studentName: p.student?.name,
      })),
    );
  }, [projects]);

  const filterFiles = useMemo(() => {
    return files.filter((f) => {
      const matchesSearch =
        (f.fileName || "").toLowerCase().includes(reportSearch.toLowerCase()) ||
        (f.projectTitle || "")
          .toLowerCase()
          .includes(reportSearch.toLowerCase()) ||
        (f.studentName || "")
          .toLowerCase()
          .includes(reportSearch.toLowerCase());
      return matchesSearch;
    });
  }, [files, reportSearch]);

  const handleDownload = async (projectId, fileId, file) => {
    if (!projectId || !fileId) {
      toast.error("Error: Missing Project ID or File ID.");
      return;
    }
    try {
      const res = await dispatch(
        downloadProjectFile({ projectId, fileId }),
      ).unwrap();
      const blobData = res.blob || res.payload?.blob || res;
      if (!blobData) throw new Error("No file data received from server");

      const url = window.URL.createObjectURL(new Blob([blobData]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", file.fileName || "document");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("File downloaded successfully!");
    } catch (error) {
      toast.error(error?.message || "Failed to download file.");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "approved":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "pending":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "rejected":
        return "bg-rose-100 text-rose-700 border-rose-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const handleStatusChange = async (projectId, newStatus) => {
    if (newStatus === "approved") {
      dispatch(approveProject(projectId));
    } else if (newStatus === "rejected") {
      dispatch(rejectProject(projectId));
    }
  };

  const projectStats = [
    { title: "Total Projects", value: projects.length, bg: "bg-blue-50", iconBg: "bg-blue-100", iconColor: "text-blue-600", Icon: Folder },
    { title: "Pending Review", value: projects.filter((p) => p.status === "pending").length, bg: "bg-amber-50", iconBg: "bg-amber-100", iconColor: "text-amber-600", Icon: AlertTriangle },
    { title: "Completed", value: projects.filter((p) => p.status === "completed").length, bg: "bg-emerald-50", iconBg: "bg-emerald-100", iconColor: "text-emerald-600", Icon: CheckCircle2 },
    { title: "Rejected", value: projects.filter((p) => p.status === "rejected").length, bg: "bg-rose-50", iconBg: "bg-rose-100", iconColor: "text-rose-600", Icon: XCircle },
  ];

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-12">
      
      {/* 1. Premium Dark Header */}
      <div className="bg-slate-900 rounded-3xl shadow-xl overflow-hidden relative border border-slate-800 p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="relative z-10 flex items-center gap-5">
          <div className="p-4 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl">
            <Layers className="w-8 h-8 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Project Master List
            </h1>
            <p className="text-indigo-200/80 font-medium mt-1.5 max-w-xl">
              View, filter, and manage all student projects across the platform.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsReportsOpen(true)}
          className="relative z-10 flex items-center gap-2 px-6 py-3.5 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/30 transition-all active:scale-95"
        >
          <FileDown className="w-5 h-5" />
          Download Reports
        </button>
      </div>

      {/* 2. Floating Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {projectStats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{stat.title}</p>
              <div className={`p-2.5 rounded-xl transition-transform group-hover:scale-110 ${stat.iconBg}`}>
                <stat.Icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
            </div>
            <h3 className="text-3xl font-black text-slate-800">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* 3. Sleek Filters Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-5">
        <div className="flex-1 relative">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5" /> Search
          </label>
          <input
            type="text"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm font-semibold text-slate-700 placeholder:text-slate-400"
            placeholder="Search by project or student name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-64">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5" /> Status
          </label>
          <select
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm font-semibold text-slate-700 appearance-none cursor-pointer"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div className="w-full md:w-64">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5" /> Supervisor
          </label>
          <select
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm font-semibold text-slate-700 appearance-none cursor-pointer"
            value={filterSupervisor}
            onChange={(e) => setFilterSupervisor(e.target.value)}
          >
            <option value="all">All Supervisors</option>
            {supervisors.map((supervisor) => (
              <option key={supervisor} value={supervisor}>{supervisor}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. Beautiful Data Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-800">Project Directory</h2>
        </div>
        <div className="overflow-x-auto">
          {filteredProjects && filteredProjects.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Project Info</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Supervisor</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProjects.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="font-bold text-slate-900 text-sm mb-0.5">{p.title}</div>
                      <div className="text-xs text-slate-500 truncate max-w-[250px] font-medium">{p.description}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-bold text-slate-800 text-sm">{p.student?.name || "N/A"}</div>
                      <div className="text-xs text-slate-500 font-medium">{p.student?.email}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-semibold text-sm text-slate-700">
                        {p.supervisor?.name || <span className="text-rose-500 bg-rose-50 px-2 py-1 rounded-md text-xs font-bold">Unassigned</span>}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusBadge(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => { setCurrentProject(p); setShowViewModel(true); }}
                          className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-lg transition-colors tooltip-trigger"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {p.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleStatusChange(p._id, "approved")}
                              className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-600 hover:text-white rounded-lg transition-colors"
                              title="Approve Project"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(p._id, "rejected")}
                              className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white rounded-lg transition-colors"
                              title="Reject Project"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-16 flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                <Search className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-500 font-bold text-lg">No projects found</p>
              <p className="text-slate-400 text-sm mt-1 font-medium">Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* 5. Sleek View Details Modal */}
      {showViewModel && currentProject && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl">
                  <Folder className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black text-slate-800">Project Overview</h3>
              </div>
              <button onClick={() => setShowViewModel(false)} className="text-slate-400 hover:bg-slate-200 hover:text-slate-700 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto space-y-6">
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Project Title</label>
                <p className="text-lg font-bold text-slate-800">{currentProject.title}</p>
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Description</label>
                <p className="text-sm font-medium text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {currentProject.description || "No description provided."}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-6 bg-slate-50/50 p-5 rounded-xl border border-slate-100">
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Student</label>
                  <p className="text-sm font-bold text-slate-800">{currentProject.student?.name || "-"}</p>
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Supervisor</label>
                  <p className="text-sm font-bold text-slate-800">{currentProject.supervisor?.name || <span className="text-rose-500">Not Assigned</span>}</p>
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Current Status</label>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusBadge(currentProject.status)}`}>
                    {currentProject.status}
                  </span>
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Deadline</label>
                  <p className="text-sm font-bold text-slate-800">
                    {currentProject.deadline ? new Date(currentProject.deadline).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : "-"}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <FileDown className="w-3.5 h-3.5" /> Attached Files
                </label>
                {(currentProject.files || []).length === 0 ? (
                  <div className="text-slate-400 text-sm font-medium italic px-2">No files uploaded yet.</div>
                ) : (
                  <div className="space-y-2">
                    {(currentProject.files || []).map((file) => (
                      <div key={file._id} className="flex items-center justify-between bg-white border border-slate-200 p-3 rounded-xl shadow-sm hover:border-indigo-300 transition-colors">
                        <span className="text-sm font-bold text-slate-700 truncate mr-3 flex-1">{file.fileName}</span>
                        <button
                          onClick={() => handleDownload(currentProject._id, file._id, file)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 hover:bg-indigo-50 text-indigo-600 font-bold text-xs rounded-lg border border-slate-200 hover:border-indigo-200 transition-colors shrink-0"
                        >
                          <Download className="w-3.5 h-3.5" /> Download
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button onClick={() => setShowViewModel(false)} className="px-6 py-2.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-xl shadow-sm transition-all active:scale-95">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Reports Modal (Matches Dashboard styling) */}
      {isReportsOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                  <FileDown className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-800">Project Reports Master List</h3>
                  <p className="text-sm font-medium text-slate-500 mt-0.5">Search and download submitted documents</p>
                </div>
              </div>
              <button onClick={() => setIsReportsOpen(false)} className="text-slate-400 hover:bg-slate-200 hover:text-slate-700 p-2.5 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 pb-4">
              <div className="relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm font-semibold text-slate-700 placeholder:text-slate-400"
                  placeholder="Search files by file name, student name, or project title..."
                  value={reportSearch}
                  onChange={(e) => setReportSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="p-8 pt-2 overflow-y-auto flex-1">
              {filterFiles.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                  <FileDown className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-bold text-lg">No files found matching your search.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filterFiles.map((file, index) => (
                    <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white border border-slate-200 rounded-2xl hover:shadow-md hover:border-indigo-300 transition-all">
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-800 text-base truncate mb-1">{file.fileName}</p>
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                          <span className="text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100">{file.studentName || "N/A"}</span>
                          <span>•</span>
                          <span className="truncate">{file.projectTitle}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDownload(file.projectId, file.fileId, file)}
                        className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shrink-0"
                      >
                        <Download className="w-4 h-4" /> Download
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;