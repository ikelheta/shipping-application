import { NotFoundError, UnprocessableEntityError } from '../shared/app-error';
import { ICustomer } from './customer.dto';
import CustomerEntity from './customer.entity';
import mongoose, { QueryOptions } from 'mongoose';
import Joi from 'joi';
import {
  NATIONAL_ID_LENGTH,
  PASSWORD_MIN_LENGTH,
  PHONE_NUMBER_MIN_LENGTH,
  USER_NAME_LENGTH,
} from '../shared/constant';
import redisClient from '../redis';

export class CustomerProvider {
  static async create(data: ICustomer): Promise<ICustomer> {
    const item = await CustomerEntity.create(data);
    await redisClient.set(`customer:${item._id}`, JSON.stringify(item));
    return item;
  }

  static async findOne(
    filters: object,
    projections: any,
    options: QueryOptions
  ): Promise<ICustomer | null> {
    const item = await CustomerEntity.findOne(filters, projections, options);
    return item;
  }

  static async findOneWithLean(
    filters: object,
    projections: any,
    options: QueryOptions
  ): Promise<ICustomer | null> {
    const item = await CustomerEntity.findOne(
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
  ): Promise<ICustomer | null> {
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
  ): Promise<ICustomer | null> {
    const item = await this.findOneWithLean(filters, projections, options);
    if (!item) {
      throw new NotFoundError();
    }
    return item;
  }
  static async count(filters: object): Promise<number> {
    const count = await CustomerEntity.countDocuments(filters);
    return count;
  }

  static async findAll(
    filters: object,
    projections: any,
    options: QueryOptions
  ): Promise<{ rows: ICustomer[] | null; count: number }> {
    const items = await CustomerEntity.find(filters, projections, options);
    const count = await this.count(filters);
    return { rows: items, count };
  }

  static async updateOne(
    filters: object,
    request: object
  ): Promise<ICustomer | null> {
    const item = await CustomerEntity.findOneAndUpdate(filters, request, {
      new: true,
    });
    if (!item) {
      throw new NotFoundError();
    }
    await redisClient.set(`customer:${item._id}`, JSON.stringify(item));
    return item;
  }
  static async updateMany(filters: object, request: object) {
    const item = await CustomerEntity.updateMany(filters, request);
    return item;
  }

  static async deleteOneById(_id: string) {
    const item = await CustomerEntity.findByIdAndDelete(_id);
    redisClient.del(`customer:${_id}`).then((replay) => {
      if (replay == 1) {
        console.log(`customer ${_id} deleted from cach` );
      }
    });
    if (!item) {
      throw new NotFoundError();
    }

    return item;
  }

 

  static validateObjectId(id: any) {
    if (!mongoose.isValidObjectId(id)) {
      return { error: 'Invalid ID!' };
    }
    return {};
  }

  static validateCreateCustomerSchema = (customer: ICustomer) => {
    const schema = Joi.object({
      email: Joi.string().trim().required().email(),
      phoneNumber: Joi.string().min(PHONE_NUMBER_MIN_LENGTH).required(),
      username: Joi.string()
        .min(USER_NAME_LENGTH.min)
        .max(USER_NAME_LENGTH.max)
        .required(),
      nationalId: Joi.string().length(NATIONAL_ID_LENGTH).required(),
      password: Joi.string().min(PASSWORD_MIN_LENGTH).required(),
      image: Joi.string(),
      address: Joi.string().required(),
    });
    const { error } = schema.validate(customer);
    if (error) {
      throw new UnprocessableEntityError(error.details[0].message);
    }
    return;
  };

  static validateUpdateCustomerSchema = (customer: ICustomer) => {
    const schema = Joi.object({
      email: Joi.string().trim().email(),
      phoneNumber: Joi.string().min(PHONE_NUMBER_MIN_LENGTH),
      username: Joi.string()
        .min(USER_NAME_LENGTH.min)
        .max(USER_NAME_LENGTH.max),
      nationalId: Joi.string().length(NATIONAL_ID_LENGTH),
      password: Joi.string().min(PASSWORD_MIN_LENGTH),
      image: Joi.string(),
      address: Joi.string(),
    });
    const { error } = schema.validate(customer);
    if (error) {
      throw new UnprocessableEntityError(error.details[0].message);
    }
    return;
  };
}
