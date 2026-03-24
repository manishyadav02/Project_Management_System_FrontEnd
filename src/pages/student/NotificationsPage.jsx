import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../../store/slices/notificationSlice";

import {
  MessageCircle,
  Clock5,
  BadgeCheck,
  Calendar,
  Settings,
  User,
  ChevronDown,
  AlertCircle,
  Clock,
  CheckCircle2,
  BellOff,
} from "lucide-react";

const NotificationsPage = () => {
  const dispatch = useDispatch();

  // 1. Grab the whole notification state object safely
  const notificationState = useSelector(
    (state) => state.notification || state.notifications || {},
  );

  // 2. BULLETPROOFING: Force it to be an array so .filter() never crashes!
  const rawList = notificationState.notifications || notificationState.list;
  const notificationsList = Array.isArray(rawList) ? rawList : [];

  // 3. BULLETPROOFING: Force this to be a number so React never gets an object
  const unreadCount =
    Number(notificationState.unreadOnly || notificationState.unreadCount) || 0;

  useEffect(() => {
    dispatch(getNotifications());
  }, [dispatch]);

  const markAsReadHandler = async (id) => {
    try {
      await dispatch(markAsRead(id));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsReadHandler = async () => {
    try {
      await dispatch(markAllAsRead());
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const deleteNotificationHandler = async (id) => {
    try {
      await dispatch(deleteNotification(id));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "feedback":
        return <MessageCircle className="w-6 h-6 text-blue-500" />;
      case "deadline":
        return <Clock5 className="w-6 h-6 text-red-500" />;
      case "approval":
        return <BadgeCheck className="w-6 h-6 text-green-500" />;
      case "meeting":
        return <Calendar className="w-6 h-6 text-purple-500" />;
      case "system":
        return <Settings className="w-6 h-6 text-gray-500" />;
      default:
        return (
          <div className="relative w-6 h-6 text-slate-500 flex items-center justify-center">
            <User className="w-5 h-5 absolute" />
            <ChevronDown className="w-4 h-4 absolute top-4" />
          </div>
        );
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "border-l-4 border-red-500"; // Fixed tailwind syntax!
      case "medium":
        return "border-l-4 border-yellow-500";
      case "low":
        return "border-l-4 border-green-500";
      default:
        return "border-l-4 border-slate-300";
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Just now";
    const date = new Date(dateStr);
    const now = new Date();

    // Get difference in milliseconds
    const diffTime = Math.abs(now - date);

    // Calculate exact minutes, hours, and days using Math.floor (round down!)
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // The SaaS-style logic waterfall
    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes} mins ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;

    // If it's older than a week, show the actual date
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  // Stats array safely uses the bulletproofed variables
  const stats = [
    {
      title: "Total",
      value: notificationsList.length,
      bg: "bg-blue-50",
      iconBg: "bg-blue-100",
      textColor: "text-blue-600",
      titleColor: "text-blue-800",
      valueColor: "text-blue-900",
      Icon: User,
    },
    {
      title: "Unread",
      value: unreadCount,
      bg: "bg-red-50",
      iconBg: "bg-red-100",
      textColor: "text-red-600",
      titleColor: "text-red-800",
      valueColor: "text-red-900",
      Icon: AlertCircle,
    },
    {
      title: "High Priority",
      value: notificationsList.filter((n) => n.priority === "high").length,
      bg: "bg-yellow-50",
      iconBg: "bg-yellow-100",
      textColor: "text-yellow-600",
      titleColor: "text-yellow-800",
      valueColor: "text-yellow-900",
      Icon: Clock,
    },
    {
      title: "This Week",
      value: notificationsList.filter((n) => {
        const notifDate = new Date(n.date || n.createdAt || Date.now());
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return notifDate >= weekAgo;
      }).length,
      bg: "bg-green-50",
      iconBg: "bg-green-100",
      textColor: "text-green-600",
      titleColor: "text-green-800",
      valueColor: "text-green-900",
      Icon: CheckCircle2,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="card">
        {/* Card Header */}
        <div className="card-header">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="card-title">Notifications</h1>
              <p className="card-subtitle">
                Stay updated with your progress and deadlines
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                className="btn-outline btn-small whitespace-nowrap"
                onClick={markAllAsReadHandler}
              >
                Mark All as Read ({unreadCount})
              </button>
            )}
          </div>
        </div>

        {/* Notifications Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6 px-6">
          {stats.map((stat, index) => (
            <div key={index} className={`${stat.bg} rounded-lg p-4`}>
              <div className="flex items-center">
                <div className={`${stat.iconBg} rounded-lg p-2`}>
                  <stat.Icon className={`${stat.textColor} w-5 h-5`} />
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${stat.titleColor}`}>
                    {stat.title}
                  </p>
                  <p className={`text-xl font-bold ${stat.valueColor}`}>
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* --- ACTUAL NOTIFICATIONS LIST UI --- */}
        <div className="px-6 pb-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">
            Recent Activity
          </h2>

          {notificationsList.length > 0 ?
            <div className="space-y-3">
              {notificationsList.map((notification) => (
                <div
                  key={notification._id || Math.random()}
                  className={`flex items-start p-4 rounded-xl border transition-all duration-200 ${
                    notification.isRead ?
                      "bg-white border-slate-100"
                    : "bg-indigo-50/30 border-indigo-100 shadow-sm"
                  } ${getPriorityColor(notification.priority)}`}
                >
                  {/* Dynamic Icon */}
                  <div className="flex-shrink-0 mr-4 mt-0.5 p-2 bg-white rounded-lg shadow-sm border border-slate-50">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-4">
                      <h3
                        className={`text-sm font-bold truncate ${
                          notification.isRead ? "text-slate-700" : (
                            "text-slate-900"
                          )
                        }`}
                      >
                        {notification.title}
                      </h3>
                      <span className="text-xs font-semibold text-slate-400 whitespace-nowrap mt-0.5">
                        {formatDate(
                          notification.date || notification.createdAt,
                        )}
                      </span>
                    </div>

                    <p
                      className={`text-sm mt-1 leading-relaxed ${
                        notification.isRead ? "text-slate-500" : (
                          "text-slate-700 font-medium"
                        )
                      }`}
                    >
                      {notification.message}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-4 mt-3">
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsReadHandler(notification._id)}
                          className="group flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                          Mark as read
                        </button>
                      )}
                      <button
                        onClick={() =>
                          deleteNotificationHandler(notification._id)
                        }
                        className="text-xs font-bold text-slate-400 hover:text-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Unread Glowing Dot Indicator */}
                  {!notification.isRead && (
                    <div className="flex-shrink-0 ml-4 mt-2">
                      <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.6)]"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          : /* Empty State */
            <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100">
                <BellOff className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">
                You're all caught up!
              </h3>
              <p className="text-slate-500 mt-1 max-w-sm">
                You have no notifications at the moment. We'll alert you when
                something important happens.
              </p>
            </div>
          }
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
