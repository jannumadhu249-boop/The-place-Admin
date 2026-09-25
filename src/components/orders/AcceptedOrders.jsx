import React from 'react';
import OrderTable from './OrderTable';

export default function AcceptedOrders({ orders, onUpdateStatus }) {
  const accepted = orders.filter(o => o.status === 'accepted');

  return (
    <div>
      <div className="page-header">
        <div className="page-title-block">
          <h1>Accepted Orders</h1>
          <p>Confirmed by restaurant kitchens, preparing to queue for chef prep</p>
        </div>
      </div>
      <OrderTable 
        title="Accepted Orders" 
        orders={accepted} 
        onUpdateStatus={onUpdateStatus}
        emptyMessage="No accepted orders at the moment."
      />
    </div>
  );
}
