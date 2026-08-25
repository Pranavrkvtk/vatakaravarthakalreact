// src/components/pages/DashboardTab.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const DashboardTab = ({ stats, recentPosts, categories, onFilterChange }) => {
  // ✅ Safety: Ensure categories is an array
  const safeCategories = Array.isArray(categories) ? categories : [];
  
  // ✅ Safety: Ensure stats has all required fields
  const safeStats = {
    total: stats?.total || 0,
    published: stats?.published || 0,
    scheduled: stats?.scheduled || 0,
    drafts: stats?.drafts || 0,
    trash: stats?.trash || 0,
  };

  // ✅ Safety: Ensure recentPosts is an array
  const safeRecentPosts = Array.isArray(recentPosts) ? recentPosts.slice(0, 5) : [];

  // Handle stat card click - switch to news tab with filter
  const handleStatClick = (status) => {
    if (onFilterChange) {
      onFilterChange(status);
    } else {
      // Fallback: find and click news tab, then set filter via event
      const newsTab = document.querySelector('[data-tab="news"]');
      if (newsTab) {
        newsTab.click();
        // Dispatch custom event for filter change
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('filterChange', { detail: { status } }));
        }, 100);
      }
    }
  };

  return (
    <div>
      {/* Stats Cards - Now Clickable */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        <StatCard 
          label="Total Posts" 
          value={safeStats.total} 
          color="#4f46e5" 
          onClick={() => handleStatClick('all')}
          icon="📊"
        />
        <StatCard 
          label="Published" 
          value={safeStats.published} 
          color="#16a34a" 
          onClick={() => handleStatClick('published')}
          icon="✅"
        />
        <StatCard 
          label="Scheduled" 
          value={safeStats.scheduled} 
          color="#2563eb" 
          onClick={() => handleStatClick('scheduled')}
          icon="⏳"
        />
        <StatCard 
          label="Drafts" 
          value={safeStats.drafts} 
          color="#d97706" 
          onClick={() => handleStatClick('drafts')}
          icon="📝"
        />
        <StatCard 
          label="Trash" 
          value={safeStats.trash} 
          color="#dc2626" 
          onClick={() => handleStatClick('trash')}
          icon="🗑️"
        />
      </div>

      {/* Two Column Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
        }}
      >
        {/* Recent Posts */}
        <div
          style={{
            background: 'var(--surface)',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid var(--border-light)',
          }}
        >
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 600 }}>
            📝 Recent Posts
          </h3>
          {safeRecentPosts.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px 0' }}>
              No posts yet.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {safeRecentPosts.map((post) => (
                <div
                  key={post.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 12px',
                    background: 'var(--bg-base)',
                    borderRadius: '8px',
                    borderBottom: '1px solid var(--border-light)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onClick={() => {
                    // Navigate to news tab and filter by this post's status
                    handleStatClick(post.status || 'all');
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--primary-soft)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--bg-base)';
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight: 500,
                        color: 'var(--text-primary)',
                        fontSize: '14px',
                      }}
                    >
                      {post.title || 'Untitled'}
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        gap: '12px',
                        marginTop: '4px',
                      }}
                    >
                      <span>{post.category || 'Uncategorized'}</span>
                      <span>
                        {new Date(post.createdAt || post.publishedDate).toLocaleDateString(
                          'en-IN',
                          {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          }
                        )}
                      </span>
                      <span>👁️ {post.views || 0}</span>
                    </div>
                  </div>
                  <span
                    style={{
                      padding: '2px 12px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 600,
                      background:
                        post.status === 'published'
                          ? '#dcfce7'
                          : post.status === 'scheduled'
                          ? '#dbeafe'
                          : post.status === 'trash'
                          ? '#fee2e2'
                          : '#fef3c7',
                      color:
                        post.status === 'published'
                          ? '#16a34a'
                          : post.status === 'scheduled'
                          ? '#2563eb'
                          : post.status === 'trash'
                          ? '#dc2626'
                          : '#d97706',
                    }}
                  >
                    {post.status?.charAt(0).toUpperCase() + post.status?.slice(1) || 'Draft'}
                  </span>
                </div>
              ))}
            </div>
          )}
          <Link
            to="#"
            onClick={() => {
              const newsTab = document.querySelector('[data-tab="news"]');
              if (newsTab) newsTab.click();
            }}
            style={{
              display: 'block',
              textAlign: 'center',
              marginTop: '16px',
              color: 'var(--primary)',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            View All Posts →
          </Link>
        </div>

        {/* Categories */}
        <div
          style={{
            background: 'var(--surface)',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid var(--border-light)',
          }}
        >
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 600 }}>
            📂 Categories
          </h3>
          {safeCategories.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px 0' }}>
              No categories yet.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {safeCategories.map((category, index) => {
                // If category is a string
                if (typeof category === 'string') {
                  return (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 12px',
                        background: 'var(--bg-base)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onClick={() => {
                        // Filter by this category
                        if (onFilterChange) {
                          onFilterChange('all', category);
                        }
                        // Navigate to categories tab
                        const categoriesTab = document.querySelector('[data-tab="categories"]');
                        if (categoriesTab) categoriesTab.click();
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--primary-soft)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'var(--bg-base)';
                      }}
                    >
                      <span style={{ color: 'var(--text-primary)' }}>{category}</span>
                      <span
                        style={{
                          fontSize: '12px',
                          color: 'var(--text-secondary)',
                          background: 'var(--border-light)',
                          padding: '2px 10px',
                          borderRadius: '12px',
                        }}
                      >
                        0
                      </span>
                    </div>
                  );
                }

                // If category is an object
                if (typeof category === 'object' && category !== null) {
                  const categoryName = category.name || 'Unnamed';
                  const categoryCount = category.count || 0;
                  
                  return (
                    <div
                      key={category.id || categoryName || index}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 12px',
                        background: 'var(--bg-base)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onClick={() => {
                        // Filter by this category
                        if (onFilterChange) {
                          onFilterChange('all', categoryName);
                        }
                        // Navigate to news tab with category filter
                        const newsTab = document.querySelector('[data-tab="news"]');
                        if (newsTab) {
                          newsTab.click();
                          setTimeout(() => {
                            window.dispatchEvent(new CustomEvent('filterChange', { 
                              detail: { status: 'all', category: categoryName } 
                            }));
                          }, 100);
                        }
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--primary-soft)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'var(--bg-base)';
                      }}
                    >
                      <span style={{ color: 'var(--text-primary)' }}>{categoryName}</span>
                      <span
                        style={{
                          fontSize: '12px',
                          color: 'var(--text-secondary)',
                          background: 'var(--border-light)',
                          padding: '2px 10px',
                          borderRadius: '12px',
                        }}
                      >
                        {categoryCount}
                      </span>
                    </div>
                  );
                }

                return null;
              })}
            </div>
          )}
          <Link
            to="#"
            onClick={() => {
              const categoriesTab = document.querySelector('[data-tab="categories"]');
              if (categoriesTab) categoriesTab.click();
            }}
            style={{
              display: 'block',
              textAlign: 'center',
              marginTop: '16px',
              color: 'var(--primary)',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            Manage Categories →
          </Link>
        </div>
      </div>
    </div>
  );
};

// ---------- Stat Card Component ----------
const StatCard = ({ label, value, color, onClick, icon }) => (
  <div
    onClick={onClick}
    style={{
      background: 'var(--surface)',
      padding: '20px',
      borderRadius: '12px',
      border: '1px solid var(--border-light)',
      textAlign: 'center',
      transition: 'all 0.2s',
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
      e.currentTarget.style.borderColor = color;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
      e.currentTarget.style.borderColor = 'var(--border-light)';
    }}
  >
    <div
      style={{
        fontSize: '24px',
        marginBottom: '4px',
      }}
    >
      {icon}
    </div>
    <div
      style={{
        fontSize: '28px',
        fontWeight: 700,
        color: color,
        marginBottom: '4px',
      }}
    >
      {value}
    </div>
    <div
      style={{
        fontSize: '14px',
        color: 'var(--text-secondary)',
        fontWeight: 500,
      }}
    >
      {label}
    </div>
    <div
      style={{
        fontSize: '11px',
        color: 'var(--text-secondary)',
        opacity: 0.6,
        marginTop: '6px',
      }}
    >
      Click to filter
    </div>
  </div>
);

export default DashboardTab;