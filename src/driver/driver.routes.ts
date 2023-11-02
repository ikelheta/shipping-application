import { Router } from 'express';
import asyncWrapper from '../shared/async-wrapper';
import { DriverView } from './driver.view';
import { Auth } from '../middleware/authontication';

const driverrRoutes = Router();

driverrRoutes
  .route('/')
  .get(asyncWrapper(DriverView.getDrivers))
  .post(asyncWrapper(DriverView.createDriver))
  .put(asyncWrapper(Auth.isDriver), asyncWrapper(DriverView.updateDriver))
  .delete(asyncWrapper(Auth.isDriver), asyncWrapper(DriverView.deleteDriver));

driverrRoutes
  .route('/qrcode')
  .get(asyncWrapper(Auth.isDriver), asyncWrapper(DriverView.getYourQrCode));
driverrRoutes.route('/:driverId').get(asyncWrapper(DriverView.getDriver));

export default driverrRoutes;
