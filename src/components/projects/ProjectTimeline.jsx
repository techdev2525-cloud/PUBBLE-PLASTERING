// ProjectTimeline Component
import React from "react";
import {
  FiCalendar,
  FiCheck,
  FiClock,
  FiFileText,
  FiTool,
  FiHome,
  FiTruck,
  FiUsers,
  FiCamera,
} from "react-icons/fi";
import { formatDate } from "@/utils/dateFormatter";

export default function ProjectTimeline({
  events = [],
  variant = "vertical", // vertical, horizontal, compact
  showIcons = true,
  className = "",
}) {
  if (!events || events.length === 0) return null;

  const getEventIcon = (type) => {
    const icons = {
      start: FiCalendar,
      quote: FiFileText,
      planning: FiFileText,
      materials: FiTruck,
      work: FiTool,
      progress: FiClock,
      inspection: FiUsers,
      photo: FiCamera,
      complete: FiCheck,
      finished: FiHome,
    };
    return icons[type?.toLowerCase()] || FiClock;
  };

  const variants = {
    vertical: (
      <div className={`relative ${className}`}>
        {events.map((event, index) => {
          const Icon = showIcons ? getEventIcon(event.type) : null;
          const isLast = index === events.length - 1;
          const isCompleted = event.completed !== false;

          return (
            <div key={index} className="relative pl-8 pb-8 last:pb-0">
              {/* Timeline Line */}
              {!isLast && (
                <div className="absolute left-[11px] top-8 w-0.5 h-full bg-concrete-200" />
              )}

              {/* Timeline Dot/Icon */}
              <div
                className={`
                  absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center
                  ${
                    isCompleted
                      ? "bg-primary-500 text-white"
                      : "bg-concrete-200 text-concrete-500"
                  }
                `}
              >
                {Icon && <Icon className="w-3 h-3" />}
              </div>

              {/* Content */}
              <div className="bg-white rounded-lg shadow-sm p-4 ml-4">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h4 className="font-semibold text-concrete-800">
                    {event.title}
                  </h4>
                  {event.date && (
                    <span className="text-sm text-concrete-500 whitespace-nowrap">
                      {formatDate(event.date, "short")}
                    </span>
                  )}
                </div>
                {event.description && (
                  <p className="text-concrete-600 text-sm">
                    {event.description}
                  </p>
                )}
                {event.images && event.images.length > 0 && (
                  <div className="flex gap-2 mt-3">
                    {event.images.slice(0, 3).map((img, i) => (
                      <div
                        key={i}
                        className="w-16 h-16 rounded bg-concrete-100 overflow-hidden"
                      >
                        <img
                          src={img}
                          alt={`${event.title} - ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    {event.images.length > 3 && (
                      <div className="w-16 h-16 rounded bg-concrete-100 flex items-center justify-center text-concrete-500 text-sm">
                        +{event.images.length - 3}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    ),

    horizontal: (
      <div className={`overflow-x-auto ${className}`}>
        <div className="flex gap-4 pb-4" style={{ minWidth: "max-content" }}>
          {events.map((event, index) => {
            const Icon = showIcons ? getEventIcon(event.type) : null;
            const isCompleted = event.completed !== false;

            return (
              <div key={index} className="relative w-64 flex-shrink-0">
                {/* Timeline Line */}
                {index < events.length - 1 && (
                  <div className="absolute top-3 left-6 right-0 h-0.5 bg-concrete-200 -mr-4" />
                )}

                {/* Content Card */}
                <div className="relative">
                  {/* Dot */}
                  <div
                    className={`
                      w-6 h-6 rounded-full flex items-center justify-center mb-4
                      ${
                        isCompleted
                          ? "bg-primary-500 text-white"
                          : "bg-concrete-200 text-concrete-500"
                      }
                    `}
                  >
                    {Icon && <Icon className="w-3 h-3" />}
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-4">
                    {event.date && (
                      <span className="text-xs text-primary-600 font-medium">
                        {formatDate(event.date, "short")}
                      </span>
                    )}
                    <h4 className="font-semibold text-concrete-800 mt-1">
                      {event.title}
                    </h4>
                    {event.description && (
                      <p className="text-concrete-600 text-sm mt-2 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    ),

    compact: (
      <div className={`space-y-3 ${className}`}>
        {events.map((event, index) => {
          const isCompleted = event.completed !== false;

          return (
            <div
              key={index}
              className="flex items-center gap-4 px-4 py-3 bg-white rounded-lg shadow-sm"
            >
              <div
                className={`
                  w-4 h-4 rounded-full flex-shrink-0
                  ${isCompleted ? "bg-primary-500" : "bg-concrete-300"}
                `}
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-concrete-800 truncate">
                  {event.title}
                </h4>
              </div>
              {event.date && (
                <span className="text-sm text-concrete-500 flex-shrink-0">
                  {formatDate(event.date, "short")}
                </span>
              )}
            </div>
          );
        })}
      </div>
    ),
  };

  return variants[variant] || variants.vertical;
}

// Project Status Progress
export function ProjectProgress({ currentStatus, className = "" }) {
  const statuses = [
    { key: "PLANNING", label: "Planning", icon: FiFileText },
    { key: "QUOTED", label: "Quoted", icon: FiFileText },
    { key: "IN_PROGRESS", label: "In Progress", icon: FiTool },
    { key: "COMPLETED", label: "Completed", icon: FiCheck },
  ];

  const currentIndex = statuses.findIndex((s) => s.key === currentStatus);

  return (
    <div className={`bg-white rounded-xl p-6 ${className}`}>
      <h3 className="font-semibold text-concrete-800 mb-6">Project Progress</h3>

      <div className="relative">
        {/* Progress Bar */}
        <div className="absolute top-4 left-0 right-0 h-1 bg-concrete-200">
          <div
            className="h-full bg-primary-500 transition-all duration-500"
            style={{
              width: `${currentIndex >= 0 ? ((currentIndex + 1) / statuses.length) * 100 : 0}%`,
            }}
          />
        </div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {statuses.map((status, index) => {
            const Icon = status.icon;
            const isPast = index < currentIndex;
            const isCurrent = index === currentIndex;
            const isFuture = index > currentIndex;

            return (
              <div key={status.key} className="flex flex-col items-center">
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center mb-2 transition-all
                    ${
                      isPast || isCurrent
                        ? "bg-primary-500 text-white"
                        : "bg-concrete-200 text-concrete-500"
                    }
                    ${isCurrent ? "ring-4 ring-primary-100 scale-110" : ""}
                  `}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span
                  className={`text-sm font-medium ${
                    isCurrent ? "text-primary-600" : "text-concrete-600"
                  }`}
                >
                  {status.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Simple milestone tracker
export function MilestoneTracker({ milestones = [], className = "" }) {
  const completedCount = milestones.filter((m) => m.completed).length;
  const progress =
    milestones.length > 0
      ? Math.round((completedCount / milestones.length) * 100)
      : 0;

  return (
    <div className={`bg-white rounded-xl p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-concrete-800">Milestones</h3>
        <span className="text-sm text-concrete-500">
          {completedCount} of {milestones.length} complete
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-concrete-100 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-primary-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Milestone List */}
      <div className="space-y-3">
        {milestones.map((milestone, index) => (
          <div
            key={index}
            className={`
              flex items-center gap-3 p-3 rounded-lg transition-colors
              ${milestone.completed ? "bg-green-50" : "bg-concrete-50"}
            `}
          >
            <div
              className={`
                w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0
                ${
                  milestone.completed
                    ? "bg-green-500 text-white"
                    : "bg-concrete-200 text-concrete-500"
                }
              `}
            >
              {milestone.completed ? (
                <FiCheck className="w-4 h-4" />
              ) : (
                <span className="text-xs">{index + 1}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4
                className={`font-medium ${
                  milestone.completed ? "text-green-700" : "text-concrete-700"
                }`}
              >
                {milestone.title}
              </h4>
              {milestone.dueDate && !milestone.completed && (
                <span className="text-xs text-concrete-500">
                  Due: {formatDate(milestone.dueDate, "short")}
                </span>
              )}
            </div>
            {milestone.completed && milestone.completedAt && (
              <span className="text-xs text-green-600">
                {formatDate(milestone.completedAt, "short")}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Activity feed / recent updates
export function ProjectActivityFeed({
  activities = [],
  maxItems = 5,
  className = "",
}) {
  const displayActivities = activities.slice(0, maxItems);

  return (
    <div className={`bg-white rounded-xl p-6 ${className}`}>
      <h3 className="font-semibold text-concrete-800 mb-4">Recent Activity</h3>

      <div className="space-y-4">
        {displayActivities.map((activity, index) => (
          <div key={index} className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center">
              {getActivityIcon(activity.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-concrete-700 text-sm">
                {activity.description}
              </p>
              <span className="text-xs text-concrete-400">
                {formatDate(activity.date, "relative")}
              </span>
            </div>
          </div>
        ))}
      </div>

      {activities.length > maxItems && (
        <button className="w-full mt-4 text-center text-sm text-primary-600 hover:underline">
          View all activity
        </button>
      )}
    </div>
  );
}

function getActivityIcon(type) {
  const iconMap = {
    update: <FiClock className="w-4 h-4" />,
    photo: <FiCamera className="w-4 h-4" />,
    document: <FiFileText className="w-4 h-4" />,
    complete: <FiCheck className="w-4 h-4" />,
    default: <FiClock className="w-4 h-4" />,
  };
  return iconMap[type?.toLowerCase()] || iconMap.default;
}
