import { Request, Response } from 'express';
import { AppError } from '../shared/app-error';
import { OrderController } from './order.controller';
import {
  AuthenticatedCustomerRequest,
  AuthenticatedDriverRequest,
} from '../custom';
import { HTTP_CODES } from '../shared/status-codes';
export class OrderView {
  static async createOrder(req: AuthenticatedCustomerRequest, res: Response) {
    req.body.customerId = req.user._id;
    try {
      const order = await OrderController.createOrder(req.body);

      res.status(HTTP_CODES.SUCCESS.CREATE).json({
        data: order,
      });
    } catch (error: any) {
      throw new AppError(error);
    }
  }

  static async getCustomerManyOrders(
    req: AuthenticatedCustomerRequest,
    res: Response
  ) {
    try {
      const orders = await OrderController.getCustomerManyOrders(
        req.query,
        req.user
      );

      res.send({
        data: { orders },
      });
    } catch (error: any) {
      throw new AppError(error);
    }
  }

  static async getDriverManyOrders(
    req: AuthenticatedDriverRequest,
    res: Response
  ) {
    try {
      const orders = await OrderController.getDriverPreviousOrders(
        req.query,
        req.user
      );

      res.send({
        data: { orders },
      });
    } catch (error: any) {
      throw new AppError(error);
    }
  }

  static async getNearOrderOrdersForDriver(
    req: AuthenticatedDriverRequest,
    res: Response
  ) {
    try {
      const orders = await OrderController.getNearOrderOrdersForDriver(
        req.query,
        req.user
      );

      res.send({
        data: { orders },
      });
    } catch (error: any) {
      throw new AppError(error);
    }
  }

  static async getOrder(req: Request, res: Response) {
    const { orderId } = req.params;
    try {
      const orders = await OrderController.getOrder(orderId);

      res.send({
        data: { orders },
      });
    } catch (error: any) {
      throw new AppError(error);
    }
  }

  static async updateOrder(req: AuthenticatedCustomerRequest, res: Response) {
    const { orderId } = req.params;
    const request = req.body;
    try {
      const orders = await OrderController.updateOrder(
        orderId,
        request,
        req.user
      );

      res.send({
        data: { orders },
      });
    } catch (error: any) {
      throw new AppError(error);
    }
  }

  static async deleteOrder(req: AuthenticatedCustomerRequest, res: Response) {
    const { orderId } = req.params;
    try {
      const order = await OrderController.deleteOrder(orderId, req.user);

      res.send({
        data: { order },
      });
    } catch (error: any) {
      throw new AppError(error);
    }
  }
  static async drivereActionOnOrder(
    req: AuthenticatedDriverRequest,
    res: Response
  ) {
    const { orderId } = req.params;
    const { action } = req.body;

    try {
      const order = await OrderController.drivereActionOnOrder(
        orderId,
        action,
        req.user
      );

      res.send({
        data: { order },
      });
    } catch (error: any) {
      throw new AppError(error);
    }
  }
  static async driverCounterOffer(
    req: AuthenticatedDriverRequest,
    res: Response
  ) {
    const { _id } = req.user;
    const { orderId } = req.params;
    try {
      const order = await OrderController.counterOffer(orderId, _id, req.body);

      res.send({
        data: { order },
      });
    } catch (error: any) {
      throw new AppError(error);
    }
  }

  static async confirmPickUp(req: AuthenticatedCustomerRequest, res: Response) {
    const { orderId } = req.params;
    const { driverId } = req.body;
    try {
      const order = await OrderController.confirmPickUp(
        orderId,
        req.user,
        driverId
      );

      res.send({
        data: { order },
      });
    } catch (error: any) {
      throw new AppError(error);
    }
  }

  static async confirmDropOff(
    req: AuthenticatedCustomerRequest,
    res: Response
  ) {
    const { orderId } = req.params;
    const { driverId, driverRate } = req.body;
    try {
      const order = await OrderController.confirmDropOff(
        orderId,
        req.user,
        driverId,
        driverRate
      );

      res.send({
        data: { order },
      });
    } catch (error: any) {
      throw new AppError(error);
    }
  }
}
