import crypto from "crypto";
import bcrypt from "bcryptjs";
import config from "../config";

export const hashPassword = (plain: string) => bcrypt.hash(plain, config.bcrypt_salt_rounds);
export const comparePassword = (plain: string, hashed: string) => bcrypt.compare(plain, hashed);

export const sha256 = (value: string) => crypto.createHash("sha256").update(value).digest("hex");

export const randomOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

export const randomToken = () => crypto.randomBytes(32).toString("hex");
