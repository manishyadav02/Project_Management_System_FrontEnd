import { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  MessageSquare,
  CheckCircle,
  X,
  Loader2,
  Inbox,
  Calendar,
  FileText,
  User,
  ArrowDownUp,
  Search,
  Sparkles,
} from "lucide-react";
import {
  addFeedback,
  getAssignedStudents,
  markProjectAsComplete,
} from "../../store/slices/teacherSlice";

const AssignedStudents = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("lastActivity");
  const [showFeedbackModel, setShowFeedbackModel] = useState(false);
  const [showCompleteModel, setShowCompleteModel] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [feedbackData, setFeedbackData] = useState({
    title: "",
    message: "",
    type: "general",
  });

  const dispatch = useDispatch();
  const { authUser } = useSelector((state) => state.auth);
  const { assignedStudents, loading, error } = useSelector(
    (state) => state.teacher,
  );

  useEffect(() => {
    dispatch(getAssignedStudents(authUser.id));
  }, [dispatch, authUser.id]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return "bg-emerald-50 text-emerald-600 border-emerald-200 shadow-emerald-100";
      case "approved":
        return "bg-violet-50 text-violet-600 border-violet-200 shadow-violet-100";
      default:
        return "bg-amber-50 text-amber-600 border-amber-200 shadow-amber-100";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "approved":
        return "Active & Approved";
      default:
        return "Pending Setup";
    }
  };

  const handleFeedback = (student) => {
    setSelectedStudent(student);
    setFeedbackData({ title: "", message: "", type: "general" });
    setShowFeedbackModel(true);
  };

  const handleMarkComplete = (student) => {
    setSelectedStudent(student);
    setShowCompleteModel(true);
  };

  const closeModel = () => {
    setShowFeedbackModel(false);
    setShowCompleteModel(false);
    setSelectedStudent(null);
    setFeedbackData({ title: "", message: "", type: "general" });
  };

  const submitFeedback = async () => {
    if (
      selectedStudent?.project?._id &&
      feedbackData.title &&
      feedbackData.message
    ) {
      setIsSubmitting(true);
      try {
        await dispatch(
          addFeedback({
            projectId: selectedStudent.project._id,
            payload: feedbackData,
          }),
        ).unwrap();
        dispatch(getAssignedStudents(authUser.id));
        closeModel();
      } catch (err) {
        console.error("Failed to submit feedback", err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const confirmMarkComplete = async () => {
    if (selectedStudent?.project?._id) {
      setIsSubmitting(true);
      try {
        await dispatch(
          markProjectAsComplete(selectedStudent.project._id),
        ).unwrap();
        dispatch(getAssignedStudents(authUser.id));
        closeModel();
      } catch (err) {
        console.error("Failed to complete project", err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Smart Filtering & Sorting
  const processedStudents = useMemo(() => {
    let filtered = [...(assignedStudents || [])].filter(
      (student) =>
        (student?.name || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (student?.project?.title || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()),
    );

    return filtered.sort((a, b) => {
      if (sortBy === "name") {
        return (a?.name || "").localeCompare(b?.name || "");
      } else if (sortBy === "lastActivity") {
        const dateA = a?.project?.updatedAt || a?.project?.createdAt || 0;
        const dateB = b?.project?.updatedAt || b?.project?.createdAt || 0;
        return new Date(dateB) - new Date(dateA);
      }
      return 0;
    });
  }, [assignedStudents, searchTerm, sortBy]);

  const stats = [
    {
      label: "Total Students",
      value: (assignedStudents || []).length,
      bg: "bg-violet-50 border-violet-100",
      text: "text-violet-700",
      sub: "text-violet-500",
    },
    {
      label: "Projects Completed",
      value: (assignedStudents || []).filter(
        (s) => s.project?.status === "completed",
      ).length,
      bg: "bg-emerald-50 border-emerald-100",
      text: "text-emerald-700",
      sub: "text-emerald-500",
    },
    {
      label: "In Progress",
      value: (assignedStudents || []).filter(
        (s) => s.project?.status === "approved",
      ).length,
      bg: "bg-amber-50 border-amber-100",
      text: "text-amber-700",
      sub: "text-amber-500",
    },
    {
      label: "Action Required",
      value: (assignedStudents || []).filter(
        (s) => !s.project || s.project?.status === "pending",
      ).length,
      bg: "bg-rose-50 border-rose-100",
      text: "text-rose-700",
      sub: "text-rose-500",
    },
  ];

  if (loading && !assignedStudents) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] space-y-4">
        <Loader2 className="animate-spin w-12 h-12 text-violet-500" />
        <p className="text-slate-500 font-medium animate-pulse">
          Loading your roster...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-rose-600 font-bold bg-rose-50 rounded-2xl border border-rose-200 m-8 shadow-sm">
        Error Loading Students: {error}
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-12">
      {/* 1. Glassmorphism Page Header */}
      <div className="relative bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-violet-400/10 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
        <div className="bg-gradient-to-r from-slate-50/80 to-white/40 backdrop-blur-xl p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-white text-violet-600 rounded-2xl shadow-md border border-slate-100 group">
              <User className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-violet-500 font-bold tracking-wider uppercase text-xs mb-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Faculty Dashboard
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">
                My Student Roster
              </h1>
              <p className="text-slate-500 font-medium text-sm mt-1 max-w-xl leading-relaxed">
                Track project milestones, provide actionable feedback, and guide
                your students to successful completions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Premium Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`rounded-[2rem] p-6 border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 ${stat.bg}`}
          >
            <p
              className={`text-xs font-bold uppercase tracking-wider mb-2 ${stat.sub}`}
            >
              {stat.label}
            </p>
            <p className={`text-4xl font-black ${stat.text} tracking-tight`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* 3. Smart Control Bar (Search & Sort) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:max-w-md">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search students or projects..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 outline-none transition-all text-sm font-semibold text-slate-700 placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="relative w-full md:w-64 flex items-center">
          <ArrowDownUp className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <select
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 outline-none transition-all text-sm font-bold text-slate-700 appearance-none cursor-pointer"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="lastActivity">Sort by: Last Activity</option>
            <option value="name">Sort by: Student Name</option>
          </select>
        </div>
      </div>

      {/* 4. Student Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {processedStudents.map((student) => (
          <div
            key={student._id}
            className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group"
          >
            <div className="p-6 border-b border-slate-50 flex justify-between items-start bg-gradient-to-br from-slate-50 to-white relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-violet-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600 font-black text-lg shadow-sm group-hover:rotate-6 transition-transform">
                  {student.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800 tracking-tight">
                    {student.name}
                  </h3>
                  <p className="text-xs font-bold text-slate-400">
                    {student.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 flex-1 space-y-5">
              <span
                className={`inline-flex px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg border shadow-sm ${getStatusBadge(student.project?.status)}`}
              >
                {getStatusText(student.project?.status)}
              </span>

              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-violet-500 uppercase tracking-wider mb-2">
                  <FileText className="w-3.5 h-3.5" /> Project Title
                </div>
                <h4
                  className="text-lg font-bold text-slate-800 leading-snug line-clamp-2"
                  title={student.project?.title}
                >
                  {student.project?.title || "No project title submitted yet."}
                </h4>
              </div>

              <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 w-full">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Updated:{" "}
                  {student.project?.updatedAt ?
                    new Date(student.project.updatedAt).toLocaleDateString(
                      "en-GB",
                      { day: "numeric", month: "short", year: "numeric" },
                    )
                  : "Never"}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => handleFeedback(student)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-violet-600 hover:border-violet-200 text-sm font-bold rounded-xl transition-all shadow-sm"
              >
                <MessageSquare className="w-4 h-4" /> Feedback
              </button>

              {student.project?.status !== "completed" ?
                <button
                  onClick={() => handleMarkComplete(student)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-all shadow-sm hover:shadow-md"
                >
                  <CheckCircle className="w-4 h-4" /> Complete
                </button>
              : <div className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 text-slate-400 text-sm font-bold rounded-xl border border-slate-200 cursor-not-allowed">
                  <CheckCircle className="w-4 h-4" /> Done
                </div>
              }
            </div>
          </div>
        ))}

        {processedStudents.length === 0 && (
          <div className="col-span-1 lg:col-span-2 xl:col-span-3 text-center py-24 border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50/50 flex flex-col items-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-4">
              <Inbox className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-lg font-black text-slate-700">
              No students found
            </h3>
            <p className="text-slate-500 text-sm mt-1 font-medium">
              Adjust your search or wait for new assignments.
            </p>
          </div>
        )}
      </div>

      {/* 5. Animated Feedback Modal */}
      {showFeedbackModel && selectedStudent && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity"
          onClick={closeModel}
        >
          <div
            className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-violet-500" /> Send
                Feedback
              </h2>
              <button
                onClick={closeModel}
                className="text-slate-400 hover:bg-slate-200 hover:text-slate-700 p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="bg-violet-50/50 rounded-2xl p-4 border border-violet-100 space-y-2 text-sm shadow-inner">
                <div>
                  <span className="font-bold text-violet-900/60">Project:</span>{" "}
                  <span className="font-bold text-violet-900">
                    {selectedStudent.project?.title}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-violet-900/60">Student:</span>{" "}
                  <span className="font-bold text-violet-900">
                    {selectedStudent.name}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Feedback Title
                </label>
                <input
                  type="text"
                  placeholder="e.g., Thesis Chapter 2 Review"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 outline-none transition-all text-sm font-semibold text-slate-700"
                  value={feedbackData.title}
                  onChange={(e) =>
                    setFeedbackData({ ...feedbackData, title: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Feedback Category
                </label>
                <div className="relative">
                  <select
                    className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 outline-none transition-all text-sm font-bold text-slate-700 appearance-none"
                    value={feedbackData.type}
                    onChange={(e) =>
                      setFeedbackData({ ...feedbackData, type: e.target.value })
                    }
                  >
                    <option value="general">General Direction</option>
                    <option value="positive">Positive / Approved</option>
                    <option value="negative">Revision Required</option>
                  </select>
                  <ArrowDownUp className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Detailed Message
                </label>
                <textarea
                  placeholder="Provide actionable feedback..."
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 outline-none transition-all text-sm font-medium text-slate-700 min-h-[140px] resize-y"
                  value={feedbackData.message}
                  onChange={(e) =>
                    setFeedbackData({
                      ...feedbackData,
                      message: e.target.value,
                    })
                  }
                ></textarea>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={closeModel}
                className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-900 rounded-xl transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={submitFeedback}
                disabled={
                  !feedbackData.title || !feedbackData.message || isSubmitting
                }
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ?
                  <Loader2 className="w-4 h-4 animate-spin" />
                : <MessageSquare className="w-4 h-4" />}
                Send Feedback
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Animated Complete Modal */}
      {showCompleteModel && selectedStudent && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity"
          onClick={closeModel}
        >
          <div
            className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-emerald-500" /> Final
                Approval
              </h2>
              <button
                onClick={closeModel}
                className="text-slate-400 hover:bg-slate-200 hover:text-slate-700 p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100 space-y-2 text-sm shadow-inner">
                <div>
                  <span className="font-bold text-emerald-900/60">
                    Project:
                  </span>{" "}
                  <span className="font-bold text-emerald-900">
                    {selectedStudent.project?.title}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-emerald-900/60">
                    Student:
                  </span>{" "}
                  <span className="font-bold text-emerald-900">
                    {selectedStudent.name}
                  </span>
                </div>
              </div>
              <p className="text-sm font-bold text-slate-600 leading-relaxed text-center px-2">
                Are you ready to sign off on this project? This will permanently
                mark it as{" "}
                <span className="text-emerald-600 bg-emerald-50 px-1 rounded">
                  Completed
                </span>
                .
              </p>
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={closeModel}
                className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 hover:text-slate-900 rounded-xl transition-colors shadow-sm"
              >
                Wait, not yet
              </button>
              <button
                onClick={confirmMarkComplete}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
              >
                {isSubmitting ?
                  <Loader2 className="w-4 h-4 animate-spin" />
                : <CheckCircle className="w-4 h-4" />}
                Confirm Completion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignedStudents;
