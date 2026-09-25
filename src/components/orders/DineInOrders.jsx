import React from 'react';
import OrderTable from './OrderTable';

export default function DineInOrders({ orders, onUpdateStatus }) {
  const dineIn = orders.filter(o => o.status === 'Dine in' || o.orderType === 'Dine In');

  return (
    <div>
      <div className="page-header">
        <div className="page-title-block">
          <h1>Dine-In Orders</h1>
          <p>Contactless table QR bookings and on-premise bistro dining orders</p>
        </div>
      </div>
      <OrderTable 
        title="Dine-In Table Orders" 
        orders={dineIn} 
        onUpdateStatus={onUpdateStatus}
        emptyMessage="No active dine-in table orders."
      />
    </div>
  );
}
