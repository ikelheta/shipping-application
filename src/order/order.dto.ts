import mongoose from 'mongoose';
export interface IcounterOffer {
  driverId: mongoose.Types.ObjectId | undefined;
  price: number;
}

export interface IOrderOption {
  name: string;
  price: number;
}

export interface IItem {
  length: number;
  width: number;
  hight: number;
}

export interface IDeliveryTo {
  name: string;
  nationalId: string;
  phoneNumber: string;
}

export interface IOrder {
  _id: string | undefined;
  rejectedDrivers: mongoose.Types.ObjectId[] | undefined;
  deliveryLocation: number[];
  pickUpLocation: number[];
  customerId: mongoose.Types.ObjectId | undefined;
  status: string;
  counterOffer: IcounterOffer;
  offerPrice: number;
  driverId: mongoose.Types.ObjectId | undefined;
  options: IOrderOption[];
  item: IItem;
  deleveryTo: IDeliveryTo;
}
