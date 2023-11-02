import { Request, Response } from 'express';
import { AppError } from '../shared/app-error';
import { DriverController } from './driver.controller';
import { AuthenticatedDriverRequest } from '../custom';
import { HTTP_CODES } from '../shared/status-codes';
export class DriverView {
  static async createDriver(req: Request, res: Response) {
    try {
      const driver = await DriverController.createDriver(req.body);

      res.status(HTTP_CODES.SUCCESS.CREATE).json({
        data: driver,
      });
    } catch (error: any) {
      throw new AppError(error);
    }
  }

  static async getDrivers(req: Request, res: Response) {
    try {
      const drivers = await DriverController.getDrivers(req.query);

      res.send({
        data: { drivers },
      });
    } catch (error: any) {
      throw new AppError(error);
    }
  }

  static async getDriver(req: Request, res: Response) {
    const { driverId } = req.params;
    try {
      const driver = await DriverController.getDriver(driverId);

      res.send({
        data: { driver },
      });
    } catch (error: any) {
      throw new AppError(error);
    }
  }

  static async updateDriver(req: AuthenticatedDriverRequest, res: Response) {
    const { _id } = req.user;
    const request = req.body;
    try {
      const driver = await DriverController.updateDriver(_id, request);

      res.send({
        data: { driver },
      });
    } catch (error: any) {
      throw new AppError(error);
    }
  }

  static async deleteDriver(req: AuthenticatedDriverRequest, res: Response) {
    const { _id } = req.user;
    try {
      const driver = await DriverController.deleteDriver(_id);

      res.send({
        data: { driver },
      });
    } catch (error: any) {
      throw new AppError(error);
    }
  }
  static async getYourQrCode(req: AuthenticatedDriverRequest, res: Response) {
    const { _id } = req.user;
    try {
      const url = await DriverController.getQrCode(_id);
      res.send({
        data: url,
      });
    } catch (error: any) {
      throw new AppError(error);
    }
  }
}
