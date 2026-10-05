import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

const createToken = (payload: object, secret: string, expiresIn: string) => {
  return jwt.sign(payload, secret, { expiresIn } as SignOptions);
};

const verifyToken = (token: string, secret: string) => {
  try {
    const verifiedToken = jwt.verify(token, secret);
    return { success: true as const, data: verifiedToken as JwtPayload };
  } catch (error) {
    return { success: false as const, error: (error as Error).message };
  }
};

export const jwtUtils = {
  createToken,
  verifyToken,
};
