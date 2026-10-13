import React, { useState } from 'react';
import EmployeeList from './EmployeeList';
import EmployeeRole from './EmployeeRole';
import AddNewEmployee from './AddNewEmployee';
import Departments from '../departments/Departments';
import { Users, Shield, UserPlus, Building2 } from 'lucide-react';

export default function EmployeeManagement() {
  const [activeTab, setActiveTab] = useState('list');

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
            className={`toolbar-tab-item ${activeTab === 'departments' ? 'active' : ''}`}
            onClick={() => setActiveTab('departments')}
          >
            <Building2 size={15} /> Departments
          </button>
          {/* <button
            type="button"
            className={`toolbar-tab-item ${activeTab === 'add' ? 'active' : ''}`}
            onClick={() => setActiveTab('add')}
          >
            <UserPlus size={15} /> Add New Employee
          </button> */}
        </div>
      </div>

      {activeTab === 'list' && <EmployeeList onNavigateAdd={() => setActiveTab('add')} />}
      {activeTab === 'role' && <EmployeeRole />}
      {activeTab === 'departments' && <Departments />}
      {activeTab === 'add' && <AddNewEmployee onBackToList={() => setActiveTab('list')} />}
    </div>
  );
}
