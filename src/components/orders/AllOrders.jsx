import React from 'react';
import OrderTable from './OrderTable';

export default function AllOrders({ orders, onUpdateStatus }) {
  return (
    <div>
      <div className="page-header">
        <div className="page-title-block">
          <h1>All Food Orders</h1>
          <p>Complete operational log across all restaurant kitchens and delivery statuses</p>
        </div>
      </div>
      <OrderTable 
        title="Master Orders Roster" 
        orders={orders} 
        onUpdateStatus={onUpdateStatus}
      />
    </div>
  );
}
