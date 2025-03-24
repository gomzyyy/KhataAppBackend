import { Schema, model } from "mongoose";

export const sharedSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
  },
  email: {
    type: String,
    required: true,
  },
  address: {
    type: String,
  },
});
const Shared = model("Shared", sharedSchema);
export default Shared;
