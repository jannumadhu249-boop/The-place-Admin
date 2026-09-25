import React from 'react';
import OrderTable from './OrderTable';

export default function FoodOnTheWayOrders({ orders, onUpdateStatus }) {
  const onTheWay = orders.filter(o => o.status === 'Food on the way');

  return (
    <div>
      <div className="page-header">
        <div className="page-title-block">
          <h1>Food on the Way</h1>
          <p>Dispatched with delivery couriers in active transit to customers</p>
        </div>
      </div>
      <OrderTable 
        title="Live Courier In-Transit" 
        orders={onTheWay} 
        onUpdateStatus={onUpdateStatus}
        emptyMessage="No deliveries currently on the road."
      />
    </div>
  );
}
