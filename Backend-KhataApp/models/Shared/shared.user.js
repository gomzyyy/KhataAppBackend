export const sharedUser = {
  name: {
    type: String,
    required: true,
  },
  phoneNumber: {
    value: {
      type: String,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  email: {
    value: {
      type: String,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  address: {
    type: String,
  },
  image: {
    type: String,
  },
  userId: {
    type: String,
    unique: true,
    required: true,
  },
};
