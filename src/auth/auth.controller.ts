import { AuthProvider } from './auth.provider';
import { CustomerProvider } from '../customer/customer.provider';
import { DriverProvider } from '../driver/driver.provider';
import { UnAuthorizedError } from '../shared/app-error';
export class AuthController {
  static async customerToken(loginData: { email: string; password: string }) {
    AuthProvider.validateLoginSchema(loginData);
    const { email, password } = loginData;

    const customer = await CustomerProvider.findOne({ email }, {}, {});
    if (!customer) {
      throw new UnAuthorizedError('username or password are wrong');
    }
    await AuthProvider.comparePassword(password, customer.password);
    const token = AuthProvider.createCustomerToken(customer);
    return { token };
  }

  static async driverToken(loginData: { email: string; password: string }) {
    AuthProvider.validateLoginSchema(loginData);
    const { email, password } = loginData;

    const driver = await DriverProvider.findOne({ email }, {}, {});
    if (!driver) {
      throw new UnAuthorizedError('username or password are wrong');
    }

    await AuthProvider.comparePassword(password, driver.password);

    const token = AuthProvider.createDriverToken(driver);
    return { token };
  }
}
