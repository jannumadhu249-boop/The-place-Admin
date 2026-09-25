import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import '../../styles/layout.css';

export default function AdminLayout({ user, onLogout, children }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="admin-layout">
      {/* Sidebar handles its own routing internally */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        user={user}
      />

      {/* Main Content Area */}
      <div className="admin-main">
        <Topbar
          user={user}
          onLogout={onLogout}
        />
        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}
