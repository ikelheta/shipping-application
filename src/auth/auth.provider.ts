import * as jwt from 'jsonwebtoken';
import Joi from 'joi';
import { PASSWORD_MIN_LENGTH } from '../shared/constant';
import bcrypt from 'bcrypt';
import {
  UnAuthorizedError,
  UnprocessableEntityError,
} from '../shared/app-error';
import { IDriver } from '../driver/driver.dto';
import { ICustomer } from '../customer/customer.dto';
export class AuthProvider {
  static createDriverToken(driver: IDriver) {
    return jwt.sign(
      { _id: driver._id },
      process.env.DRIVER_SECRET || 'driverSecret',
      {
        expiresIn: process.env.TOKEN_EXPIRATION || '30d',
      }
    );
  }

  static createCustomerToken(customer: ICustomer) {
    return jwt.sign(
      { _id: customer._id },
      process.env.CUSTOMER_SECRETE || 'customerSecret',
      {
        expiresIn: process.env.TOKEN_EXPIRATION || '30d',
      }
    );
  }

  static async comparePassword(
    enteredPassword: string,
    storedHashedPassword: string
  ) {
    const passwordsMatch = await bcrypt.compare(
      enteredPassword,
      storedHashedPassword
    );
    if (passwordsMatch) {
      return;
    } else {
      throw new UnAuthorizedError('username or password are wrong');
    }
  }

  static validateLoginSchema = (customer: {
    email: string;
    password: string;
  }) => {
    const schema = Joi.object({
      email: Joi.string().trim().required().email(),
      password: Joi.string().min(PASSWORD_MIN_LENGTH).required(),
    });
    const { error } = schema.validate(customer);
    if (error) {
      throw new UnprocessableEntityError(error.details[0].message);
    }
    return;
  };
}
