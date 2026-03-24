import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  getAllUsers,
  assignSupervisor as assignSupervisorThunk,
} from "../../store/slices/adminSlice";
import {
  AlertTriangle,
  CheckCircle,
  Users,
  Search,
  Filter,
  UserPlus,
  ShieldCheck,
  Clock,
  XCircle,
  ChevronDown,
} from "lucide-react";

const AssignSupervisor = () => {
  const dispatch = useDispatch();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedSupervisor, setSelectedSupervisor] = useState({});
  const [pendingFor, setPendingFor] = useState(null);

  const { users, projects } = useSelector((state) => state.admin);

  useEffect(() => {
    if (!users || users.length === 0) {
      dispatch(getAllUsers());
    }
  }, [dispatch, users]);

  // Format date safely to DD/MM/YY
  const formatToDDMMYY = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date)) return "-";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  };

  const teachers = useMemo(() => {
    const teacherUsers = (users || []).filter(
      (user) => user.role?.toLowerCase() === "teacher",
    );
    return teacherUsers.map((t) => ({
      ...t,
      assignedCount:
        Array.isArray(t.assignedStudents) ? t.assignedStudents.length : 0,
      capacityLeft:
        (typeof t.maxStudents === "number" ? t.maxStudents : 0) -
        (Array.isArray(t.assignedStudents) ? t.assignedStudents.length : 0),
    }));
  }, [users]);

  const studentProjects = useMemo(() => {
    return (projects || [])
      .filter((p) => p.student?._id || p.student)
      .map((p) => ({
        projectId: p._id,
        title: p.title,
        status: p.status,
        supervisor: p.supervisor?.name || null,
        supervisorId: p.supervisor?._id || null,
        studentId: p.student?._id || "Unknown",
        studentName: p.student?.name || "Unknown Student",
        studentEmail: p.student?.email || "No email",
        studentDept: p.student?.department || "Department Not Set",
        deadline: formatToDDMMYY(p.deadline),
        updatedAt:
          p.updatedAt ? formatToDDMMYY(new Date(p.updatedAt).toLocaleDateString())  : "-",
       isApproved: p.status === "approved" || p.status === "completed",
      }));
  }, [projects]);

  const filtered = studentProjects.filter((row) => {
    const matchesSearch =
      (row.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (row.studentName || "").toLowerCase().includes(searchTerm.toLowerCase());

    const status = row.supervisor ? "assigned" : "unassigned";
    const matchesFilter = filterStatus === "all" || filterStatus === status;
    return matchesSearch && matchesFilter;
  });

  const handleSupervisorSelect = (projectId, supervisorId) => {
    setSelectedSupervisor((prev) => ({
      ...prev,
      [projectId]: supervisorId,
    }));
  };

  const handleAssign = async (studentId, projectStatus, projectId) => {
    const supervisorId = selectedSupervisor[projectId];
    if (!studentId || !supervisorId) {
      toast.error("Please select a supervisor first");
      return;
    }
    if (projectStatus === "rejected") {
      toast.error("Cannot assign a supervisor to a rejected project");
      return;
    }

    setPendingFor(projectId);
    const res = await dispatch(
      assignSupervisorThunk({ studentId, supervisorId }),
    );
    setPendingFor(null);

    if (assignSupervisorThunk.fulfilled.match(res)) {
      // toast.success("Supervisor assigned successfully");
      setSelectedSupervisor((prev) => {
        const newState = { ...prev };
        delete newState[projectId];
        return newState;
      });
      dispatch(getAllUsers());
    } 
  };

  const dashboardCards = [
    {
      title: "Assigned Projects",
      value: studentProjects.filter((r) => !!r.supervisor).length,
      Icon: CheckCircle,
      bg: "bg-emerald-50",
      color: "text-emerald-600",
    },
    {
      title: "Pending Assignments",
      value: studentProjects.filter((r) => !r.supervisor).length,
      Icon: AlertTriangle,
      bg: "bg-amber-50",
      color: "text-amber-600",
    },
    {
      title: "Available Teachers",
      value: teachers.filter((t) => (t.capacityLeft ?? 0) > 0).length,
      Icon: Users,
      bg: "bg-blue-50",
      color: "text-blue-600",
    },
  ];

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-12">
      {/* 1. Page Header */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-white p-6 md:p-8 flex items-center gap-4">
          <div className="p-3.5 bg-white text-indigo-600 rounded-2xl shadow-sm border border-slate-100">
            <UserPlus className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl  font-black text-slate-600 tracking-tight">
              Supervisor Allocation
            </h1>
            <p className="text-slate-500 font-medium text-sm mt-1">
              Match submitted projects with available faculty members.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Top Stats Row (Restored and Styled!) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {dashboardCards.map((card, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md hover:border-indigo-200 transition-all duration-300 group"
          >
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                {card.title}
              </h4>
              <p className="text-3xl font-black text-slate-600">{card.value}</p>
            </div>
            <div
              className={`p-4 rounded-2xl transition-transform duration-300 group-hover:scale-110 ${card.bg} ${card.color}`}
            >
              <card.Icon className="w-7 h-7" />
            </div>
          </div>
        ))}
      </div>

      {/* 3. Filter & Search Bar */}
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
            <option value="all">All Projects</option>
            <option value="unassigned">Needs Supervisor</option>
            <option value="assigned">Already Assigned</option>
          </select>
          <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* 4. Assignment Data Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center ">
          <h2 className="text-lg font-bold text-slate-800">
            Allocation Ledger
          </h2>
          <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full border border-indigo-100">
            {filtered.length} Records
          </span>
        </div>

        <div className="overflow-x-auto">
          {filtered.length > 0 ?
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Student Details
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Project Title
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Current Status
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Assign To
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right ">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((row) => (
                  <tr
                    key={row.projectId}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Student Info */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-blue-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                          {row.studentName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-800">
                            {row.studentName}
                          </div>
                          <div className="text-xs font-semibold text-slate-400 mt-0.5">
                            {row.studentDept}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Project Title & Dates */}
                    <td className="px-6 py-4">
                      <div
                        className="text-sm font-bold text-slate-800 max-w-[250px] truncate"
                        title={row.title}
                      >
                        {row.title}
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Updated: {row.updatedAt}
                        </span>
                      </div>
                    </td>

                    {/* Supervisor Status Badge */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {row.supervisor ?
                        <div className="inline-flex flex-col gap-1">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold uppercase tracking-wide w-max">
                            <ShieldCheck className="w-3.5 h-3.5" />  {row.supervisor}
                          </span>
                          
                        </div>
                      : <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-bold uppercase tracking-wide">
                          <AlertTriangle className="w-3.5 h-3.5" /> Unassigned
                        </span>
                      }
                    </td>

                    {/* Premium Select Dropdown */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="relative w-48">
                        <select
                          disabled={
                            !!row.supervisor ||
                            row.status === "rejected" ||
                            !row.isApproved
                          }
                          className="w-full pl-3 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-xs font-bold text-slate-700 appearance-none disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
                          value={selectedSupervisor[row.projectId] || ""}
                          onChange={(e) =>
                            handleSupervisorSelect(
                              row.projectId,
                              e.target.value,
                            )
                          }
                        >
                          <option value="">Select Faculty...</option>
                          {teachers.map((t) => (
                            <option
                              key={t._id}
                              value={t._id}
                              disabled={t.capacityLeft <= 0}
                            >
                              {t.name} ({t.capacityLeft} slots left)
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    </td>

                    {/* Smart Action Button */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {row.supervisor ?
                        <span className="inline-flex items-center justify-center px-4 py-2 bg-slate-100 text-slate-400 text-xs font-bold rounded-xl cursor-not-allowed">
                          <CheckCircle className="w-4 h-4 mr-1.5" /> Completed
                        </span>
                      : row.status === "rejected" ?
                        <span className="inline-flex items-center justify-center px-4 py-2 bg-rose-50 text-rose-500 text-xs font-bold rounded-xl cursor-not-allowed">
                          <XCircle className="w-4 h-4 mr-1.5" /> Rejected
                        </span>
                      : !row.isApproved ?
                        <span
                          className="inline-flex items-center justify-center px-4 py-2 bg-slate-100 text-slate-400 text-xs font-bold rounded-xl cursor-not-allowed"
                          title="Project must be approved first"
                        >
                          Not Approved
                        </span>
                      : <button
                          onClick={() =>
                            handleAssign(
                              row.studentId,
                              row.status,
                              row.projectId,
                            )
                          }
                          disabled={
                            pendingFor === row.projectId ||
                            !selectedSupervisor[row.projectId]
                          }
                          className="inline-flex items-center justify-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                        >
                          {pendingFor === row.projectId ?
                            <span className="flex items-center gap-2">
                              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>{" "}
                              Assigning...
                            </span>
                          : "Assign Supervisor"}
                        </button>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          : <div className="text-center py-20 border-t border-slate-100 bg-slate-50/50">
              <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">
                No projects found
              </h3>
              <p className="text-slate-500 text-sm mt-1 font-medium">
                Try adjusting your filters or search terms.
              </p>
            </div>
          }
        </div>
      </div>
    </div>
  );
};

export default AssignSupervisor;
