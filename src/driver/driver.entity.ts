import mongoose from 'mongoose';
import {
  NATIONAL_ID_LENGTH,
  PASSWORD_MIN_LENGTH,
  PHONE_NUMBER_MIN_LENGTH,
  SALT,
  USER_NAME_LENGTH,
} from '../shared/constant';
import { Availabilty, ICar, IDriver } from './driver.dto';
import * as bcrypt from 'bcrypt';

const CarSchema = new mongoose.Schema<ICar & Document>({
  maxHight: {
    type: Number,
    required: true,
  },
  maxWidth: {
    type: Number,
    required: true,
  },

  maxLength: {
    type: Number,
    required: true,
  },
  model: {
    type: String,
  },
  year: {
    type: Number,
  },
});

export const DriverSchema = new mongoose.Schema<IDriver & Document>(
  {
    username: {
      type: String,
      required: [true, 'Please provide username'],
      maxlength: USER_NAME_LENGTH.max,
      minlength: USER_NAME_LENGTH.min,
    },
    email: {
      type: String,
      required: [true, 'Please provide email'],
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please provide a valid email',
      ],
      unique: true,
    },
    address: {
      type: String,
      required: [true, 'please provide address'],
    },
    location: {
      type: [Number],
      index: '2dsphere',
    },
    nationalId: {
      type: String,
      required: [true, 'please provide a national'],
      length: NATIONAL_ID_LENGTH,
    },
    password: {
      type: String,
      required: [true, 'Please provide password'],
      minlength: PASSWORD_MIN_LENGTH,
    },
    phoneNumber: {
      type: String,
      required: [true, 'Please provide phone number'],
      minlength: PHONE_NUMBER_MIN_LENGTH,
    },
    image: {
      type: String,
      default:
        'https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png',
    },
    status: {
      type: String,
      trim: true,
      enum: Object.values(Availabilty),
      default: Availabilty.UnAvailable,
    },
    onTrip: {
      type: mongoose.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
    car: {
      type: CarSchema,
      required: true,
    },
    available: {
      type: Boolean,
      default: false,
    },
    rate: {
      star: { type: Number, default: 0 },
      times: {
        type: Number,
        default: 0,
      },
    },
  },
  { timestamps: true }
);
DriverSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isNew) return next();

  const salt = await bcrypt.genSalt(SALT);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

export type DriverDocument = mongoose.Document<IDriver> & IDriver;

export default mongoose.model<IDriver & Document>('Driver', DriverSchema);
