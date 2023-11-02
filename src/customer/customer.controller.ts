import { AuthProvider } from '../auth/auth.provider';
import { BadRequestError } from '../shared/app-error';
import { hashString } from '../shared/utils/generalFunction';
import { handlePaginationSort } from '../shared/utils/handle-sort-pagination';
import { ICustomer } from './customer.dto';
import { CustomerProvider } from './customer.provider';

export class CustomerController {
  static async createCustomer(body: ICustomer) {
    CustomerProvider.validateCreateCustomerSchema(body);
    const existEmail = await CustomerProvider.findOne(
      { email: body.email },
      ['-password'],
      {}
    );
    if (existEmail) {
      throw new BadRequestError('This email already exist');
    }
    const customer = await CustomerProvider.create(body);
    const token = AuthProvider.createCustomerToken(customer);
    return { customer, token };
  }
  static async getCustomers(query: any) {
    const { limit, skip, sort } = handlePaginationSort(query);
    const { count, rows } = await CustomerProvider.findAll({}, ['-password'], {
      limit,
      skip,
      sort,
    });
    return { count, rows };
  }

  static async getCustomer(_id: string) {
    CustomerProvider.validateObjectId(_id);
    const customer = await CustomerProvider.findOneOrThrowError(
      { _id },
      ['-password'],
      {}
    );

    return customer;
  }

  static async deleteCustomer(_id: string) {
    const customer = await CustomerProvider.deleteOneById(_id);
    return customer;
  }

  static async updateCustomer(_id: string, request: ICustomer) {
    CustomerProvider.validateUpdateCustomerSchema(request);
    if (request.password) {
      let hashedPassword = await hashString(request.password);
      request.password = hashedPassword;
    }
    if (request.email) {
      const existEmail = await CustomerProvider.findOne(
        { email: request.email, _id: { $ne: _id } },
        ['-password'],
        {}
      );
      if (existEmail) {
        throw new BadRequestError('This email already exist');
      }
    }
    const customer = await CustomerProvider.updateOne({ _id }, request);
    return customer;
  }
}
