import { AuthProvider } from '../auth/auth.provider';
import { BadRequestError } from '../shared/app-error';
import {
  generateQrCodeFromText,
  hashString,
} from '../shared/utils/generalFunction';
import { handlePaginationSort } from '../shared/utils/handle-sort-pagination';
import { IDriver } from './driver.dto';
import { DriverProvider } from './driver.provider';

export class DriverController {
  static async createDriver(body: IDriver) {
    DriverProvider.validateCreateDriverSchema(body);
    const existEmail = await DriverProvider.findOne(
      { email: body.email },
      ['-password'],
      {}
    );
    if (existEmail) {
      throw new BadRequestError('This email already exist');
    }
    const driver = await DriverProvider.create(body);
    const token = AuthProvider.createDriverToken(driver);
    return { driver, token };
  }
  static async getDrivers(query) {
    const { limit, skip, sort } = handlePaginationSort(query);
    const { count, rows } = await DriverProvider.findAll({}, ['-password'], {
      limit,
      skip,
      sort,
    });
    return { count, rows };
  }

  static async getDriver(_id: string) {
    DriverProvider.validateObjectId(_id);
    const driver = await DriverProvider.findOneOrThrowError(
      { _id },
      ['-password'],
      {}
    );
    return driver;
  }

  static async deleteDriver(_id: string) {
    const driver = await DriverProvider.deleteOneById(_id);
    return driver;
  }

  static async updateDriver(_id: string, request: IDriver) {
    DriverProvider.validateUpdateDriverSchema(request);
    const existDriver = await DriverProvider.findOneOrThrowError(
      { _id },
      {},
      {}
    );

    if (request.password) {
      let hashedPassword = await hashString(request.password);
      request.password = hashedPassword;
    }
    if (request.email) {
      const existEmail = await DriverProvider.findOne(
        { email: request.email, _id: { $ne: _id } },
        ['-password'],
        {}
      );
      if (existEmail) {
        throw new BadRequestError('This email already exist');
      }
    }
    if (request.available && existDriver.onTrip) {
      throw new BadRequestError(
        'cant change available to true when you are on trip'
      );
    }
    const driver = await DriverProvider.updateOne({ _id }, request);
    return driver;
  }
  static async getQrCode(_id: string) {
    const url = await generateQrCodeFromText(_id);
    return url;
  }
}
