import React, { useState } from 'react';
import EmployeeList from './EmployeeList';
import EmployeeRole from './EmployeeRole';
import AddNewEmployee from './AddNewEmployee';
import { Users, Shield, UserPlus } from 'lucide-react';

export default function EmployeeManagement() {
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'role' | 'add'

  return (
    <div>
      {/* Tab Switcher */}
      <div className="card-container" style={{ marginBottom: 20 }}>
        <div className="toolbar-tabs" style={{ padding: '8px 16px' }}>
          <button
            type="button"
            className={`toolbar-tab-item ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => setActiveTab('list')}
          >
            <Users size={15} /> Employee Directory
          </button>
          <button
            type="button"
            className={`toolbar-tab-item ${activeTab === 'role' ? 'active' : ''}`}
            onClick={() => setActiveTab('role')}
          >
            <Shield size={15} /> Employee Roles & Permissions
          </button>
          <button
            type="button"
            className={`toolbar-tab-item ${activeTab === 'add' ? 'active' : ''}`}
            onClick={() => setActiveTab('add')}
          >
            <UserPlus size={15} /> Add New Employee
          </button>
        </div>
      </div>

      {activeTab === 'list' && <EmployeeList onNavigateAdd={() => setActiveTab('add')} />}
      {activeTab === 'role' && <EmployeeRole />}
      {activeTab === 'add' && <AddNewEmployee onBackToList={() => setActiveTab('list')} />}
    </div>
  );
}
