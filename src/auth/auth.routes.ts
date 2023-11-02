import { Router } from 'express';
import asyncWrapper from '../shared/async-wrapper';
import { AuthView } from './auth.view';

const authRoutes = Router();

authRoutes.route('/customer').post(asyncWrapper(AuthView.customerToken));

authRoutes.route('/driver').post(asyncWrapper(AuthView.driverToken));

export default authRoutes;
