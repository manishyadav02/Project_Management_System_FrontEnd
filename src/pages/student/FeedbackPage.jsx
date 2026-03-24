import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProject, getFeedback } from "../../store/slices/studentSlice";
import {
  MessageCircle,
  BadgeCheck,
  AlertCircle,
  Quote,
  Clock,
  UserCircle2,
} from "lucide-react";

const FeedbackPage = () => {
  const dispatch = useDispatch();
  const { project, feedback } = useSelector((state) => state.student);

  // BULLETPROOFING: Guarantee feedback is always an array to prevent crashes
  const safeFeedback = Array.isArray(feedback) ? feedback : [];

  useEffect(() => {
    dispatch(fetchProject());
  }, [dispatch]);

  useEffect(() => {
    if (project?._id) {
      dispatch(getFeedback(project._id));
    }
  }, [dispatch, project]);

  // Enhanced Icons with softer colors
  const getFeedbackIcon = (type) => {
    if (type === "positive")
      return <BadgeCheck className="w-6 h-6 text-emerald-500" />;
    // Changed negative to amber/yellow, as "Needs Revision" is constructive, not an error!
    if (type === "negative")
      return <AlertCircle className="w-6 h-6 text-amber-500" />;
    return <MessageCircle className="w-6 h-6 text-indigo-500" />;
  };

  // Dynamic borders for the feedback cards
  const getTypeBorder = (type) => {
    if (type === "positive") return "border-l-4 border-l-emerald-500";
    if (type === "negative") return "border-l-4 border-l-amber-500";
    return "border-l-4 border-l-indigo-500";
  };

  const feedbackStats = [
    {
      type: "general",
      title: "Total Feedback",
      bg: "bg-white",
      iconBg: "bg-indigo-50",
      textColor: "text-slate-500",
      valueColor: "text-slate-800",
      getCount: (fb) => fb.length,
    },
    {
      type: "positive",
      title: "Positive",
      bg: "bg-white",
      iconBg: "bg-emerald-50",
      textColor: "text-slate-500",
      valueColor: "text-slate-800",
      getCount: (fb) => fb.filter((f) => f.type === "positive").length,
    },
    {
      type: "negative",
      title: "Needs Revision",
      bg: "bg-white",
      iconBg: "bg-amber-50",
      textColor: "text-slate-500",
      valueColor: "text-slate-800",
      getCount: (fb) => fb.filter((f) => f.type === "negative").length,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      {/* 1. Sleek Page Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-50 to-white p-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
              <MessageCircle className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-800">
                Supervisor Feedback
              </h1>
              <p className="text-slate-500 mt-1 font-medium">
                Review comments and guidance for "
                {project?.title || "your project"}".
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Floating Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {feedbackStats.map((stat, index) => (
          <div
            key={index}
            className={`${stat.bg} rounded-2xl p-6 shadow-sm border border-slate-100 hover:-translate-y-1 hover:shadow-md transition-all duration-300`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`${stat.iconBg} rounded-xl p-3 shadow-sm border border-white/50`}
              >
                {getFeedbackIcon(stat.type)}
              </div>
              <div>
                <p
                  className={`text-sm font-bold uppercase tracking-wider ${stat.textColor}`}
                >
                  {stat.title}
                </p>
                <p
                  className={`text-3xl font-extrabold mt-1 ${stat.valueColor}`}
                >
                  {stat.getCount(safeFeedback)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Feedback Feed Timeline */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
        <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
          <Clock className="w-5 h-5 text-indigo-500" />
          Feedback History
        </h2>

        <div className="space-y-6">
          {safeFeedback.length > 0 ?
            safeFeedback.map((fb, index) => (
              <div
                key={index}
                className={`bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 ${getTypeBorder(fb.type)}`}
              >
                {/* Header of the Feedback Card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                      {getFeedbackIcon(fb.type)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-800">
                        {fb.title || "Feedback Update"}
                      </h3>
                      <div className="flex items-center gap-1.5 text-sm font-medium text-slate-500 mt-0.5">
                        <UserCircle2 className="w-4 h-4" />
                        {fb.supervisorName || "Supervisor"}
                      </div>
                    </div>
                  </div>

                  {/* Date Badge */}
                  <div className="inline-flex items-center justify-center px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-500 whitespace-nowrap">
                    {new Date(fb.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                </div>

                {/* Message Body inside a soft bubble */}
                <div className="relative bg-slate-50/50 rounded-xl p-5 border border-slate-100 ml-1 sm:ml-14">
                  <Quote className="absolute top-4 left-4 w-5 h-5 text-indigo-200" />
                  <p className="text-slate-700 leading-relaxed pl-8 text-sm sm:text-base">
                    {fb.message}
                  </p>
                </div>
              </div>
            ))
          : /* Empty State */
            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-5 shadow-sm border border-slate-100">
                <MessageCircle className="w-10 h-10 text-indigo-300 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">
                No feedback yet
              </h3>
              <p className="text-slate-500 mt-2 max-w-sm font-medium">
                When your supervisor reviews your work and leaves comments, they
                will appear right here.
              </p>
            </div>
          }
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
