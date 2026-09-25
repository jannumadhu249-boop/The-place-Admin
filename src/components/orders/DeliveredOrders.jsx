import React from 'react';
import OrderTable from './OrderTable';

export default function DeliveredOrders({ orders, onUpdateStatus }) {
  const delivered = orders.filter(o => o.status === 'Delivered');

  return (
    <div>
      <div className="page-header">
        <div className="page-title-block">
          <h1>Delivered Orders</h1>
          <p>Successfully completed deliveries verified with recipient confirmation</p>
        </div>
      </div>
      <OrderTable 
        title="Completed Deliveries" 
        orders={delivered} 
        onUpdateStatus={onUpdateStatus}
        emptyMessage="No completed orders found."
      />
    </div>
  );
}
