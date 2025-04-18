const populate_obj = {
  Owner: [
    {
      path: "customers",
      populate: {
        path: "buyedProducts",
        populate: { path: ["product", "soldBy", "buyer"] },
      },
    },
    "employeeData",
    "inventory",
    'accountType',
     { path: "history.payments.payment" },
    { path: "history.payments.createdBy" },
  ],
  Partner: {
    path: "businessOwner",
    select: "-password -accessPasscode",
    populate: {
      path: [
        {
          path: "customers",
          populate: {
            path: "buyedProducts",
            populate: { path: ["product", "soldBy", "buyer"] },
          },
        },
        ,
        "employeeData",
        "inventory",
        'accountType',
         { path: "history.payments.payment" },
    { path: "history.payments.createdBy" },
      ],
    },
  },
  Employee: {
    path: "businessOwner",
    select: "-password -accessPasscode",
    populate: {
      path: [
        {
          path: "customers",
          populate: {
            path: "buyedProducts",
            populate: { path: ["product", "soldBy", "buyer"] },
          },
        },
        ,
        "employeeData",
        "inventory",
        'accountType',
         { path: "history.payments.payment" },
    { path: "history.payments.createdBy" },
      ],
    },
  },
};

export { populate_obj };
