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

const getCloudinaryPublicIdFromUrl = (url) => {
  if (!url || typeof url !== "string") return null;
  const parts = url.split("/");
  if (parts.length < 2) return null;
  const fileWithExtension = parts.at(-1);
  const folder = parts.at(-2);
  const [publicId] = fileWithExtension.split(".");
  return `${folder}/${publicId}`;
};

export {
  generateToken,
  validateToken,
  encryptPassword,
  verifyPassword,
  getCloudinaryPublicIdFromUrl,
};
