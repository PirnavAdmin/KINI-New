import { createPortal } from 'react-dom';
import { normalizeNotificationTimestamp } from '@shared/services/localScheduleStore';
import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  BellOff,
  CheckCheck,
  Search,
  X,
  Mail,
  MailOpen,
  AlertTriangle,
  UserPlus,
  BookOpen,
  Layers,
  ClipboardCheck,
  Video,
  Settings as SettingsIcon,
  Briefcase,
  CreditCard,
  CalendarCheck,
  Megaphone,
  Clock,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  NOTIFICATION_CATEGORIES,
  getPriorityStyle,
  getTimeAgo,
  formatTimestamp,
  filterNotifications,
  getCategoryCounts,
  getPriorityCounts,
  getTodayCount,
  getWeekCount,
} from "../data/notificationMockData";
import { notificationService } from "@shared/services/notificationService";
import toast from "react-hot-toast";
import { useAuth } from "@shared/hooks/useAuth";
import { readStoredOrganizationId } from "@shared/services/apiServices";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 10;

// Backend notifications carry a PascalCase `notificationType` enum (e.g. "LeaveRequestCreated")
// rather than a free-text category — humanize it for display.
const humanizeNotificationType = (value) => (value ? String(value).replace(/([a-z])([A-Z])/g, "$1 $2").trim() : null);

const DONUT_COLORS = [
  "#0f55f7",
  "#06b6a8",
  "#8b5cf6",
  "#f59e0b",
  "#ef4444",
  "#10b981",
  "#ec4899",
];

const SORT_OPTIONS = [
  { label: "Newest First", value: "newest" },
  { label: "Oldest First", value: "oldest" },
  { label: "Priority (High)", value: "priority-high" },
  { label: "Priority (Low)", value: "priority-low" },
];

// ─── ICON MAP ─────────────────────────────────────────────────────────────────

function NotificationIcon({ category, className = "w-5 h-5" }) {
  const iconMap = {
    Employees: <UserPlus className={className} />,
    Courses: <BookOpen className={className} />,
    Batches: <Layers className={className} />,
    Attendance: <ClipboardCheck className={className} />,
    "Live Classes": <Video className={className} />,
    System: <SettingsIcon className={className} />,
    HR: <Briefcase className={className} />,
    Payroll: <CreditCard className={className} />,
    Leave: <CalendarCheck className={className} />,
    Announcements: <Megaphone className={className} />,
  };
  return iconMap[category] || <Bell className={className} />;
}

// ─── SKELETON LOADER ──────────────────────────────────────────────────────────

function NotificationSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl border border-slate-100 dark:border-slate-700/50 bg-white dark:bg-slate-900/50 p-4"
        >
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 shrink-0 rounded-lg bg-slate-200 dark:bg-slate-700" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-3 w-full rounded bg-slate-100 dark:bg-slate-700/50" />
              <div className="flex gap-3">
                <div className="h-3 w-20 rounded bg-slate-100 dark:bg-slate-700/50" />
                <div className="h-3 w-16 rounded bg-slate-100 dark:bg-slate-700/50" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── SUMMARY SKELETON ─────────────────────────────────────────────────────────

function SummarySkeleton() {
  return (
    <div className="animate-pulse space-y-3 rounded-xl border border-slate-100 dark:border-slate-700/50 bg-white dark:bg-slate-900/50 p-4">
      <div className="h-5 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
      <div className="grid grid-cols-2 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg bg-slate-100 dark:bg-slate-700/50 p-3"
          >
            <div className="h-3 w-16 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="mt-1 h-6 w-10 rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── NOTIFICATION CARD ────────────────────────────────────────────────────────

function NotificationCard({ notification, onClick }) {
  const priorityStyle = getPriorityStyle(notification.priority);
  const isUnread = notification.unread;
  const timeDisplay = getTimeAgo(notification.timestamp);

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      onClick={() => onClick(notification)}
      className={`group relative w-full rounded-xl border text-left transition-all duration-200 ${
        isUnread
          ? "border-blue-100 bg-blue-50/40 dark:border-blue-500/20 dark:bg-blue-500/5"
          : "border-slate-100 bg-white dark:border-slate-700/50 dark:bg-slate-900/50"
      } hover:shadow-lg hover:-translate-y-0.5 hover:border-slate-200 dark:hover:border-slate-600
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0f55f7]/30 focus-visible:ring-offset-2`}
      role="listitem"
      aria-label={`${notification.title} - ${notification.priority} priority, ${isUnread ? "unread" : "read"}`}
    >
      <div className="flex items-start gap-3 px-3.5 py-3">
        {/* Priority Indicator */}
        <span
          className={`mt-1 h-2 w-2 shrink-0 rounded-full ${priorityStyle.dot} ${
            notification.priority === "Critical" ? "animate-pulse" : ""
          }`}
          aria-hidden="true"
        />

        {/* Icon */}
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
            isUnread
              ? "bg-[#0f55f7]/10 text-[#0f55f7] dark:bg-[#0f55f7]/20"
              : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
          }`}
        >
          <NotificationIcon
            category={notification.category}
            className={`h-4 w-4 ${isUnread ? "text-[#0f55f7]" : ""}`}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3
              className={`text-sm leading-snug truncate ${
                isUnread
                  ? "font-semibold text-slate-900 dark:text-white"
                  : "font-medium text-slate-700 dark:text-slate-300"
              }`}
            >
              {notification.title}
            </h3>
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Category Badge */}
              <span className="hidden sm:inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                {notification.category}
              </span>
              {/* Unread indicator */}
              {isUnread && (
                <span
                  className="h-2 w-2 rounded-full bg-[#0f55f7]"
                  aria-label="Unread"
                />
              )}
            </div>
          </div>
          <p className="mt-0.5 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
            {notification.description}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeDisplay}
            </span>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                priorityStyle.badge
              }`}
            >
              {notification.priority}
            </span>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

// ─── NOTIFICATION DETAIL MODAL ────────────────────────────────────────────────

export function NotificationDetailModal({ notification, onClose, onMarkRead, onDelete }) {
  if (!notification) return null;

  const priorityStyle = getPriorityStyle(notification.priority);

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[10000] flex items-center justify-center overflow-y-auto p-3 sm:p-4 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="notification-detail-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="my-auto flex max-h-[calc(100dvh-1.5rem)] w-full max-w-lg min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900 sm:max-h-[calc(100dvh-2rem)]"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 shrink-0 border-b border-slate-100 dark:border-slate-700/50 px-6 py-4">
            <div className="flex min-w-0 items-center gap-3">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                  notification.unread
                    ? "bg-[#0f55f7]/10 text-[#0f55f7]"
                    : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                }`}
              >
                <NotificationIcon
                  category={notification.category}
                  className="w-6 h-6"
                />
              </div>
              <div className="min-w-0">
                <h2
                  id="notification-detail-title"
                  className="break-words text-lg font-bold text-slate-900 dark:text-white [overflow-wrap:anywhere]"
                >
                  {notification.title}
                </h2>
                <span className="text-xs text-slate-400">
                  {notification.category}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="min-h-0 space-y-4 overflow-y-auto px-4 py-4 sm:px-6">
            <p className="break-words text-sm leading-relaxed text-slate-600 dark:text-slate-300 [overflow-wrap:anywhere]">
              {notification.description}
            </p>

            <div className="grid grid-cols-1 gap-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50 sm:grid-cols-2">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Category
                </p>
                <p className="mt-1 break-words text-sm font-medium text-slate-900 dark:text-white [overflow-wrap:anywhere]">
                  {notification.category}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Priority
                </p>
                <span
                  className={`mt-1 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                    priorityStyle.badge
                  }`}
                >
                  {notification.priority}
                </span>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Created By
                </p>
                <p className="mt-1 break-words text-sm font-medium text-slate-900 dark:text-white [overflow-wrap:anywhere]">
                  {notification.createdBy}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Created Time
                </p>
                <p className="mt-1 break-words text-sm font-medium text-slate-900 dark:text-white [overflow-wrap:anywhere]">
                  {formatTimestamp(notification.timestamp)}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Related Module
                </p>
                <p className="mt-1 break-words text-sm font-medium text-slate-900 dark:text-white [overflow-wrap:anywhere]">
                  {notification.relatedModule}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Status
                </p>
                <span
                  className={`mt-1 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                    notification.unread
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300"
                      : "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300"
                  }`}
                >
                  {notification.unread ? "Unread" : "Read"}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-4 dark:border-slate-700/50 sm:px-6">
            {notification.unread ? (
              <button
                onClick={() => {
                  onMarkRead(notification.id);
                  onClose();
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0f55f7] to-[#06b6a8] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#0f55f7]/20 hover:shadow-xl hover:shadow-[#0f55f7]/30 transition-all"
              >
                <MailOpen className="w-4 h-4" />
                Mark as Read
              </button>
            ) : (
              <span className="inline-flex items-center gap-2 text-sm text-slate-400">
                <Mail className="w-4 h-4" />
                Already Read
              </span>
            )}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onDelete(notification.id);
                  onClose();
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
                aria-label="Delete notification"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>, document.body
  );
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────

function EmptyState({ hasSearch }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 mb-4">
        <BellOff className="w-10 h-10 text-slate-300 dark:text-slate-600" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
        No Notifications Found
      </h3>
      <p className="mt-1 text-sm text-slate-400">
        {hasSearch
          ? "Try adjusting your search or filters."
          : "You're all caught up. Check back later for new notifications."}
      </p>
    </motion.div>
  );
}

// ─── ERROR STATE ──────────────────────────────────────────────────────────────

function ErrorState({ onRetry }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-500/10 mb-4">
        <AlertTriangle className="w-10 h-10 text-amber-500" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
        Backend Unavailable
      </h3>
      <p className="mt-1 text-sm text-slate-400 text-center max-w-md">
        We could not load notifications. Please retry.
      </p>
      <button
        onClick={onRetry}
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#0f55f7] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0f55f7]/90 transition-colors"
      >
        Retry Connection
      </button>
    </motion.div>
  );
}

// ─── SUMMARY CARD ─────────────────────────────────────────────────────────────

function SummaryCard({ total, unread, read, counts }) {
  return (
    <div className="rounded-xl border border-slate-100 dark:border-slate-700/50 bg-white dark:bg-slate-900/50 p-4 shadow-sm">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
        Notification Summary
      </h3>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-blue-50 dark:bg-blue-500/10 p-3">
          <p className="text-[10px] font-medium text-blue-500 dark:text-blue-400">
            Total
          </p>
          <p className="mt-0.5 text-xl font-extrabold text-blue-700 dark:text-blue-300">
            {total}
          </p>
        </div>
        <div className="rounded-lg bg-purple-50 dark:bg-purple-500/10 p-3">
          <p className="text-[10px] font-medium text-purple-500 dark:text-purple-400">
            Unread
          </p>
          <p className="mt-0.5 text-xl font-extrabold text-purple-700 dark:text-purple-300">
            {unread}
          </p>
        </div>
        <div className="rounded-lg bg-green-50 dark:bg-green-500/10 p-3">
          <p className="text-[10px] font-medium text-green-500 dark:text-green-400">
            Read
          </p>
          <p className="mt-0.5 text-xl font-extrabold text-green-700 dark:text-green-300">
            {read}
          </p>
        </div>
        <div className="rounded-lg bg-red-50 dark:bg-red-500/10 p-3">
          <p className="text-[10px] font-medium text-red-500 dark:text-red-400">
            Critical
          </p>
          <p className="mt-0.5 text-xl font-extrabold text-red-700 dark:text-red-300">
            {counts?.Critical || 0}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── DONUT CHART ──────────────────────────────────────────────────────────────

function DonutChart({ notifications }) {
  const chartData = useMemo(() => {
    const catMap = {};
    notifications.forEach((n) => {
      catMap[n.category] = (catMap[n.category] || 0) + 1;
    });
    return Object.entries(catMap).map(([name, value], idx) => ({
      name,
      value,
      color: DONUT_COLORS[idx % DONUT_COLORS.length],
    }));
  }, [notifications]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-slate-400">
        No data available
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-100 dark:border-slate-700/50 bg-white dark:bg-slate-900/50 p-4 shadow-sm">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
        Category Distribution
      </h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={70}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
                fontSize: "13px",
              }}
              formatter={(value, name) => [value, name]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
        {chartData.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2 text-[11px]">
            <span
              className="h-2 w-2 rounded-full shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-slate-500 dark:text-slate-400 truncate">
              {entry.name}
            </span>
            <span className="ml-auto font-semibold text-slate-700 dark:text-slate-300">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── QUICK FILTER CARD ────────────────────────────────────────────────────────

function QuickFilterCard({ currentFilter, onFilterChange }) {
  const quickFilters = [
    { label: "All", value: "All" },
    { label: "Unread", value: "unread-quick" },
    { label: "Critical", value: "Critical" },
    { label: "Today", value: "today" },
    { label: "This Week", value: "week" },
  ];

  return (
    <div className="rounded-xl border border-slate-100 dark:border-slate-700/50 bg-white dark:bg-slate-900/50 p-4 shadow-sm">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
        Quick Filters
      </h3>
      <div className="flex flex-wrap gap-1.5">
        {quickFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => onFilterChange("quickFilter", f.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentFilter === f.value
                ? "bg-[#0f55f7] text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── PREFERENCES CARD ─────────────────────────────────────────────────────────

function PreferencesCard() {
  const navigate = useNavigate();
  const preferences = [
    { label: "Email Notifications", enabled: true },
    { label: "In-App Notifications", enabled: true },
  ];

  const [toggles, setToggles] = useState(
    preferences.reduce((acc, p) => ({ ...acc, [p.label]: p.enabled }), {}),
  );

  return (
    <div className="rounded-xl border border-slate-100 dark:border-slate-700/50 bg-white dark:bg-slate-900/50 p-4 shadow-sm">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
        Notification Settings
      </h3>
      <button
        onClick={() => navigate("/organization/settings?tab=notifications")}
        className="mb-2 w-full rounded-lg bg-slate-50 px-3 py-2 text-left text-xs font-semibold text-[#0f55f7] transition-colors hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800"
      >
        Open Notification Preferences →
      </button>
      <div className="space-y-2">
        {preferences.map((pref) => (
          <div
            key={pref.label}
            className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <span className="text-sm text-slate-700 dark:text-slate-300">
              {pref.label}
            </span>
            <button
              onClick={() =>
                setToggles((prev) => ({
                  ...prev,
                  [pref.label]: !prev[pref.label],
                }))
              }
              className={`relative h-5 w-9 rounded-full transition-colors ${
                toggles[pref.label]
                  ? "bg-[#0f55f7]"
                  : "bg-slate-200 dark:bg-slate-700"
              }`}
              role="switch"
              aria-checked={toggles[pref.label]}
              aria-label={`${pref.label} toggle`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                  toggles[pref.label] ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── CATEGORY TABS ────────────────────────────────────────────────────────────

function CategoryTabs({ activeCategory, onCategoryChange, categoryCounts }) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -200 : 200,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative">
      {/* Left scroll button */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 dark:bg-slate-800/90 shadow-md border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <div
        ref={scrollRef}
        className="scrollbar-hide flex gap-2 overflow-x-auto px-12 py-1.5 scroll-smooth"
        role="tablist"
        aria-label="Notification category filters"
      >
        {NOTIFICATION_CATEGORIES.map((cat) => {
          const count = categoryCounts[cat] || 0;
          const isActive = activeCategory === cat;
          const isSystem = cat === "System";
          return (
            <button
              key={cat}
              role="tab"
              aria-selected={isActive}
              onClick={(event) => {
                onCategoryChange(cat);
                event.currentTarget.scrollIntoView({
                  behavior: "smooth",
                  block: "nearest",
                  inline: "center",
                });
              }}
              className={`flex min-h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 ${
                isActive
                  ? "border-[#0f55f7] bg-[#0f55f7] !text-white shadow-sm shadow-blue-200"
                  : "border-transparent bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              } ${isSystem ? "hidden sm:flex" : ""}`}
            >
              {cat}
              {count > 0 && (
                <span
                  className={`inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full px-1 text-[10px] font-bold ${
                    isActive
                      ? "bg-white/25 !text-white ring-1 ring-white/30"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Right scroll button */}
      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 dark:bg-slate-800/90 shadow-md border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── MAIN PAGE COMPONENT ──────────────────────────────────────────────────────

export default function Notifications() {
  // ── State ────────────────────────────────────────────────────
  const { user } = useAuth();
  const organizationId = user?.organizationId
    ?? localStorage.getItem("organizationId")
    ?? localStorage.getItem("organization_id")
    ?? readStoredOrganizationId();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [activeQuickFilter, setActiveQuickFilter] = useState("All");
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const searchInputRef = useRef(null);

  // Load notifications and the unread count from the backend.
  const loadNotifications = useCallback(async () => {
    if (!organizationId) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    setError(false);
    setLoading(true);
    try {
      const rows = await notificationService.getOrganizationNotifications(organizationId);
      setNotifications(
        (Array.isArray(rows) ? rows : []).map((item) => ({
          id: item.notificationId,
          title: item.title ?? item.subject ?? "Notification",
          description: item.description ?? item.message ?? "",
          category: item.category ?? humanizeNotificationType(item.notificationType) ?? "System",
          priority: item.priority ?? "Medium",
          unread: !(item.isRead ?? item.read ?? false),
          timestamp: normalizeNotificationTimestamp(item.createdAt ?? item.createdDate ?? item.createdOn ?? item.timestamp ?? item.CreatedAt ?? item.CreatedDate) || null,
          createdBy: item.createdBy ?? "System",
          relatedModule: item.relatedModule ?? item.module ?? "System",
        })),
      );
    } catch {
      setNotifications([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    queueMicrotask(loadNotifications);
  }, [loadNotifications]);

  // Keyboard shortcut (Ctrl+K) for search focus
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ── Derived state ───────────────────────────────────────────
  const categoryCounts = useMemo(
    () => getCategoryCounts(notifications),
    [notifications],
  );
  // Keep every badge and summary tied to the same notification rows shown on
  // this page. The separate backend unread total may include records outside
  // the returned page and caused visible counts to disagree.
  const unreadCount = useMemo(
    () => notifications.filter((notification) => notification.unread).length,
    [notifications],
  );
  const priorityCounts = useMemo(
    () => getPriorityCounts(notifications),
    [notifications],
  );
  const todayCount = useMemo(
    () => getTodayCount(notifications),
    [notifications],
  );
  const weekCount = useMemo(() => getWeekCount(notifications), [notifications]);

  const filteredNotifications = useMemo(() => {
    let filtered = filterNotifications(notifications, {
      search: searchQuery,
      category: activeQuickFilter !== "All" ? "All" : activeCategory,
    });

    // Additional quick filters
    if (activeQuickFilter === "unread-quick") {
      filtered = filtered.filter((n) => n.unread);
    } else if (activeQuickFilter === "Critical") {
      filtered = filtered.filter((n) => n.priority === "Critical");
    } else if (activeQuickFilter === "today") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filtered = filtered.filter((n) => new Date(n.timestamp) >= today);
    } else if (activeQuickFilter === "week") {
      // eslint-disable-next-line react-hooks/purity -- pre-existing demo filter using current time
      const weekAgo = new Date(Date.now() - 7 * 86400000);
      filtered = filtered.filter((n) => new Date(n.timestamp) >= weekAgo);
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.timestamp) - new Date(b.timestamp);
        case "priority-high": {
          const priorityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        case "priority-low": {
          const priorityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        default:
          return new Date(b.timestamp) - new Date(a.timestamp);
      }
    });

    return filtered;
  }, [notifications, searchQuery, activeCategory, activeQuickFilter, sortBy]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredNotifications.length / ITEMS_PER_PAGE),
  );

  const paginatedNotifications = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredNotifications.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredNotifications, currentPage]);


  const readCount = notifications.length - unreadCount;

  // ── Handlers ────────────────────────────────────────────────
  const handleMarkAllRead = useCallback(async () => {
    if (!organizationId) return;
    try { await notificationService.markAllOrganizationRead(organizationId); await loadNotifications(); }
    catch (error) { toast.error(error?.response?.data?.message || 'Unable to mark notifications as read.'); }
  }, [organizationId, loadNotifications]);

  const handleMarkRead = useCallback(async (id) => {
    try { await notificationService.markRead(id); await loadNotifications(); }
    catch (error) { toast.error(error?.response?.data?.message || 'Unable to mark notification as read.'); }
  }, [loadNotifications]);

  const handleDelete = useCallback(async (id) => {
    try { await notificationService.remove(id); await loadNotifications(); }
    catch (error) { toast.error(error?.response?.data?.message || 'Unable to delete notification.'); }
  }, [loadNotifications]);

  const handleCategoryChange = useCallback((cat) => {
    setActiveCategory(cat);
    setActiveQuickFilter("All");
    setCurrentPage(1);
  }, []);

  const handleQuickFilterChange = useCallback((key, value) => {
    if (key === "quickFilter") {
      setActiveQuickFilter(value);
      setActiveCategory("All");
      setCurrentPage(1);
    }
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  }, []);

  const handleSortChange = useCallback((value) => {
    setSortBy(value);
    setShowSortDropdown(false);
  }, []);

  const handleRetry = useCallback(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Close sort dropdown on outside click
  useEffect(() => {
    if (!showSortDropdown) return;
    const handleClick = () => setShowSortDropdown(false);
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [showSortDropdown]);

  // ── Render ──────────────────────────────────────────────────
  return (
    <div className="mx-auto w-full max-w-[1680px] px-3 py-3 sm:px-4 lg:px-5">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-center"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-cyan-50 shadow-inner dark:from-blue-500/20 dark:to-cyan-500/10">
            <Bell className="h-5 w-5 text-[#0f55f7]" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-950 dark:text-white">
              Notifications
            </h1>
            <p className="text-sm text-slate-400">
              Stay updated with important organization activities and alerts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mark All as Read */}
          <button
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-blue-200 bg-blue-50/70 px-3 text-xs font-semibold text-blue-700 transition-all hover:border-blue-300 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/20"
            aria-label="Mark all notifications as read"
          >
            <CheckCheck className="w-4 h-4" />
            <span className="hidden sm:inline">Mark All as Read</span>
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[20px] h-5 rounded-full bg-blue-200 dark:bg-blue-500/30 px-1.5 text-[10px] font-bold text-blue-700 dark:text-blue-300">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowSortDropdown(!showSortDropdown);
              }}
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="Sort notifications"
              aria-haspopup="listbox"
              aria-expanded={showSortDropdown}
            >
              <ArrowUpDown className="w-4 h-4" />
              <span className="hidden sm:inline">Sort</span>
            </button>

            <AnimatePresence>
              {showSortDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full right-0 mt-1 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden z-20"
                  role="listbox"
                  aria-label="Sort options"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleSortChange(opt.value)}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                        sortBy === opt.value
                          ? "bg-[#0f55f7]/10 text-[#0f55f7] font-semibold"
                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                      role="option"
                      aria-selected={sortBy === opt.value}
                    >
                      {opt.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-2.5"
      >
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search notifications by title, description, category, employee, course, or batch..."
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:border-[#0f55f7]/30 focus:outline-none focus:ring-2 focus:ring-[#0f55f7]/20 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
            aria-label="Search notifications"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="absolute right-3.5 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-400">
            ⌘K
          </kbd>
        </div>
      </motion.div>

      {/* Category Tabs */}
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="mb-3"
      >
        <CategoryTabs
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
          categoryCounts={categoryCounts}
        />
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_300px]">
        {/* Left: Notification List */}
        <div className="space-y-2.5">
          {/* Status Bar */}
          {!loading && !error && (
            <div className="flex items-center justify-between px-1 text-xs text-slate-400">
              <span>
                Showing{" "}
                <span className="font-semibold text-slate-600 dark:text-slate-300">
                  {filteredNotifications.length}
                </span>{" "}
                notification{filteredNotifications.length !== 1 ? "s" : ""}
                {unreadCount > 0 && (
                  <>
                    {" "}
                    ·{" "}
                    <span className="font-semibold text-[#0f55f7]">
                      {unreadCount}
                    </span>{" "}
                    unread
                  </>
                )}
              </span>
              {activeCategory !== "All" && (
                <button
                  onClick={() => handleCategoryChange("All")}
                  className="flex items-center gap-1 text-[#0f55f7] hover:underline"
                >
                  <X className="w-3 h-3" />
                  Clear filter
                </button>
              )}
            </div>
          )}

          {/* Loading State */}
          {loading && <NotificationSkeleton />}

          {/* Error State */}
          {!loading && error && <ErrorState onRetry={handleRetry} />}

          {/* Empty State */}
          {!loading && !error && paginatedNotifications.length === 0 && (
            <EmptyState hasSearch={searchQuery.length > 0} />
          )}

          {/* Notification List */}
          {!loading && !error && paginatedNotifications.length > 0 && (
            <div className="space-y-2" role="list" aria-label="Notifications">
              <AnimatePresence mode="popLayout">
                {paginatedNotifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onClick={setSelectedNotification}
                    onMarkRead={handleMarkRead}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }).map(
                  (_, idx) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = idx + 1;
                    } else if (currentPage <= 3) {
                      pageNum = idx + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + idx;
                    } else {
                      pageNum = currentPage - 2 + idx;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                          currentPage === pageNum
                            ? "bg-[#0f55f7] text-white shadow-sm"
                            : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                        aria-label={`Page ${pageNum}`}
                        aria-current={
                          currentPage === pageNum ? "page" : undefined
                        }
                      >
                        {pageNum}
                      </button>
                    );
                  },
                )}
              </div>
              <button
                onClick={() =>
                  handlePageChange(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-3">
          {loading ? (
            <>
              <SummarySkeleton />
              <SummarySkeleton />
            </>
          ) : (
            <>
              {/* Summary Card */}
              <SummaryCard
                total={notifications.length}
                unread={unreadCount}
                read={readCount}
                counts={priorityCounts}
              />

              {/* Donut Chart */}
              <DonutChart notifications={notifications} />

              {/* Quick Filters */}
              <QuickFilterCard
                currentFilter={
                  activeQuickFilter !== "All"
                    ? activeQuickFilter
                    : activeCategory
                }
                onFilterChange={handleQuickFilterChange}
              />

              {/* Today / Week Stats */}
              <div className="rounded-xl border border-slate-100 dark:border-slate-700/50 bg-white dark:bg-slate-900/50 p-4 shadow-sm">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                  Timeline
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-800/50 px-3 py-2">
                    <span className="text-sm text-slate-600 dark:text-slate-300">
                      Today
                    </span>
                    <span className="text-sm font-bold text-[#0f55f7]">
                      {todayCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-slate-50 dark:bg-slate-800/50 px-3 py-2">
                    <span className="text-sm text-slate-600 dark:text-slate-300">
                      This Week
                    </span>
                    <span className="text-sm font-bold text-[#0f55f7]">
                      {weekCount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <PreferencesCard />
            </>
          )}
        </div>
      </div>

      {/* Notification Detail Modal */}
      {selectedNotification && (
        <NotificationDetailModal
          notification={selectedNotification}
          onClose={() => setSelectedNotification(null)}
          onMarkRead={handleMarkRead}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
