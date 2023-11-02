import { Router } from 'express';
import asyncWrapper from '../shared/async-wrapper';
import { OrderView } from './order.view';
import { Auth } from '../middleware/authontication';

const orderRoutes = Router();

orderRoutes
  .route('/')
  .post(asyncWrapper(Auth.isCustomer), asyncWrapper(OrderView.createOrder));
orderRoutes
  .route('/customer')
  .get(
    asyncWrapper(Auth.isCustomer),
    asyncWrapper(OrderView.getCustomerManyOrders)
  );
orderRoutes
  .route('/driver/history')
  .get(
    asyncWrapper(Auth.isDriver),
    asyncWrapper(OrderView.getDriverManyOrders)
  );
orderRoutes
  .route('/driver/search')
  .get(
    asyncWrapper(Auth.isDriver),
    asyncWrapper(OrderView.getNearOrderOrdersForDriver)
  );

orderRoutes
  .route('/driver/action/:orderId')
  .put(
    asyncWrapper(Auth.isDriver),
    asyncWrapper(OrderView.drivereActionOnOrder)
  );

orderRoutes
  .route('/customer/confirm/pickup/:orderId')
  .put(asyncWrapper(Auth.isCustomer), asyncWrapper(OrderView.confirmPickUp));

orderRoutes
  .route('/customer/confirm/drop-off/:orderId')
  .put(asyncWrapper(Auth.isCustomer), asyncWrapper(OrderView.confirmDropOff));
orderRoutes
  .route('/driver/counter/:orderId')
  .put(asyncWrapper(Auth.isDriver), asyncWrapper(OrderView.driverCounterOffer));

orderRoutes
  .route('/:orderId')
  .get(asyncWrapper(OrderView.getOrder))
  .delete(asyncWrapper(Auth.isCustomer), asyncWrapper(OrderView.deleteOrder))
  .put(asyncWrapper(Auth.isCustomer), asyncWrapper(OrderView.updateOrder));

export default orderRoutes;
