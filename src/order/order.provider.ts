import {
  BadRequestError,
  NotFoundError,
  UnprocessableEntityError,
} from '../shared/app-error';
import { IOrder } from './order.dto';
import OrderEntity from './order.entity';
import mongoose, { QueryOptions } from 'mongoose';
import Joi from 'joi';
import {
  DRIVER_ACTIONS_ON_TRIP,
  NATIONAL_ID_LENGTH,
  ORDER_STATUS,
  PHONE_NUMBER_MIN_LENGTH,
  USER_NAME_LENGTH,
} from '../shared/constant';
import { IDriver } from '../driver/driver.dto';
import { ICustomer } from '../customer/customer.dto';

export class OrderProvider {
  static async create(data: IOrder): Promise<IOrder> {
    const item = await OrderEntity.create(data);
    return item;
  }

  static async findOne(
    filters: object,
    projections: any,
    options: QueryOptions
  ): Promise<IOrder | null> {
    const item = await OrderEntity.findOne(filters, projections, options);
    return item;
  }

  static async findOneWithLean(
    filters: object,
    projections: any,
    options: QueryOptions
  ): Promise<IOrder | null> {
    const item = await OrderEntity.findOne(
      filters,
      projections,
      options
    ).lean();
    return item;
  }

  static async findOneOrThrowError(
    filters: object,
    projections: any,
    options: QueryOptions
  ): Promise<IOrder> {
    const item = await this.findOne(filters, projections, options);
    if (!item) {
      throw new NotFoundError();
    }
    return item;
  }
  static async findOneOrThrowErrorWithLean(
    filters: object,
    projections: any,
    options: QueryOptions
  ): Promise<IOrder> {
    const item = await this.findOneWithLean(filters, projections, options);
    if (!item) {
      throw new NotFoundError();
    }
    return item;
  }
  static async count(filters: object) {
    const count = await OrderEntity.countDocuments(filters);
    return count;
  }

  static async findAll(
    filters: object,
    projections: any,
    options: QueryOptions
  ): Promise<{ rows: IOrder[]; count: number }> {
    const items = await OrderEntity.find(filters, projections, options);
    const count = await this.count(filters);
    return { rows: items, count };
  }

  static async updateOne(filters: object, request: object): Promise<IOrder> {
    const item = await OrderEntity.findOneAndUpdate(filters, request, {
      new: true,
    });
    if (!item) {
      throw new NotFoundError();
    }
    return item;
  }
  static async updateMany(filters: object, request: IOrder) {
    const item = await OrderEntity.updateMany(filters, request);
    return item;
  }

  static async deleteOne(id: string) {
    const item = await OrderEntity.findByIdAndDelete(id);
    if (!item) {
      throw new NotFoundError();
    }

    return item;
  }

  static async deleteMany(filters: object) {
    const item = await OrderEntity.deleteMany(filters);
    return item;
  }

  static validateObjectId(id: string) {
    if (!mongoose.isValidObjectId(id)) {
      return { error: 'Invalid ID!' };
    }
    return {};
  }

  static validateCreateOrderSchema = (order: IOrder) => {
    const schema = Joi.object({
      customerId: Joi.string().trim().required(),
      offerPrice: Joi.number().required(),
      pickUpLocation: Joi.array()
        .items(Joi.number().required())
        .length(2)
        .required(),
      deliveryLocation: Joi.array()
        .items(Joi.number().required())
        .length(2)
        .required(),
      options: Joi.array().items(
        Joi.object({
          name: Joi.string().required(),
          price: Joi.number().required(),
        })
      ),
      item: Joi.object({
        hight: Joi.number().greater(0).required(),
        width: Joi.number().greater(0).required(),
        length: Joi.number().greater(0).required(),
      }).required(),
      deleveryTo: Joi.object({
        name: Joi.string()
          .min(USER_NAME_LENGTH.min)
          .max(USER_NAME_LENGTH.max)
          .required(),
        nationalId: Joi.string().length(NATIONAL_ID_LENGTH).required(),
        phoneNumber: Joi.string().min(PHONE_NUMBER_MIN_LENGTH).required(),
      }).required(),
    });
    const { error } = schema.validate(order);
    if (error) {
      throw new UnprocessableEntityError(error.details[0].message);
    }
    return;
  };

  static validateUpdateOrderSchema = (order: IOrder) => {
    const schema = Joi.object({
      offerPrice: Joi.number(),
      pickUpLocation: Joi.array().items(Joi.number().required()).length(2),
      deliveryLocation: Joi.array().items(Joi.number().required()).length(2),
      options: Joi.array().items(
        Joi.object({
          name: Joi.string().required(),
          price: Joi.number().required(),
        })
      ),
      item: Joi.object({
        hight: Joi.number().greater(0).required(),
        width: Joi.number().greater(0).required(),
        length: Joi.number().greater(0).required(),
      }),
      deleveryTo: Joi.object({
        name: Joi.string().min(USER_NAME_LENGTH.min).max(USER_NAME_LENGTH.max),
        nationalId: Joi.string().length(NATIONAL_ID_LENGTH),
        phoneNumber: Joi.string().min(PHONE_NUMBER_MIN_LENGTH),
      }),
    });
    const { error } = schema.validate(order);
    if (error) {
      throw new UnprocessableEntityError(error.details[0].message);
    }
    return;
  };

  static validateCounterOffer = (body: any) => {
    const schema = Joi.object({
      price: Joi.number().greater(0).required(),
    });
    const { error } = schema.validate(body);
    if (error) {
      throw new UnprocessableEntityError(error.details[0].message);
    }
    return;
  };

  static validateOrderStatus = (body: any) => {
    const schema = Joi.object({
      orderStatus: Joi.string()
        .valid(...Object.values(ORDER_STATUS))
        .required(),
    });
    const { error } = schema.validate(body);
    if (error) {
      throw new UnprocessableEntityError(error.details[0].message);
    }
    return;
  };

  static validateAction = (actionSchema) => {
    const schema = Joi.object({
      action: Joi.string()
        .valid(...Object.values(DRIVER_ACTIONS_ON_TRIP))
        .required(),
    });
    const { error } = schema.validate(actionSchema);
    if (error) {
      throw new UnprocessableEntityError(error.details[0].message);
    }
    return;
  };
  static validateOrderBeforeTakeAction(order: IOrder) {
    if (order.status == ORDER_STATUS.Shipped) {
      throw new BadRequestError('This trip already taken');
    }
    if (order.status == ORDER_STATUS.Delivered) {
      throw new BadRequestError('This trip already delivered');
    }
    if (order.driverId != null) {
      throw new BadRequestError('This trip already has another driver');
    }
  }

  static validateDriverBeforeTakeAction(driver: IDriver) {
    if (driver.onTrip) {
      throw new BadRequestError('You are already on a trip');
    }
    if (!driver.available) {
      throw new BadRequestError(
        'You must change your status to available to take actions on trip'
      );
    }
  }

  static validateOrderBeforePickUp(
    order: IOrder,
    driver: IDriver,
    customer: ICustomer
  ) {
    if (order.status != ORDER_STATUS.OnGoing) {
      throw new BadRequestError('Order status must be ongoing');
    }
    if (String(order.driverId) != String(driver._id)) {
      throw new BadRequestError('This not the driver who accepted the order');
    }
    if (String(order.customerId) != String(customer._id)) {
      throw new BadRequestError(
        'You cant confirm pick up for order that is not yours'
      );
    }
  }
  static validateDriverBeforePickUp(
    order: IOrder,
    driver: IDriver,
    customer: ICustomer
  ) {
    if (String(driver.onTrip) != String(order._id)) {
      throw new BadRequestError('driver is on another trip');
    }

    if (!driver.available) {
      throw new BadRequestError(
        'You are not available now please change your status availabilty'
      );
    }
  }

  static validateOrderBeforeDropOff(
    order: IOrder,
    driver: IDriver,
    customer: ICustomer
  ) {
    if (order.status != ORDER_STATUS.Shipped) {
      throw new BadRequestError('Order status must be Shipped');
    }
    if (String(order.driverId) != String(driver._id)) {
      throw new BadRequestError('This not the driver who accepted the order');
    }
    if (String(order.customerId) != String(customer._id)) {
      throw new BadRequestError(
        'You cant confirm drop off for order that is not yours'
      );
    }
  }

  static validateDriverBeforeDropOff(order: IOrder, driver: IDriver) {
    if (String(driver.onTrip) != String(order._id)) {
      throw new BadRequestError('driver is on another trip');
    }
  }

  static validateOrderBeforeDelete(order: IOrder) {
    if (order.driverId && order.status != ORDER_STATUS.Pending) {
      throw new BadRequestError('can not delete order when its not pendding');
    }
  }
  static validateOrderBeforeUpdate(order: IOrder) {
    if (order.driverId && order.status != ORDER_STATUS.Pending) {
      throw new BadRequestError('can not update order when its not pendding');
    }
  }
  static validateOrderBeforCounterOffer(order: IOrder) {
    if (order.status != ORDER_STATUS.Pending) {
      throw new BadRequestError(
        'can not send counter offer to order that is not pending'
      );
    }
  }

  static validateDriverRate(rate) {
    const schema = Joi.object({
      rate: Joi.number().min(0).max(5),
    });
    const { error } = schema.validate(rate);
    if (error) {
      throw new UnprocessableEntityError(error.details[0].message);
    }
    return;
  }
}
