import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getTeacherDashboardStats } from "../../store/slices/teacherSlice";
import {
  Users,
  Clock,
  CheckCircle,
  Bell,
  Loader,
  TrendingUp,
  GraduationCap,
  ChevronRight,
  FileText,
  MessageSquare,
  Sparkles,
} from "lucide-react";

const TeacherDashboard = () => {
  const dispatch = useDispatch();

  const { dashboardStats, loading } = useSelector((state) => state.teacher);
  const { authUser } = useSelector((state) => state.auth);
  const [greeting, setGreeting] = useState("Welcome back");

  useEffect(() => {
    dispatch(getTeacherDashboardStats(authUser.id));

    // Smart Time-Based Greeting
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, [dispatch, authUser.id]);

  const statsCards = [
    {
      title: "Assigned Students",
      value: dashboardStats?.assignedStudents || 0,
      loading,
      Icon: Users,
      bg: "bg-blue-50",
      iconBg: "bg-blue-100",
      color: "text-blue-600",
    },
    {
      title: "Pending Requests",
      value: dashboardStats?.totalPendingRequests || 0,
      loading,
      Icon: Clock,
      bg: "bg-amber-50",
      iconBg: "bg-amber-100",
      color: "text-amber-600",
    },
    {
      title: "Completed Projects",
      value: dashboardStats?.completedProjects || 0,
      loading,
      Icon: CheckCircle,
      bg: "bg-emerald-50",
      iconBg: "bg-emerald-100",
      color: "text-emerald-600",
    },
  ];

  const quickActions = [
    {
      title: "Review Requests",
      desc: "Approve or reject student proposals",
      icon: FileText,
      color: "text-indigo-600",
      bg: "bg-indigo-50 hover:bg-indigo-100",
      link: "/teacher/pending-requests",
    },
    {
      title: "My Students",
      desc: "View project progress and deadlines",
      icon: Users,
      color: "text-emerald-600",
      bg: "bg-emerald-50 hover:bg-emerald-100",
      link: "/teacher/assigned-students",
    },
  ];

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-12">
      {/* 1. Ultra-Premium Glassmorphism Hero */}
      <div className="relative overflow-hidden bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-800">
        {/* Animated Background Glows */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
        <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl relative group">
              <div className="absolute inset-0 bg-white/20 rounded-2xl blur group-hover:blur-md transition-all"></div>
              <GraduationCap className="w-10 h-10 text-emerald-300 relative z-10" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-indigo-200 font-bold tracking-wider uppercase text-sm mb-1">
                <Sparkles className="w-4 h-4" /> Faculty Portal
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-2">
                {greeting}, {authUser?.name?.split(" ")[0] || "Professor"}!
              </h1>
              <p className="text-slate-300 text-base font-medium max-w-2xl leading-relaxed">
                Your command center for guiding students, reviewing proposals,
                and shaping the next generation of engineers.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Dynamic Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statsCards.map(
          ({ title, value, loading, Icon, bg, iconBg, color }, index) => (
            <div
              key={title}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group relative overflow-hidden flex flex-col justify-between min-h-[160px]"
            >
              {/* Hover Accent Line */}
              <div
                className={`absolute top-0 left-0 w-full h-1.5 opacity-0 group-hover:opacity-100 transition-opacity ${bg}`}
              ></div>

              <div className="flex justify-between items-start mb-4">
                <p className="text-sm font-bold uppercase tracking-wider text-slate-500 pr-4">
                  {title}
                </p>
                <div
                  className={`p-3 rounded-2xl shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${iconBg} ${color}`}
                >
                  <Icon className="w-6 h-6" />
                </div>
              </div>

              <div>
                <h3 className="text-5xl font-black text-slate-800 tracking-tight">
                  {loading ?
                    <Loader className="w-8 h-8 animate-spin text-slate-300 mt-2" />
                  : value}
                </h3>
                <div className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> Live
                  Data
                </div>
              </div>
            </div>
          ),
        )}
      </div>

      {/* 3. Bottom Split: Quick Actions & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Quick Actions */}
        <div className="space-y-6">
          <h3 className="text-xl font-black text-slate-800 px-2">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {quickActions.map((action, idx) => (
              <Link
                key={idx}
                to={action.link}
                className={`group flex items-center justify-between p-5 rounded-2xl border border-slate-100 transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${action.bg}`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 bg-white rounded-xl shadow-sm ${action.color}`}
                  >
                    <action.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-base group-hover:text-indigo-700 transition-colors">
                      {action.title}
                    </h4>
                    <p className="text-sm font-medium text-slate-500 mt-0.5">
                      {action.desc}
                    </p>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-slate-400 group-hover:text-indigo-600 group-hover:scale-110 transition-all">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Right Column: Recent Activity Timeline */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[400px]">
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                <Bell className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Activity Log</h3>
            </div>
          </div>

          <div className="p-8 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
            {loading ?
              <div className="flex justify-center items-center h-full">
                <Loader size={32} className="animate-spin text-indigo-500" />
              </div>
            : dashboardStats?.recentNotifications?.length > 0 ?
              <div className="relative border-l-2 border-slate-100 ml-4 space-y-8">
                {dashboardStats.recentNotifications.map(
                  (notification, index) => (
                    <div key={index} className="relative pl-8 group">
                      {/* Glowing Timeline Dot */}
                      <span className="absolute -left-[11px] top-1 w-5 h-5 rounded-full border-[5px] border-white shadow-sm bg-indigo-500 transition-transform group-hover:scale-125 group-hover:bg-indigo-600"></span>

                      <div className="bg-white group-hover:bg-slate-50 border border-slate-100 rounded-2xl p-5 transition-colors shadow-sm">
                        <p className="text-sm font-bold text-slate-700 leading-relaxed">
                          {notification.message}
                        </p>
                        <div className="mt-3 flex items-center gap-2">
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider rounded-md border border-slate-200 flex items-center gap-1.5">
                            <Clock className="w-3 h-3" />
                            {new Date(
                              notification.createdAt,
                            ).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </span>
                          {/* Fake "New" badge for unread notifications (since the query fetches isRead: false) */}
                          <span className="px-2 py-1 bg-rose-50 text-rose-600 text-[10px] font-bold uppercase tracking-wider rounded-md border border-rose-100">
                            New
                          </span>
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>
            : <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border-2 border-dashed border-slate-200">
                  <CheckCircle className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-base font-bold text-slate-700">Inbox Zero</p>
                <p className="text-sm font-medium text-slate-500 mt-1 max-w-[250px]">
                  You have no unread notifications or recent activity right now.
                </p>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
// $2b$10$ZqMslesl1RCntDSwoN.ZNOfmULr5CRWKkx3Mp9GbiwE9gwJXswxs.
