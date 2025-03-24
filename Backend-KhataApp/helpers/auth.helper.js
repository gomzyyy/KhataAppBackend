import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const generateToken = (data) => {
  if (!data || !process.env.SECRET_KEY) {
    return;
  }
  const token = jwt.sign(data, process.env.SECRET_KEY, {
    expiresIn: "7d",
  });
  return token;
};

const validateToken = (token) => {
  if (!token || !process.env.SECRET_KEY) {
    return;
  }
  const decode = jwt.verify(token, process.env.SECRET_KEY);
  return decode;
};

const encryptPassword = async (password) => {
  if (!password) {
    return;
  }
  const encryptedPassword = await bcrypt.hash(password, 10);
  return encryptedPassword;
};
const verifyPassword = async (password, hash) => {
  if (!password || !hash) {
    return;
  }
  const ok = await bcrypt.compare(password, hash);
  return ok;
};

export { generateToken, validateToken, encryptPassword, verifyPassword };
