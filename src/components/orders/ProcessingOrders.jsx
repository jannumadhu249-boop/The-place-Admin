import React from 'react';
import OrderTable from './OrderTable';

export default function ProcessingOrders({ orders, onUpdateStatus }) {
  const processing = orders.filter(o => o.status === 'processing');

  return (
    <div>
      <div className="page-header">
        <div className="page-title-block">
          <h1>Processing & Cooking Orders</h1>
          <p>Dishes currently being crafted and packaged inside partner bistros and cloud kitchens</p>
        </div>
      </div>
      <OrderTable 
        title="Kitchen In-Progress" 
        orders={processing} 
        onUpdateStatus={onUpdateStatus}
        emptyMessage="No orders actively in the kitchen pipeline."
      />
    </div>
  );
}
