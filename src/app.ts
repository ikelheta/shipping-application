import express from 'express';
import 'dotenv/config';
import { connect } from 'mongoose';
import cors from 'cors';
import AppErrorHandler from './shared/app-error/error-handler';
import customerRoutes from './customer/customer.routes';
import authRoutes from './auth/auth.routes';
import driverrRoutes from './driver/driver.routes';
import orderRoutes from './order/order.routes';
import { connectDb } from './db/config';

const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/customer', customerRoutes);
app.use('/api/driver', driverrRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/auth', authRoutes);

app.use(AppErrorHandler.errorHandler);

const PORT = process.env.PORT || 3000;

const start = async (): Promise<void> => {
  try {
    await connectDb();
    console.log(`connected to DB ...`);
    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

void start();
