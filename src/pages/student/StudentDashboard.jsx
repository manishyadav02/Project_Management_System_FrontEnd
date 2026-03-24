import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboardStats } from "../../store/slices/studentSlice.js";
import {
  Sparkles,
  ArrowRight,
  Rocket,
  FolderGit2,
  UserCheck,
  CalendarClock,
  MessageSquare,
  FileText,
  Clock,
  Activity,
  ChevronRight,
  Quote,
  Bell,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const StudentDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { authUser } = useSelector((state) => state.auth);
  const { dashboardStats } = useSelector((state) => state.student);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);
  // console.log("REDUX DASHBOARD STATUS:", dashboardStats);
  const project = dashboardStats?.project || {};
  const supervisorName = dashboardStats?.supervisorName || "N/A";
  const upcomingDeadlines = dashboardStats?.upcomingDeadlines || [];

  const topNotifications = dashboardStats?.topNotifications || [];

  const feedbackList =
    dashboardStats?.feedbackNotification?.slice(-2).reverse() || [];

  const formatDeadline = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "upcoming":
        return "badge-pending";
      case "completed":
        return "badge-approved";
      case "overdue":
        return "badge-rejected";

      default:
        return "badge-pending";
    }
  };

  const getDeadlineDetails = (deadlineDate) => {
    if (!deadlineDate)
      return {
        days: null,
        text: "No deadline set",
        color: "text-slate-500",
        bg: "bg-slate-50",
      };

    const today = new Date();
    const deadline = new Date(deadlineDate);
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0)
      return {
        days: diffDays,
        text: "Overdue",
        color: "text-rose-600",
        bg: "bg-rose-50",
        ring: "ring-rose-100",
      };
    if (diffDays === 0)
      return {
        days: 0,
        text: "Due Today!",
        color: "text-rose-600",
        bg: "bg-rose-50",
        ring: "ring-rose-200",
      };
    if (diffDays <= 7)
      return {
        days: diffDays,
        text: "Days Left",
        color: "text-orange-600",
        bg: "bg-orange-50",
        ring: "ring-orange-100",
      };
    return {
      days: diffDays,
      text: "Days Left",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      ring: "ring-emerald-100",
    };
  };

  return (
    <>
      <div className="space-y-6">
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-blue-600 to-blue-500 p-8 rounded-2xl shadow-lg text-white">
          {/* Decorative background blur (adds depth) */}
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-400/20 rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Icon with Glassmorphism effect */}
            <div className="p-4 bg-white/10 border border-white/20 rounded-xl backdrop-blur-md shadow-sm">
              {project?.title ?
                <Rocket className="w-10 h-10 text-white" />
              : <Sparkles className="w-10 h-10 text-white" />}
            </div>

            {/* Text Content */}
            <div className="flex-1">
              <h1 className="text-3xl font-extrabold tracking-tight mb-2 flex items-center gap-2">
                Welcome back, {authUser?.name || "Student"}! 👋
              </h1>

              {project?.title ?
                <p className="text-blue-100 text-lg leading-relaxed max-w-2xl">
                  You are currently building{" "}
                  <span className="font-semibold text-white">
                    "{project.title}"
                  </span>{" "}
                  under the guidance of{" "}
                  <span className="font-semibold text-white">
                    {supervisorName}
                  </span>
                  . Keep up the great work!
                </p>
              : <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-3">
                  <p className="text-blue-100 text-lg">
                    You haven't submitted a project proposal yet. Let's change
                    that!
                  </p>
                  <Link
                    to="/student/submit-proposal"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-indigo-600 font-semibold rounded-lg shadow-md hover:bg-indigo-50 hover:shadow-lg transition-all active:scale-95"
                  >
                    Submit Proposal
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              }
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Project Title (Blue Theme) */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="flex items-center">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <FolderGit2 className="w-6 h-6" />
              </div>
              <div className="ml-4 min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-500">
                  Project Title
                </p>
                <p
                  className="text-lg font-bold text-slate-800 truncate"
                  title={project?.title || "N/A"}
                >
                  {project?.title || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Supervisor (Purple Theme) */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="flex items-center">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                <UserCheck className="w-6 h-6" />
              </div>
              <div className="ml-4 min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-500">Supervisor</p>
                <p className="text-lg font-bold text-slate-800 truncate">
                  {supervisorName || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: Deadline (Orange/Amber Theme) */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="flex items-center">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                <CalendarClock className="w-6 h-6" />
              </div>
              <div className="ml-4 min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-500">Deadline</p>
                <p className="text-lg font-bold text-slate-800 truncate">
                  {formatDeadline(project?.deadline) || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Card 4: Recent Feedback (Green Theme) */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
            <div className="flex items-center">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div className="ml-4 min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-500">
                  Recent Feedback
                </p>
                <p className="text-lg font-bold text-slate-800 truncate">
                  {feedbackList?.length ?
                    formatDeadline(feedbackList[0]?.createdAt)
                  : "No feedback yet"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Project Overview Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-500" />
              <h2 className="text-lg font-bold text-slate-800">
                Project Overview
              </h2>
            </div>

            <div className="p-6 flex-1 flex flex-col gap-6">
              {/* Title */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                  Title
                </label>
                <p className="text-xl font-bold text-slate-800 leading-snug">
                  {project?.title || "N/A"}
                </p>
              </div>

              {/* Highlight Box for Status & Deadline */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    <Activity className="w-3.5 h-3.5" /> Status
                  </label>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full font-semibold capitalize text-xs ${
                      project?.status === "approved" ?
                        "text-emerald-700 bg-emerald-100 border border-emerald-200"
                      : project?.status === "pending" ?
                        "text-amber-700 bg-amber-100 border border-amber-200"
                      : project?.status === "rejected" ?
                        "text-rose-700 bg-rose-100 border border-rose-200"
                      : "text-slate-700 bg-slate-100 border border-slate-200"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                        project?.status === "approved" ? "bg-emerald-500"
                        : project?.status === "pending" ? "bg-amber-500"
                        : project?.status === "rejected" ? "bg-rose-500"
                        : "bg-slate-500"
                      }`}
                    ></span>
                    {project?.status || "Invalid"}
                  </span>
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    <Clock className="w-3.5 h-3.5" /> Deadline
                  </label>
                  <p className="text-sm font-bold text-slate-800">
                    {formatDeadline(project?.deadline) || "N/A"}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="flex-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                  Description
                </label>
                <p className="text-slate-600 text-sm leading-relaxed bg-white rounded-lg">
                  {project?.description || "No description provided."}
                </p>
              </div>
            </div>
          </div>

          {/* Latest Feedback Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-500" />
                <h2 className="text-lg font-bold text-slate-800">
                  Latest Feedback
                </h2>
              </div>
              <Link
                to="/student/feedback"
                className="group flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                View All
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="p-6 flex-1 flex flex-col">
              {feedbackList && feedbackList.length > 0 ?
                <div className="space-y-4">
                  {feedbackList.map((feedback, index) => (
                    <div
                      key={index}
                      className="group p-5 rounded-xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all duration-300 relative overflow-hidden"
                    >
                      {/* Subtle accent line on hover */}
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-blue-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm shadow-sm">
                            {feedback.title?.charAt(0).toUpperCase() || "F"}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-800">
                              {feedback.title || "Feedback Update"}
                            </h4>
                            <span className="text-xs font-medium text-slate-500">
                              {formatDeadline(feedback.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pl-12 relative">
                        <Quote className="absolute left-0 top-0 w-4 h-4 text-slate-200" />
                        <p className="text-slate-600 text-sm leading-relaxed pl-6 italic line-clamp-3">
                          "{feedback.message}"
                        </p>
                        <div className="mt-3 flex justify-end">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 text-xs font-semibold text-slate-500 border border-slate-100">
                            By {supervisorName || "Supervisor"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              : <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                    <MessageSquare className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-500 font-medium">
                    No feedback received yet.
                  </p>
                  <p className="text-slate-400 text-sm mt-1">
                    When your supervisor leaves feedback, it will appear here.
                  </p>
                </div>
              }
            </div>
          </div>
        </div>

        {/* Deadlines & Notifications Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Project Deadline Countdown Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-indigo-500" />
              <h2 className="text-lg font-bold text-slate-800">
                Project Deadline
              </h2>
            </div>

            <div className="p-8 flex-1 flex flex-col items-center justify-center text-center">
              {
                upcomingDeadlines && upcomingDeadlines.length > 0 ?
                  // Grab the single deadline (index 0)
                  (() => {
                    const deadlineInfo = getDeadlineDetails(
                      upcomingDeadlines[0].deadline,
                    );
                    return (
                      <div className="flex flex-col items-center">
                        {/* The Big Countdown Number */}
                        <div
                          className={`w-32 h-32 rounded-full flex flex-col items-center justify-center ring-8 mb-4 ${deadlineInfo.bg} ${deadlineInfo.color} ${deadlineInfo.ring}`}
                        >
                          <span className="text-4xl font-black leading-none mb-1">
                            {deadlineInfo.days > 0 ? deadlineInfo.days : "!"}
                          </span>
                          <span className="text-xs font-bold uppercase tracking-wider opacity-80">
                            {deadlineInfo.text}
                          </span>
                        </div>

                        {/* The Exact Date */}
                        <h3 className="text-xl font-bold text-slate-800 mb-1">
                          {upcomingDeadlines[0].title || "Final Submission"}
                        </h3>
                        <p className="text-sm font-medium text-slate-500 flex items-center justify-center gap-1.5 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100 mt-2">
                          <CalendarClock className="w-4 h-4" />
                          {new Date(
                            upcomingDeadlines[0].deadline,
                          ).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    );
                  })()
                  // State when no deadline is set yet
                : <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                      <CalendarClock className="w-10 h-10 text-slate-300" />
                    </div>
                    <p className="text-slate-600 font-bold text-lg">
                      No deadline set
                    </p>
                    <p className="text-slate-400 text-sm mt-1 max-w-[200px]">
                      Your supervisor has not assigned a final submission date
                      yet.
                    </p>
                  </div>

              }
            </div>
          </div>

          {/* Recent Notifications Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-500" />
                <h2 className="text-lg font-bold text-slate-800">
                  Recent Notifications
                </h2>
              </div>
              <Link
                to="/student/notifications"
                className="group flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                View All
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <div className="p-2 flex-1 flex flex-col">
              {topNotifications && topNotifications.length > 0 ?
                <div className="space-y-1 mt-2">
                  {topNotifications.map((notification, index) => (
                    <div
                      key={index}
                      className="group flex items-start space-x-4 p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
                    >
                      {/* Glowing unread dot illusion */}
                      <div className="relative mt-1">
                        <div className="absolute inset-0 bg-indigo-400 rounded-full blur-sm opacity-50 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative w-2.5 h-2.5 bg-indigo-500 rounded-full border-2 border-white"></div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 leading-snug">
                          {notification.message}
                        </p>
                        <p className="text-xs font-medium text-slate-400 mt-1.5 flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          {formatDeadline(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              : <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                    <Bell className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-500 font-medium">
                    No recent notifications.
                  </p>
                  <p className="text-slate-400 text-sm mt-1">
                    We'll let you know when something happens.
                  </p>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StudentDashboard;
