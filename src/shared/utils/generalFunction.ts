import bcrypt from 'bcrypt';
import { SALT } from '../constant';
import QRCode from 'qrcode';
import { AppError } from '../app-error';
export const hashString = async (str: string) => {
  const salt = await bcrypt.genSalt(SALT);
  const hashedScript = await bcrypt.hash(str, salt);
  return hashedScript;
};

export const generateQrCodeFromText = async (text: string) => {
  return new Promise<string>((resolve, reject) => {
    QRCode.toDataURL(text, (error, qrCodeImageURL) => {
      if (error) {
        reject(error);
      } else {
        resolve(qrCodeImageURL);
      }
    });
  });
};
