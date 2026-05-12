import jwt from "jsonwebtoken";

const generateToken = (payload) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");

  // Token expires in 7 days - users stay logged in for a week
  return jwt.sign(payload, secret, { expiresIn: "7d" });
};

export default generateToken;
