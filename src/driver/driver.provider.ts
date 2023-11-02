import { NotFoundError, UnprocessableEntityError } from '../shared/app-error';
import { IDriver } from './driver.dto';
import DriverEntity from './driver.entity';
import mongoose, { QueryOptions } from 'mongoose';
import Joi from 'joi';
import {
  NATIONAL_ID_LENGTH,
  PASSWORD_MIN_LENGTH,
  PHONE_NUMBER_MIN_LENGTH,
  USER_NAME_LENGTH,
} from '../shared/constant';
import redisClient from '../redis';

export class DriverProvider {
  static async create(data: IDriver): Promise<IDriver> {
    const item = await DriverEntity.create(data);

    return item;
  }

  static async findOne(
    filters: object,
    projections: any,
    options: QueryOptions
  ): Promise<IDriver | null> {
    const item = await DriverEntity.findOne(filters, projections, options);
    return item;
  }

  static async findOneWithLean(
    filters: object,
    projections: any,
    options: QueryOptions
  ): Promise<IDriver | null> {
    const item = await DriverEntity.findOne(
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
  ): Promise<IDriver> {
    const item = await this.findOne(filters, projections, options);
    if (!item) {
      const err = new NotFoundError('driver not found');
      throw err;
    }
    return item;
  }
  static async findOneOrThrowErrorWithLean(
    filters: object,
    projections: any,
    options: QueryOptions
  ): Promise<IDriver> {
    const item = await this.findOneWithLean(filters, projections, options);
    if (!item) {
      throw new NotFoundError();
    }
    return item;
  }
  static async count(filters: object): Promise<number> {
    const count = await DriverEntity.countDocuments(filters);
    return count;
  }

  static async findAll(
    filters: object,
    projections: any,
    options: QueryOptions
  ): Promise<{ rows: IDriver[]; count: number }> {
    const items = await DriverEntity.find(filters, projections, options);
    const count = await this.count(filters);
    return { rows: items, count };
  }

  static async updateOne(filters: object, request: object): Promise<IDriver> {
    const item = await DriverEntity.findOneAndUpdate(filters, request, {
      new: true,
    });
    if (!item) {
      throw new NotFoundError();
    }
    await redisClient.set(`driver:${item._id}`, JSON.stringify(item));

    return item;
  }
  static async updateMany(filters: object, request: IDriver) {
    const item = await DriverEntity.updateMany(filters, request);
    return item;
  }

  static async deleteOneById(id: string) {
    const item = await DriverEntity.findByIdAndDelete(id);
    redisClient.del(`driver:${id}`).then((replay) => {
      if (replay == 1) {
        console.log(`drvier ${id} deleted from cach` );
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

  static validateCreateDriverSchema = (driver: IDriver) => {
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
      location: Joi.array().items(Joi.number().required()).length(2).required(),
      car: Joi.object({
        maxLength: Joi.number().min(0).required(),
        maxWidth: Joi.number().min(0).required(),
        maxHight: Joi.number().min(0).required(),
        model: Joi.string().required(),
        year: Joi.number().required(),
      }).required(),
    });
    const { error } = schema.validate(driver);
    if (error) {
      throw new UnprocessableEntityError(error.details[0].message);
    }
    return;
  };

  static validateUpdateDriverSchema = (driver: IDriver) => {
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
      location: Joi.array().items(Joi.number().required()).length(2),
      car: Joi.object({
        maxLength: Joi.number().min(0).required(),
        maxWidth: Joi.number().min(0).required(),
        maxHight: Joi.number().min(0).required(),
        model: Joi.string().required(),
        year: Joi.number().required(),
      }),
      available: Joi.boolean(),
    });
    const { error } = schema.validate(driver);
    if (error) {
      throw new UnprocessableEntityError(error.details[0].message);
    }
    return;
  };
}
