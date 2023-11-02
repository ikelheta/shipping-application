import { Request } from 'express';
import { IDriver } from './driver/driver.dto';
import { ICustomer } from './customer/customer.dto';

interface AuthenticatedDriverRequest extends Request {
  user: IDriver;
}

interface AuthenticatedCustomerRequest extends Request {
  user: ICustomer;
}

interface UnAuthenticatedRequest extends Request {
  user?: ICustomer | IDriver;
}
