import React from 'react';
import OrderTable from './OrderTable';

export default function PendingOrders({ orders, onUpdateStatus }) {
  const pending = orders.filter(o => o.status === 'pending');

  return (
    <div>
      <div className="page-header">
        <div className="page-title-block">
          <h1>Pending Orders</h1>
          <p>Newly incoming customer orders awaiting restaurant merchant acceptance</p>
        </div>
      </div>
      <OrderTable 
        title="Pending Kitchen Acceptance" 
        orders={pending} 
        onUpdateStatus={onUpdateStatus}
        emptyMessage="No pending orders awaiting acceptance."
      />
    </div>
  );
}
