import jwt from "jsonwebtoken";

export const signJwt = (payload: any) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET as string, {
    expiresIn: "1800s",
  });
};

export const verifyJwt = (token: string) => {
  return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string);
};
