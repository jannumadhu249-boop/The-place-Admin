import React from 'react';
import OrderTable from './OrderTable';

export default function ScheduledOrders({ orders, onUpdateStatus }) {
  const scheduled = orders.filter(o => o.status === 'Scheduled');

  return (
    <div>
      <div className="page-header">
        <div className="page-title-block">
          <h1>Scheduled Pre-Orders</h1>
          <p>Advance culinary bookings scheduled for specified time slots and events</p>
        </div>
      </div>
      <OrderTable 
        title="Scheduled Orders" 
        orders={scheduled} 
        onUpdateStatus={onUpdateStatus}
        emptyMessage="No scheduled orders currently pending."
      />
    </div>
  );
}
