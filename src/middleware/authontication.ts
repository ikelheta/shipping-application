import * as jwt from 'jsonwebtoken';
import { Response, NextFunction, Request } from 'express';
import { CustomerProvider } from '../customer/customer.provider';
import { DriverProvider } from '../driver/driver.provider';
import redisClient from '../redis';

import { BadRequestError } from '../shared/app-error';
import { IDriver } from '../driver/driver.dto';
import { UnAuthenticatedRequest } from '../custom';
import { ICustomer } from '../customer/customer.dto';
export class Auth {
  static async isDriver(
    req: UnAuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    let token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const payload: any = jwt.verify(
        token,
        process.env.DRIVER_SECRET || 'driverSecret'
      );
      let userData: IDriver | undefined | null;
      redisClient.get(`driver:${payload._id}`).then((cashedDriver) => {
        if (cashedDriver) {
          userData = JSON.parse(cashedDriver);
        }
      });
      if (!userData) {
        userData = await DriverProvider.findOne({ _id: payload._id }, {}, {});
        if (!userData) {
          throw new BadRequestError('Your account was deleted');
        }
        await redisClient.set(
          `driver:${payload._id}`,
          JSON.stringify(userData)
        );
      }
      req.user = userData;
      next();
    } else {
      res.sendStatus(401);
    }
  }

  static async isCustomer(
    req: UnAuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    let token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const payload: any = jwt.verify(
        token,
        process.env.CUSTOMER_SECRETE || 'customerSecret'
      );
      let userData: ICustomer | undefined | null;
      redisClient.get(`customer:${payload._id}`).then((cashedCustomer) => {
        if (cashedCustomer) {
          userData = JSON.parse(cashedCustomer);
        }
      });
      if (!userData) {
        userData = await CustomerProvider.findOne({ _id: payload._id }, {}, {});
        if (!userData) {
          throw new BadRequestError('Your account was deleted');
        }

        await redisClient.set(
          `customer:${payload._id}`,
          JSON.stringify(userData)
        );
      }
      req.user = userData;
      next();
    } else {
      res.sendStatus(401);
    }
  }
}
