import { ICustomer } from '../customer/customer.dto';
import { IDriver } from '../driver/driver.dto';
import { DriverProvider } from '../driver/driver.provider';
import { UnAuthorizedError } from '../shared/app-error';
import {
  DEFAULT_MAX_DISTANCE_SEARCH,
  DRIVER_ACTIONS_ON_TRIP,
  EARTH_RADIUSE,
  ORDER_STATUS,
} from '../shared/constant';
import { handlePaginationSort } from '../shared/utils/handle-sort-pagination';
import { IOrder } from './order.dto';
import { OrderProvider } from './order.provider';

export class OrderController {
  static async createOrder(body: IOrder) {
    OrderProvider.validateCreateOrderSchema(body);
    const order = OrderProvider.create(body);
    return order;
  }
  static async getManyOrders(query, filter) {
    const { limit, skip, sort } = handlePaginationSort(query);
    const { count, rows } = await OrderProvider.findAll(
      filter,
      {},
      { limit, skip, sort }
    );
    return { count, rows };
  }
  static async getCustomerManyOrders(query, customer: ICustomer) {
    const { orderStatus } = query;

    let filters: any = {
      customerId: customer._id,
    };
    if (orderStatus) {
      OrderProvider.validateOrderStatus({ orderStatus });
      filters.status = orderStatus;
    }
    const orders = await this.getManyOrders(query, filters);
    return orders;
  }
  static async getDriverPreviousOrders(query, driver: IDriver) {
    const { orderStatus } = query;

    let filters: any = {
      driverId: driver._id,
    };
    if (orderStatus) {
      OrderProvider.validateOrderStatus({ orderStatus });
      filters.status = orderStatus;
    }
    const orders = await this.getManyOrders(query, filters);
    return orders;
  }

  static async getOrder(_id: string) {
    OrderProvider.validateObjectId(_id);
    const row = await OrderProvider.findOneOrThrowError({ _id }, {}, {});
    return row;
  }

  static async deleteOrder(_id: string, customer: ICustomer) {
    OrderProvider.validateObjectId(_id);
    const existOrder = await OrderProvider.findOneOrThrowError({ _id }, {}, {});
    OrderProvider.validateOrderBeforeDelete(existOrder);
    if (String(existOrder.customerId) != String(customer._id)) {
      throw new UnAuthorizedError('can not delete order that is not yours');
    }
    const row = await OrderProvider.deleteOne(_id);
    return row;
  }

  static async updateOrder(_id: string, request: IOrder, customer: ICustomer) {
    OrderProvider.validateObjectId(_id);
    OrderProvider.validateUpdateOrderSchema(request);
    const existOrder = await OrderProvider.findOneOrThrowError({ _id }, {}, {});
    OrderProvider.validateOrderBeforeUpdate(existOrder);
    if (String(existOrder.customerId) != String(customer._id)) {
      throw new UnAuthorizedError('can not update on order that is not yours');
    }
    const row = await OrderProvider.updateOne({ _id }, request);
    return row;
  }

  static async drivereActionOnOrder(
    orderId: string,
    action: string,
    driver: IDriver
  ) {
    OrderProvider.validateObjectId(orderId);

    OrderProvider.validateAction({ action });
    OrderProvider.validateDriverBeforeTakeAction(driver);

    const { _id } = driver;
    const filter = {
      _id: orderId,
    };

    const order = await OrderProvider.findOneOrThrowError(filter, {}, {});
    OrderProvider.validateOrderBeforeTakeAction(order);

    let updateOrder: IOrder;

    switch (action) {
      case DRIVER_ACTIONS_ON_TRIP.ACCEPT:
        updateOrder = await OrderProvider.updateOne(filter, {
          driverId: _id,
          status: ORDER_STATUS.OnGoing,
        });
        let updateDriver: any = { onTrip: order._id };
        await DriverProvider.updateOne({ _id }, updateDriver);
        break;
      case DRIVER_ACTIONS_ON_TRIP.REJECT:
        updateOrder = await OrderProvider.updateOne(filter, {
          $addToSet: { rejectedDrivers: _id },
        });
        break;
      default:
        throw new Error('some thing went wrong');
    }

    return updateOrder;
  }
  static async counterOffer(
    orderId: string,
    driverId: string,
    body: { price: number }
  ) {
    const { price } = body;
    OrderProvider.validateObjectId(orderId);
    OrderProvider.validateCounterOffer(body);
    const existOrder = await OrderProvider.findOneOrThrowError(
      { _id: orderId },
      {},
      {}
    );
    OrderProvider.validateOrderBeforCounterOffer(existOrder);
    const row = await OrderProvider.updateOne(
      { _id: orderId },
      { $push: { counterOffer: { driverId, price } } }
    );
    return row;
  }
  static async getNearOrderOrdersForDriver(query, user: IDriver) {
    const { maxDistance } = query;
    const { location, _id } = user;
    const { maxLength, maxWidth, maxHight } = user?.car;
    const radiusInRadians =
      maxDistance || DEFAULT_MAX_DISTANCE_SEARCH / EARTH_RADIUSE; // Convert meters to radians (earth's radius is approximately 6371 kilometers)
    let filters: any = {};
    filters.pickUpLocation = {
      $geoWithin: {
        $centerSphere: [location, radiusInRadians],
      },
    };
    filters['item.length'] = {
      $lte: maxLength,
    };
    filters['item.width'] = {
      $lte: maxWidth,
    };
    filters['item.hight'] = {
      $lte: maxHight,
    };
    filters.status = ORDER_STATUS.Pending;
    filters.driverId = null;
    filters.rejectedDrivers = {
      $ne: _id,
    };
    const orders = await this.getManyOrders(query, filters);
    return orders;
  }

  static async confirmPickUp(
    orderId: string,
    customer: ICustomer,
    driverId: string
  ) {
    const order = await OrderProvider.findOneOrThrowError(
      { _id: orderId },
      {},
      {}
    );
    const driver = await DriverProvider.findOneOrThrowError(
      { _id: driverId },
      {},
      {}
    );
    OrderProvider.validateOrderBeforePickUp(order, driver, customer);
    OrderProvider.validateDriverBeforePickUp(order, driver, customer);
    const updateOrder = await OrderProvider.updateOne(
      { _id: orderId },
      { status: ORDER_STATUS.Shipped }
    );
    return updateOrder;
  }

  static async confirmDropOff(
    orderId: string,
    customer: ICustomer,
    driverId: string,
    driverRate: number
  ) {
    const order = await OrderProvider.findOneOrThrowError(
      { _id: orderId },
      {},
      {}
    );
    const driver = await DriverProvider.findOneOrThrowError(
      { _id: driverId },
      {},
      {}
    );
    OrderProvider.validateOrderBeforeDropOff(order, driver, customer);
    OrderProvider.validateDriverBeforeDropOff(order, driver);
    let driverUpdate: any = { onTrip: null };
    if (driverRate) {
      OrderProvider.validateDriverRate({ driverRate });
      driverUpdate.rate.star =
        (driver.rate.star * driver.rate.count + driverRate) /
          driver.rate.count +
        1;
      driverUpdate.rate.count = driver.rate.count + 1;
    }
    const updateOrder = await OrderProvider.updateOne(
      { _id: orderId },
      { status: ORDER_STATUS.Delivered }
    );

    await DriverProvider.updateOne({ _id: driver._id }, driverUpdate);
    return updateOrder;
  }
}
