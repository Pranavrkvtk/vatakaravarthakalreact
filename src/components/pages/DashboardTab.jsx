// src/components/pages/DashboardTab.jsx
import React from "react";

const STATUS_STYLES = {
  published: { bg: "#dcfce7", color: "#16a34a" },
  draft: { bg: "#fef3c7", color: "#d97706" },
  scheduled: { bg: "#dbeafe", color: "#2563eb" },
  trash: { bg: "#fee2e2", color: "#dc2626" },
};

const StatusBadge = ({ status }) => {
  const s = status || "draft";
  const style = STATUS_STYLES[s] || STATUS_STYLES.draft;
  return (
    <span
      style={{
        background: style.bg,
        color: style.color,
        padding: "4px 12px",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
        display: "inline-block",
      }}
    >
      {s.charAt(0).toUpperCase() + s.slice(1)}
    </span>
  );
};

export default function DashboardTab({ stats, recentPosts = [], categories = [] }) {
  const formatNumber = (num) => num?.toLocaleString() || 0;

  const kpis = [
    { label: "Total Posts", value: stats.total, icon: "📄", bg: "#eef2ff", color: "#4f46e5" },
    { label: "Published", value: stats.published, icon: "✅", bg: "#dcfce7", color: "#16a34a" },
    { label: "Scheduled", value: stats.scheduled, icon: "🗓️", bg: "#dbeafe", color: "#2563eb" },
    { label: "Drafts", value: stats.drafts, icon: "✏️", bg: "#fef3c7", color: "#d97706" },
    { label: "Trash", value: stats.trash, icon: "🗑️", bg: "#fee2e2", color: "#dc2626" },
  ];

  const totalViews = recentPosts.reduce((sum, p) => sum + (p.views || 0), 0);
  const totalLikes = recentPosts.reduce((sum, p) => sum + (p.likes || 0), 0);

  // Build category data (from props or derive)
  const categoryCounts = categories.length
    ? categories.map(c => ({ name: c.name, count: c.count || 0 }))
    : recentPosts.reduce((acc, p) => {
        const cat = p.category || "Uncategorized";
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {});

  const categoryData = Object.entries(categoryCounts).map(([name, count]) => ({ name, count }));
  const maxCount = Math.max(...categoryData.map(c => c.count), 1);
  const latestPosts = recentPosts.slice(0, 5);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 20 }}>
        {kpis.map((k, i) => (
          <div
            key={i}
            style={{
              background: "var(--surface)",
              borderRadius: 16,
              padding: "20px 24px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
              border: "1px solid var(--border-light)",
              display: "flex",
              alignItems: "center",
              gap: 16,
              transition: "transform 0.2s, box-shadow 0.2s",
              cursor: "default",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.04)";
            }}
          >
            <div style={{ width: 48, height: 48, borderRadius: 12, background: k.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>
              {k.icon}
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.2 }}>
                {formatNumber(k.value)}
              </div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, background: "var(--surface)", padding: "20px 24px", borderRadius: 16, border: "1px solid var(--border-light)", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
        <div><div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Total Views</div><div style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)" }}>{formatNumber(totalViews)}</div></div>
        <div><div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Total Likes</div><div style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)" }}>{formatNumber(totalLikes)}</div></div>
        <div><div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Categories</div><div style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)" }}>{categoryData.length}</div></div>
        <div><div style={{ fontSize: 13, color: "var(--text-secondary)" }}>Active Posts</div><div style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)" }}>{stats.published || 0}</div></div>
      </div>

      {/* Category distribution + Recent posts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 24, alignItems: "start" }}>
        <div style={{ background: "var(--surface)", borderRadius: 16, padding: "20px 24px", border: "1px solid var(--border-light)", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>📊 Category Distribution</h3>
          {categoryData.length === 0 ? (
            <p style={{ color: "var(--text-secondary)", fontSize: 14, textAlign: "center", padding: "20px 0" }}>No categories yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {categoryData.map((item, idx) => {
                const percent = (item.count / maxCount) * 100;
                const hue = (idx * 37 + 200) % 360;
                return (
                  <div key={item.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ width: 80, fontSize: 13, color: "var(--text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</span>
                    <div style={{ flex: 1, height: 8, background: "#e2e8f0", borderRadius: 20, overflow: "hidden" }}>
                      <div style={{ width: `${Math.max(percent, 2)}%`, height: "100%", borderRadius: 20, background: `hsl(${hue}, 70%, 55%)`, transition: "width 0.6s ease" }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, minWidth: 32, textAlign: "right" }}>{item.count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ background: "var(--surface)", borderRadius: 16, padding: "20px 24px", border: "1px solid var(--border-light)", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>📰 Recent Posts</h3>
          {latestPosts.length === 0 ? (
            <p style={{ color: "var(--text-secondary)", fontSize: 14, textAlign: "center", padding: "20px 0" }}>No posts yet.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {latestPosts.map((post) => (
                <li key={post.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border-light)" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2, overflow: "hidden" }}>
                    <span style={{ fontWeight: 500, fontSize: 14, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{post.title}</span>
                    <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                      {new Date(post.publishedDate || post.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <StatusBadge status={post.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}