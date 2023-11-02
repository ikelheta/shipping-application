import { Router } from 'express';
import asyncWrapper from '../shared/async-wrapper';
import { CustomerView } from './customer.view';
import { Auth } from '../middleware/authontication';

const customerRoutes = Router();

customerRoutes
  .route('/')
  .get(asyncWrapper(CustomerView.getCustomers))
  .post(asyncWrapper(CustomerView.createCustomer))
  .put(asyncWrapper(Auth.isCustomer), asyncWrapper(CustomerView.updateCustomer))
  .delete(
    asyncWrapper(Auth.isCustomer),
    asyncWrapper(CustomerView.deleteCustomer)
  );

customerRoutes
  .route('/:customerId')
  .get(asyncWrapper(CustomerView.getCustomer));

export default customerRoutes;
