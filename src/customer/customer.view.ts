import { Request, Response } from 'express';
import { AppError } from '../shared/app-error';
import { CustomerController } from './customer.controller';
import { AuthenticatedCustomerRequest } from '../custom';
import { HTTP_CODES } from '../shared/status-codes';
export class CustomerView {
  static async createCustomer(req: Request, res: Response) {
    try {
      const customers = await CustomerController.createCustomer(req.body);

      res.status(HTTP_CODES.SUCCESS.CREATE).json({
        data: customers,
      });
    } catch (error: any) {
      throw new AppError(error);
    }
  }

  static async getCustomers(req: Request, res: Response) {
    try {
      const customers = await CustomerController.getCustomers(req.query);

      res.send({
        data: { customers },
      });
    } catch (error: any) {
      throw new AppError(error);
    }
  }

  static async getCustomer(req: Request, res: Response) {
    const { customerId } = req.params;
    try {
      const customers = await CustomerController.getCustomer(customerId);

      res.send({
        data: { customers },
      });
    } catch (error: any) {
      throw new AppError(error);
    }
  }

  static async updateCustomer(
    req: AuthenticatedCustomerRequest,
    res: Response
  ) {
    const { _id } = req.user;
    const request = req.body;
    try {
      const customers = await CustomerController.updateCustomer(_id, request);

      res.send({
        data: { customers },
      });
    } catch (error: any) {
      throw new AppError(error);
    }
  }

  static async deleteCustomer(
    req: AuthenticatedCustomerRequest,
    res: Response
  ) {
    const { _id } = req.user;
    try {
      const customers = await CustomerController.deleteCustomer(_id);

      res.send({
        data: { customers },
      });
    } catch (error: any) {
      throw new AppError(error);
    }
  }
}
