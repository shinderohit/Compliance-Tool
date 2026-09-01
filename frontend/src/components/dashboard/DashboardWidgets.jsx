function WidgetList({ title, items = [], emptyText, renderItem }) {
  return (
    <section className="rounded-xl border border-[#CBCBD4] bg-white px-4 py-3">
      <h2 className="mb-3 text-lg font-bold">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-[#18206F]/60">{emptyText}</p>
      ) : (
        <div className="space-y-2">
          {items.slice(0, 6).map((item, index) => (
            <div
              key={item.id || `${title}-${index}`}
              className="rounded-lg bg-[#18206F]/5 px-3 py-2 text-sm"
            >
              {renderItem(item)}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function formatDate(date) {
  return date ? new Date(date).toLocaleDateString() : "-";
}

export default function DashboardWidgets({ widgets = {} }) {
  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-4">
      <WidgetList
        title="Today's Tasks"
        items={widgets.todayTasks || []}
        emptyText="No compliance tasks due today."
        renderItem={(item) => (
          <>
            <p className="font-semibold">{item.title}</p>
            <p className="text-[#18206F]/60">
              {item.department} | {item.status}
            </p>
          </>
        )}
      />
      <WidgetList
        title="Upcoming Renewals"
        items={widgets.upcomingRenewals || []}
        emptyText="No renewals in the next 30 days."
        renderItem={(item) => (
          <>
            <p className="font-semibold">{item.title}</p>
            <p className="text-[#18206F]/60">
              Expires {formatDate(item.expiryDate)} | {item.risk}
            </p>
          </>
        )}
      />
      <WidgetList
        title="Recent Uploads"
        items={widgets.recentUploads || []}
        emptyText="No uploads yet."
        renderItem={(item) => (
          <>
            <p className="font-semibold">{item.title}</p>
            <p className="text-[#18206F]/60">
              {item.riskLevel || "Low"} risk | {formatDate(item.createdAt)}
            </p>
          </>
        )}
      />
      <WidgetList
        title="AI Alerts"
        items={widgets.aiAlerts || []}
        emptyText="No AI alerts."
        renderItem={(item) => (
          <>
            <p className="font-semibold">{item.title}</p>
            <p className="text-[#18206F]/60">{item.message}</p>
          </>
        )}
      />
      <WidgetList
        title="Notifications"
        items={widgets.notifications || []}
        emptyText="No notifications."
        renderItem={(item) => (
          <>
            <p className="font-semibold">{item.title}</p>
            <p className="text-[#18206F]/60">{item.message}</p>
          </>
        )}
      />
      <WidgetList
        title="Department Ranking"
        items={widgets.departmentRanking || []}
        emptyText="No department data yet."
        renderItem={(item) => (
          <>
            <p className="font-semibold">{item.department}</p>
            <p className="text-[#18206F]/60">
              {item.score}% completed | {item.total} total
            </p>
          </>
        )}
      />
      <WidgetList
        title="Top Risks"
        items={widgets.topRisks || []}
        emptyText="No high risks found."
        renderItem={(item) => (
          <>
            <p className="font-semibold">{item.title}</p>
            <p className="text-[#18206F]/60">
              {item.risk} | {item.status} | {item.department}
            </p>
          </>
        )}
      />
      <WidgetList
        title="Recent Activities"
        items={widgets.recentActivities || []}
        emptyText="No recent activity."
        renderItem={(item) => (
          <>
            <p className="font-semibold">{item.type || "Activity"}</p>
            <p className="text-[#18206F]/60">{item.description}</p>
          </>
        )}
      />
    </div>
  );
}
