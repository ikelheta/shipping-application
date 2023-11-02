import mongoose from 'mongoose';
export enum Status {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
  Pending = 'PENDING',
}

export enum Availabilty {
  Available = 'AVAILABLE',
  UnAvailable = 'UnAvailable',
}
export interface ICar {
  model: string;
  year: number;
  maxLength: number;
  maxWidth: number;
  maxHight: number;
}
export interface IRate {
  star: number;
  count: number;
}

export interface IDriver {
  _id: string;
  username: string;
  email: string;
  address: string;
  nationalId: string;
  password: string;
  phoneNumber: string;
  image: string;
  location: number[];
  status: Availabilty;
  car: ICar;
  onTrip: string | undefined;
  available: boolean;
  rate: IRate;
}
