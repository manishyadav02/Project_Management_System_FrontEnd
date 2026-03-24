import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllSupervisors,
  fetchProject,
  getSupervisor,
  requestSupervisor,
} from "../../store/slices/studentSlice";
import {
  X,
  Mail,
  GraduationCap,
  BookOpen,
  UserCircle2,
  Calendar,
  Activity,
  Send,
} from "lucide-react";

const SupervisorPage = () => {
  const dispatch = useDispatch();
  const { authUser } = useSelector((state) => state.auth);
  const { project, supervisors, supervisor } = useSelector(
    (state) => state.student,
  );

  const [showRequestModel, setShowRequestModel] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);

  useEffect(() => {
    dispatch(fetchAllSupervisors());
    dispatch(fetchProject());
    dispatch(getSupervisor());
  }, [dispatch]);

  const hasSupervisor = useMemo(
    () => !!(supervisor && supervisor._id),
    [supervisor],
  );
  const hasProject = useMemo(() => !!(project && project._id), [project]);

  const formatDeadline = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "-";

    const day = date.getDate();
    const j = day % 10;
    const k = day % 100;
    const suffix =
      j === 1 && k !== 11 ? "st"
      : j === 2 && k !== 12 ? "nd"
      : j === 3 && k !== 13 ? "rd"
      : "th";
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();
    return `${month} ${day}${suffix}, ${year}`;
  };

  const handleOpenRequest = (supervisor) => {
    setSelectedSupervisor(supervisor);
    setShowRequestModel(true);
  };

  const submitRequest = async () => {
    if (!selectedSupervisor) return;
    const message =
      requestMessage?.trim() ||
      `${authUser?.name || "A student"} has requested you to be their supervisor.`;

    try {
      await dispatch(
        requestSupervisor({ teacherId: selectedSupervisor._id, message }),
      ).unwrap();

      setShowRequestModel(false);
      setSelectedSupervisor(null);
      setRequestMessage("");
    } catch (error) {
      console.error("Submission failed:", error);
    }
  };

  // Helper to safely render expertise tags
  const renderExpertiseTags = (expertise) => {
    if (!expertise)
      return <span className="text-slate-400 text-sm">Not specified</span>;
    const tags =
      Array.isArray(expertise) ? expertise : (
        expertise.split(",").map((e) => e.trim())
      );

    return (
      <div className="flex flex-wrap gap-2 mt-1">
        {tags.map((tag, i) => (
          <span
            key={i}
            className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-md text-xs font-semibold border border-indigo-100/50"
          >
            {tag}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      {/* 1. Page Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-white p-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white shadow-sm border border-slate-100 text-indigo-600 rounded-xl">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-800">
                Supervision
              </h1>
              <p className="text-slate-500 mt-1 font-medium">
                Manage your project supervisor and requests.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: Current Status & Project */}
        <div className="lg:col-span-1 space-y-8">
          {/* Current Supervisor Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <UserCircle2 className="w-5 h-5 text-indigo-500" />
                Your Supervisor
              </h2>
              {hasSupervisor && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Assigned
                </span>
              )}
            </div>

            <div className="p-6 flex-1">
              {hasSupervisor ?
                <div className="flex flex-col items-center text-center">
                  {/* Big Avatar */}
                  <div className="w-24 h-24 rounded-full border-4 border-white shadow-md mb-4 flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-100 to-blue-50">
                    <img
                      src="/placeholder.jpg"
                      alt="Supervisor Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <h3 className="text-xl font-bold text-slate-800">
                    {supervisor?.name || "-"}
                  </h3>
                  <p className="text-sm font-medium text-slate-500 mb-6">
                    {supervisor?.department || "Faculty Department"}
                  </p>

                  <div className="w-full space-y-4 text-left bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Email
                      </label>
                      <a
                        href={`mailto:${supervisor?.email}`}
                        className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-2 transition-colors"
                      >
                        <Mail className="w-4 h-4" />
                        {supervisor?.email || "-"}
                      </a>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Expertise
                      </label>
                      {renderExpertiseTags(supervisor?.expertise)}
                    </div>
                  </div>
                </div>
              : <div className="flex flex-col items-center justify-center text-center py-8">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                    <UserCircle2 className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-500 font-medium">
                    No supervisor assigned.
                  </p>
                  <p className="text-slate-400 text-sm mt-1">
                    Select one from the available list.
                  </p>
                </div>
              }
            </div>
          </div>

          {/* Project Summary Card (Mini version for sidebar) */}
          {hasProject && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-500" />
                <h2 className="text-lg font-bold text-slate-800">
                  Project Linked
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Title
                  </label>
                  <p className="text-sm font-bold text-slate-800 leading-snug">
                    {project?.title || "-"}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      <Activity className="w-3.5 h-3.5" /> Status
                    </label>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-md font-bold capitalize text-xs ${
                        project.status === "approved" ?
                          "text-emerald-700 bg-emerald-50 border border-emerald-100"
                        : project.status === "pending" ?
                          "text-amber-700 bg-amber-50 border border-amber-100"
                        : project.status === "rejected" ?
                          "text-rose-700 bg-rose-50 border border-rose-100"
                        : "text-slate-700 bg-slate-50 border border-slate-100"
                      }`}
                    >
                      {project?.status || "Unknown"}
                    </span>
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      <Calendar className="w-3.5 h-3.5" /> Deadline
                    </label>
                    <p className="text-sm font-bold text-slate-700">
                      {formatDeadline(project?.deadline)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Available Supervisors Grid */}
        <div className="lg:col-span-2">
          {!hasProject ?
            /* Empty State: Needs Project */
            <div className="bg-white rounded-2xl shadow-sm border-2 border-dashed border-slate-200 p-12 flex flex-col items-center justify-center text-center h-full">
              <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                <BookOpen className="w-10 h-10 text-indigo-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                Step 1: Submit your Project
              </h2>
              <p className="text-slate-500 max-w-md">
                You need an active project proposal before you can request a
                supervisor. Head over to the project tab to get started.
              </p>
            </div>
          : !hasSupervisor ?
            /* Grid of Supervisors */
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    Available Faculty
                  </h2>
                  <p className="text-sm text-slate-500 font-medium mt-0.5">
                    Find a supervisor whose expertise matches your project.
                  </p>
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5 bg-slate-50/30">
                {supervisors &&
                  supervisors.map((sup) => (
                    <div
                      key={sup._id}
                      className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md hover:border-indigo-200 transition-all duration-300 flex flex-col h-full group"
                    >
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-50 to-slate-100 border border-slate-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                          <span className="text-xl font-extrabold text-indigo-600">
                            {sup.name ? sup.name.charAt(0).toUpperCase() : "T"}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-base font-bold text-slate-900 truncate">
                            {sup.name || "Unknown Supervisor"}
                          </h4>
                          <p className="text-xs font-medium text-slate-500 truncate mt-0.5">
                            {sup.department || "General Department"}
                          </p>
                        </div>
                      </div>

                      <div className="flex-1 space-y-4 mb-5">
                        <div>
                          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                            Expertise
                          </label>
                          {renderExpertiseTags(sup.expertise)}
                        </div>
                      </div>

                      <button
                        onClick={() => handleOpenRequest(sup)}
                        className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-indigo-600 text-slate-700 hover:text-white border border-slate-200 hover:border-indigo-600 font-bold py-2.5 px-4 rounded-lg transition-all duration-200 text-sm"
                      >
                        <Send className="w-4 h-4" />
                        Send Request
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          : /* Empty State: Already Assigned */
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 flex flex-col items-center justify-center text-center h-full">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                <GraduationCap className="w-10 h-10 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                You're all set!
              </h2>
              <p className="text-slate-500 max-w-md">
                You have successfully secured a supervisor for your project.
                Reach out to them via email to schedule your first meeting.
              </p>
            </div>
          }
        </div>
      </div>

      {/* Modal - Kept functionally the same, but styled up */}
      {showRequestModel && selectedSupervisor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Send className="w-5 h-5 text-indigo-500" />
                Request Supervision
              </h3>
              <button
                className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-full transition-colors"
                onClick={() => {
                  setShowRequestModel(false);
                  setSelectedSupervisor(null);
                  setRequestMessage("");
                }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 bg-slate-50/50">
              <div className="p-4 bg-white border border-slate-200 shadow-sm rounded-xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-lg border border-indigo-100">
                  {selectedSupervisor?.name?.charAt(0) || "T"}
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-0.5">
                    Requesting
                  </p>
                  <p className="text-base font-bold text-slate-800">
                    {selectedSupervisor?.name}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Message to Supervisor <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none min-h-[140px] text-sm resize-none transition-all shadow-sm"
                  required
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  placeholder="Introduce yourself and explain why your project aligns with their expertise..."
                ></textarea>
              </div>
            </div>

            <div className="px-6 py-4 bg-white border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowRequestModel(false);
                  setSelectedSupervisor(null);
                  setRequestMessage("");
                }}
                className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitRequest}
                disabled={!requestMessage.trim()}
                className="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md flex items-center gap-2"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupervisorPage;
