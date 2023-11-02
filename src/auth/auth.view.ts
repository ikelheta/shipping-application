import { Request, Response } from 'express';
import { AppError } from '../shared/app-error';
import { AuthController } from './auth.controller';
export class AuthView {
  static async customerToken(req: Request, res: Response) {
    try {
      const data = await AuthController.customerToken(req.body);

      res.send({
        data: data,
      });
    } catch (error: any) {
      throw new AppError(error);
    }
  }

  static async driverToken(req: Request, res: Response) {
    try {
      const data = await AuthController.driverToken(req.body);

      res.send({
        data: data,
      });
    } catch (error: any) {
      throw new AppError(error);
    }
  }
}
