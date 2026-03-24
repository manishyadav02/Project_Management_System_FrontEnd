import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createDeadline } from "../../store/slices/deadlineSlice";
import {
  X,
  Search,
  Calendar,
  User,
  Clock,
  AlertCircle,
  CheckCircle2,
  CalendarPlus,
  CalendarClock,
  ArrowRight,
  XCircle,
} from "lucide-react";

const DeadlinesPage = () => {
  const [showModel, setShowModel] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    deadlineDate: "",
    description: "",
  });
  const [selectedProject, setSelectedProject] = useState(null);

  const dispatch = useDispatch();
  const { projects } = useSelector((state) => state.admin);
  const [viewProjects, setViewProjects] = useState([]);

  useEffect(() => {
    setViewProjects(projects || []);
  }, [projects]);

  // Format date safely to DD/MM/YY for display
  const formatToDDMMYY = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date)) return "-";

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2);

    return `${day}/${month}/${year}`;
  };

  // Convert to YYYY-MM-DD for the HTML date input default value
  const formatForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date)) return "";
    return date.toISOString().split("T")[0];
  };

  const projectRows = useMemo(() => {
    return (viewProjects || []).map((p) => ({
      _id: p._id,
      title: p.title,
      studentName: p.student?.name || "Unknown Student",
      supervisor: p.supervisor?.name || "-",
      studentDept: p.student?.department || "Department not set",
      deadlineDisplay: formatToDDMMYY(p.deadline),
      rawDate: p.deadline,
      raw: p,
    }));
  }, [viewProjects]);

  const filteredProjects = projectRows.filter((row) => {
    const matchesSearch =
      (row.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (row.studentName || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // ✨ NEW UX FLOW: Triggered directly from the table row!
  const handleOpenModal = (project) => {
    setSelectedProject(project);
    setFormData({
      deadlineDate: formatForInput(project.deadline), // Pre-fill if it already exists
      description: "",
    });
    setShowModel(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProject || !formData.deadlineDate) return;

    let deadlineData = {
      name: formData.description || `Deadline for ${selectedProject.title}`,
      dueDate: formData.deadlineDate,
      project: selectedProject._id,
    };

    try {
      const updated = await dispatch(
        createDeadline({ id: selectedProject._id, data: deadlineData }),
      ).unwrap();
      const updatedProject = updated?.project || updated;

      if (updatedProject?._id) {
        setViewProjects((prev) =>
          prev.map((p) =>
            p._id === updatedProject._id ? { ...p, ...updatedProject } : p,
          ),
        );
      }
    } finally {
      setShowModel(false);
      setFormData({ deadlineDate: "", description: "" });
      setSelectedProject(null);
    }
  };

  const getDeadlineStatus = (rawDate) => {
    if (!rawDate) {
      return {
        label: "Not Set",
        bg: "bg-slate-100",
        text: "text-slate-600",
        border: "border-slate-200",
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(rawDate);
    deadlineDate.setHours(0, 0, 0, 0);

    const timeDiff = deadlineDate.getTime() - today.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysLeft < 0) {
      return {
        label: "Overdue",
        bg: "bg-rose-100",
        text: "text-rose-700",
        border: "border-rose-200",
      };
    } else if (daysLeft <= 7) {
      return {
        label: "Due Soon",
        bg: "bg-amber-100",
        text: "text-amber-700",
        border: "border-amber-200",
      };
    } else {
      return {
        label: "On Track",
        bg: "bg-emerald-100",
        text: "text-emerald-700",
        border: "border-emerald-200",
      };
    }
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-12">
      {/* 1. Premium Dark Header (Matches Projects Page) */}
      <div className="bg-slate-900 rounded-3xl shadow-xl overflow-hidden relative border border-slate-800 p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute -bottom-20 -right-20 w-[300px] h-[300px] bg-purple-500/20 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="relative z-10 flex items-center gap-5">
          <div className="p-4 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl">
            <CalendarClock className="w-8 h-8 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Deadline Management
            </h1>
            <p className="text-indigo-200/80 font-medium mt-1.5 max-w-xl">
              Set, update, and monitor critical project submission dates.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-5">
        <div className="flex-1 relative">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5" /> Search Ledger
          </label>
          <input
            type="text"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm font-semibold text-slate-700 placeholder:text-slate-400"
            placeholder="Search by project title or student name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* 3. Modern Data Table with Action Buttons */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            Project Timeline Ledger
          </h2>
        </div>

        <div className="overflow-x-auto">
          {filteredProjects && filteredProjects.length > 0 ?
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Project Info
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Student & Dept
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Supervisor
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Deadline
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProjects.map((row) => (
                  <tr
                    key={row._id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-sm font-bold text-slate-800">
                        {row.title}
                      </div>
                    </td>

                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-sm font-bold text-slate-800">
                        {row.studentName}
                      </div>
                      <div className="text-[10px] font-black text-slate-400 mt-0.5 uppercase tracking-wide">
                        {row.studentDept}
                      </div>
                    </td>

                    <td className="px-6 py-5 whitespace-nowrap">
                      {row.supervisor === "-" ?
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-500 text-xs font-bold">
                          <AlertCircle className="w-3.5 h-3.5" /> Unassigned
                        </span>
                      : <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold">
                          <User className="w-3.5 h-3.5" /> {row.supervisor}
                        </span>
                      }
                    </td>

                    <td className="px-6 py-5 whitespace-nowrap">
                      <div
                        className={`flex items-center gap-2 text-sm font-bold ${row.deadlineDisplay === "-" ? "text-slate-400" : "text-slate-800"}`}
                      >
                        <Calendar
                          className={`w-4 h-4 ${row.deadlineDisplay === "-" ? "text-slate-300" : "text-indigo-500"}`}
                        />
                        {row.deadlineDisplay}
                      </div>
                    </td>

                    <td className="px-6 py-5 whitespace-nowrap">
                      {(() => {
                        const status = getDeadlineStatus(row.rawDate);
                        return (
                          <span
                            className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-full border flex items-center gap-1.5 w-max ${status.bg} ${status.text} ${status.border}`}
                          >
                            {status.label}
                          </span>
                        );
                      })()}
                    </td>

                    <td className="px-6 py-5 whitespace-nowrap text-right">
                      {row.raw.status === "completed" ?
                        // ✨ STATE 1: If Completed -> Show a beautiful Emerald Green Success Badge
                        <span
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border cursor-default bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm"
                          title="This project is already completed and finalized"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Completed
                        </span>
                      : row.raw.status === "approved" ?
                        // ✨ STATE 2: If Approved -> Show the interactive Set/Update Deadline Button
                        <button
                          onClick={() => handleOpenModal(row.raw)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 text-slate-600 font-bold text-xs rounded-xl transition-all shadow-sm group-hover:shadow-md"
                        >
                          <CalendarPlus className="w-4 h-4 text-indigo-500" />
                          {row.rawDate ? "Update Date" : "Set Deadline"}
                        </button>
                        // ✨ STATE 3: If Pending or Rejected -> Show the disabled Warning/Error Badge
                      : <span
                          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border cursor-not-allowed shadow-sm ${
                            row.raw.status === "rejected" ?
                              "bg-red-50 text-red-600 border-red-100"
                            : "bg-amber-50 text-amber-600 border-amber-100"
                          }`}
                          title="Project must be approved to set a deadline"
                        >
                          {row.raw.status === "rejected" ?
                            <>
                              <XCircle className="w-4 h-4" />
                              Rejected
                            </>
                          : <>
                              <Clock className="w-4 h-4" />
                              Pending Approval
                            </>
                          }
                        </span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          : <div className="text-center py-16 border-t border-slate-100 flex flex-col items-center bg-slate-50/50">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 border border-slate-200 shadow-sm">
                <Search className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-700">
                No projects found
              </h3>
              <p className="text-slate-500 text-sm mt-1 font-medium">
                Adjust your search to find deadlines.
              </p>
            </div>
          }
        </div>
      </div>

      {/* 4. Beautifully Simplified Modal */}
      {showModel && selectedProject && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <CalendarPlus className="w-5 h-5 text-indigo-500" />
                {selectedProject.deadline ?
                  "Update Deadline"
                : "Set New Deadline"}
              </h3>
              <button
                onClick={() => setShowModel(false)}
                className="text-slate-400 hover:text-slate-700 hover:bg-slate-200 p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* ✨ Context Card (Replaces the ugly Dropdown!) */}
              <div className="bg-indigo-50/50 rounded-2xl p-5 border border-indigo-100 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                      Student
                    </label>
                    <p className="text-sm font-bold text-slate-800">
                      {selectedProject.student?.name || "Unknown"}
                    </p>
                    <p className="text-xs font-semibold text-slate-500 truncate">
                      {selectedProject.title}
                    </p>
                  </div>
                </div>
              </div>

              {/* Date & Note Inputs */}
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Target Date <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="date"
                      required
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm font-bold text-slate-700"
                      value={formData.deadlineDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          deadlineDate: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Description / Note
                  </label>
                  <textarea
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm font-medium text-slate-800 placeholder:text-slate-400 min-h-[100px] resize-y"
                    placeholder="e.g., Final Thesis Submission..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  ></textarea>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModel(false)}
                  className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm hover:shadow-indigo-500/30 active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeadlinesPage;
