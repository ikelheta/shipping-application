import mongoose, { Schema } from 'mongoose';
import { IOrder } from './order.dto';
import { ORDER_STATUS } from '../shared/constant';

export const shippingOrderSchema = new mongoose.Schema<IOrder & Document>(
  {
    driverId: {
      type: mongoose.Types.ObjectId,
      ref: 'Driver',
      default: null,
    },
    offerPrice: {
      type: Number,
      required: true,
    },
    counterOffer: [
      {
        driverId: {
          type: mongoose.Types.ObjectId,
          ref: 'Driver',
        },
        price: {
          type: Number,
        },
      },
    ],
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: 'Pending',
    },
    customerId: {
      type: mongoose.Types.ObjectId,
      ref: 'Customer',
      default: null,
    },
    pickUpLocation: {
      type: [Number],
      index: '2dsphere',
    },
    deliveryLocation: {
      type: [Number],
      index: '2dsphere',
    },
    deleveryTo: {
      name: {
        type: String,
        required: true,
      },
      nationalId: {
        type: String,
        required: true,
      },
      phoneNumber: {
        type: String,
        required: true,
      },
    },
    rejectedDrivers: [
      {
        type: mongoose.Types.ObjectId,
      },
    ],
    options: [
      {
        name: {
          type: String,
        },
        price: {
          type: Number,
        },
      },
    ],
    item: {
      hight: {
        type: Number,
      },
      width: {
        type: Number,
      },
      length: {
        type: Number,
      },
    },
  },
  { timestamps: true }
);

export type OrderDocument = mongoose.Document<IOrder> & IOrder;

export default mongoose.model<IOrder & Document>('Order', shippingOrderSchema);
