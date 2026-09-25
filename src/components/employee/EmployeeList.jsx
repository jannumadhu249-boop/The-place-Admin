import React, { useState } from 'react';
import { Search, Plus, Mail, Phone, Edit2, Trash2, Shield } from 'lucide-react';
import { employeesListData } from '../../data/mockData';
import EditEmployeeModal from './EditEmployeeModal';

export default function EmployeeList({ onNavigateAdd }) {
  const [employees, setEmployees] = useState(employeesListData);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingEmployee, setEditingEmployee] = useState(null);

  const toggleStatus = (id) => {
    setEmployees(employees.map(emp => {
      if (emp.id === id) {
        return { ...emp, status: emp.status === 'Active' ? 'Inactive' : 'Active' };
      }
      return emp;
    }));
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to remove this employee account?")) {
      setEmployees(employees.filter(e => e.id !== id));
    }
  };

  const handleSaveEmployee = (updated) => {
    setEmployees(employees.map(e => e.id === updated.id ? updated : e));
    setEditingEmployee(null);
  };

  const filtered = employees.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div className="page-title-block">
          <h1>Employee Directory</h1>
          <p>Active corporate administrators, operational dispatchers, and support personnel</p>
        </div>
        <div className="page-actions-block">
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={onNavigateAdd}
          >
            <Plus size={16} /> Add New Employee
          </button>
        </div>
      </div>

      <div className="card-container">
        <div className="card-header">
          <div>
            <h3>All Staff Members ({filtered.length})</h3>
            <p style={{ fontSize: 12.5, color: '#64748b', marginTop: 2 }}>
              Manage access permissions and internal personnel profiles
            </p>
          </div>

          <div className="card-header-actions">
            <div className="topbar-search-box" style={{ width: 260, padding: '6px 12px' }}>
              <Search size={15} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search name, role, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Assigned Role</th>
                <th>Department</th>
                <th>Contact Info</th>
                <th>Joined Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp) => (
                <tr key={emp.id}>
                  <td>
                    <div className="table-entity-cell">
                      <img 
                        src={emp.avatar} 
                        alt={emp.name} 
                        className="entity-thumb"
                        style={{ borderRadius: '50%' }} 
                      />
                      <div className="entity-info">
                        <h5>{emp.name}</h5>
                        <p>{emp.id}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: 6,
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#0f172a'
                    }}>
                      <Shield size={14} color="#be123c" /> {emp.role}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: 13, color: '#475569' }}>{emp.department}</span>
                  </td>
                  <td>
                    <div style={{ fontSize: 12.5, color: '#0f172a' }}>{emp.email}</div>
                    <div style={{ fontSize: 11.5, color: '#64748b' }}>{emp.phone}</div>
                  </td>
                  <td>
                    <span style={{ fontSize: 12.5, color: '#64748b' }}>{emp.joinedDate}</span>
                  </td>
                  <td>
                    <label className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={emp.status === 'Active'}
                        onChange={() => toggleStatus(emp.id)}
                      />
                      <span className="slider"></span>
                    </label>
                    <span style={{ 
                      marginLeft: 8, 
                      fontSize: 12, 
                      fontWeight: 600, 
                      color: emp.status === 'Active' ? '#16a34a' : '#dc2626' 
                    }}>
                      {emp.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', gap: 6 }}>
                      <button 
                        type="button" 
                        className="btn-icon"
                        title="Edit Employee Profile"
                        onClick={() => setEditingEmployee(emp)}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        type="button" 
                        className="btn-icon"
                        title="Delete Employee"
                        onClick={() => handleDelete(emp.id)}
                        style={{ color: '#ef4444' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Employee Modal - Separate Component */}
      <EditEmployeeModal
        employee={editingEmployee}
        isOpen={Boolean(editingEmployee)}
        onClose={() => setEditingEmployee(null)}
        onSave={handleSaveEmployee}
      />
    </div>
  );
}
