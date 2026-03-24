import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  acceptTeacherRequest,
  getTeacherRequests,
  rejectTeacherRequest,
} from "../../store/slices/teacherSlice";
import {
  ChevronDown,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  Inbox,
  FileText,
  Calendar,
  Loader2,
  Clock,
  ShieldAlert,
} from "lucide-react";

const PendingRequests = () => {
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingMap, setLoadingMap] = useState({});
  const dispatch = useDispatch();

  const { list } = useSelector((state) => state.teacher);
  const { authUser } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getTeacherRequests(authUser.id));
  }, [dispatch, authUser.id]);

  const setLoading = (id, key, value) => {
    setLoadingMap((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        [key]: value,
      },
    }));
  };

  const handleAccept = async (request) => {
    const id = request._id;
    setLoading(id, "accepting", true);
    try {
      await dispatch(acceptTeacherRequest(id)).unwrap();
      dispatch(getTeacherRequests(authUser.id)); // Refresh list after action
    } finally {
      setLoading(id, "accepting", false);
    }
  };

  const handleReject = async (request) => {
    const id = request._id;
    setLoading(id, "rejecting", true);
    try {
      await dispatch(rejectTeacherRequest(id)).unwrap();
      dispatch(getTeacherRequests(authUser.id)); // Refresh list after action
    } finally {
      setLoading(id, "rejecting", false);
    }
  };

  const filteredRequests =
    (list || []).filter((request) => {
      const matchesSearch =
        (request?.student?.name || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (request?.latestProject?.title || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "all" || request.status === filterStatus;

      return matchesSearch && matchesStatus;
    }) || [];

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-12">
      {/* 1. Page Header */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-white p-6 md:p-8 flex items-center gap-5">
          <div className="p-4 bg-white text-indigo-600 rounded-2xl shadow-sm border border-slate-100">
            <Inbox className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
              Supervision Requests
            </h1>
            <p className="text-slate-500 font-medium text-sm mt-1">
              Review and respond to incoming project proposals from students.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Filter & Search Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-xl">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name or project title..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm font-semibold text-slate-700 placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="relative w-full md:w-64">
          <Filter className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <select
            className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-sm font-bold text-slate-700 appearance-none cursor-pointer"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Requests</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* 3. Requests Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredRequests.length > 0 ?
          filteredRequests.map((req) => {
            const id = req._id;
            const project = req.latestProject;
            const projectStatus = project?.status?.toLowerCase() || "pending";
            const supervisorAssigned = !!project?.supervisor;
            const isReqPending = req.status === "pending";

            // Loading states
            const isAccepting = loadingMap[id]?.accepting;
            const isRejecting = loadingMap[id]?.rejecting;

            // Status Badge Logic
            let badgeColors = "bg-amber-50 text-amber-600 border-amber-200";
            if (req.status === "approved")
              badgeColors = "bg-emerald-50 text-emerald-600 border-emerald-200";
            if (req.status === "rejected")
              badgeColors = "bg-rose-50 text-rose-600 border-rose-200";

            return (
              <div
                key={id}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col group"
              >
                {/* Card Header: Student Info */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/30">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-blue-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-black text-lg shadow-sm">
                      {req?.student?.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-800">
                        {req?.student?.name || "Unknown Student"}
                      </h3>
                      <p className="text-xs font-semibold text-slate-500">
                        {req?.student?.email || "No email provided"}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border ${badgeColors}`}
                  >
                    {req.status}
                  </span>
                </div>

                {/* Card Body: Project Info */}
                {/* Card Body: Project Info */}
                <div className="p-6 flex-1 space-y-4">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1">
                      <FileText className="w-3.5 h-3.5" /> Project Proposal
                    </div>
                    <h4 className="text-lg font-bold text-slate-800 leading-snug mb-3">
                      {project?.title || "No project title submitted yet."}
                    </h4>

                    {/* ✨ BADGES MOVED HERE: Right below the title! ✨ */}
                    <div className="flex flex-wrap gap-2">
                      {projectStatus === "approved" && supervisorAssigned && (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 w-max">
                          <CheckCircle className="w-3.5 h-3.5" /> Supervisor
                          already assigned
                        </div>
                      )}

                      {/* THE MISSING LOGIC: Approved and waiting for YOU to accept! */}
                      {projectStatus === "approved" && !supervisorAssigned && (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 w-max">
                          <CheckCircle className="w-3.5 h-3.5" /> Approved by
                          Admin & Ready
                        </div>
                      )}

                      {projectStatus === "rejected" && (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100 w-max">
                          <ShieldAlert className="w-3.5 h-3.5" /> Project
                          Rejected by Admin
                        </div>
                      )}

                      {projectStatus === "pending" && (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100 w-max">
                          <Clock className="w-3.5 h-3.5" /> Awaiting Admin
                          Approval
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                      <Calendar className="w-3.5 h-3.5" />
                      Submitted:{" "}
                      {req?.createdAt ?
                        new Date(req.createdAt).toLocaleString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "-"}
                    </div>
                  </div>
                </div>

                {/* Card Footer: Actions (Only show if request is pending) */}
                {isReqPending && (
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
                    {/* DECLINE BUTTON */}
                    <button
                      onClick={() => handleReject(req)}
                      disabled={isRejecting || isAccepting}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 text-sm font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isRejecting ?
                        <Loader2 className="w-4 h-4 animate-spin" />
                      : <XCircle className="w-4 h-4" />}
                      Decline
                    </button>

                    {/* ACCEPT BUTTON (Now with smart locking logic!) */}
                    <button
                      onClick={() => handleAccept(req)}
                      disabled={
                        isAccepting ||
                        isRejecting ||
                        projectStatus !== "approved" ||
                        supervisorAssigned
                      }
                      title={
                        projectStatus !== "approved" ?
                          "Project must be approved by Admin first"
                        : supervisorAssigned ?
                          "Student is already assigned to another teacher"
                        : "Accept this student"
                      }
                      className="flex-[2] flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow-md border border-transparent text-sm font-bold rounded-xl transition-all disabled:opacity-50 disabled:bg-slate-400 disabled:cursor-not-allowed"
                    >
                      {isAccepting ?
                        <Loader2 className="w-4 h-4 animate-spin" />
                      : <CheckCircle className="w-4 h-4" />}
                      Accept Supervision
                    </button>
                  </div>
                )}
              </div>
            );
          })
        : <div className="col-span-1 lg:col-span-2 text-center py-20 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50 flex flex-col items-center">
            <Inbox className="w-12 h-12 text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-700">
              No requests found
            </h3>
            <p className="text-slate-500 text-sm mt-1">
              You're all caught up! No pending proposals match your filter.
            </p>
          </div>
        }
      </div>
    </div>
  );
};

export default PendingRequests;
