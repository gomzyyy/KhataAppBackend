import mongoose from "mongoose";
const { Schema, model, models } = mongoose;

const liabilitySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["Current", "Non-Current", "Contingent"],
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    categoryDescription: {
      type: String,
    },
    amount: {
      type: Number,
      required: true,
    },
    interestRate: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    installmentAmount: {
      type: Number,
    },
    remainingBalance: {
      type: Number,
    },
    status: {
      type: String,
      enum: ["Active", "Paid", "Overdue"],
      default: "Active",
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "Owner",
    },
  },
  { timestamps: true }
);

liabilitySchema.pre("save", function (next) {
  const timeElapsed =
    (new Date() - this.startDate) / (1000 * 60 * 60 * 24 * 365);
  if (this.interestRate) {
    this.remainingBalance =
      this.amount * Math.pow(1 + this.interestRate / 100, timeElapsed);
  } else if (this.installmentAmount) {
    const installmentsPaid = Math.floor(timeElapsed * 12);
    this.remainingBalance =
      this.amount - this.installmentAmount * installmentsPaid;
  } else {
    this.remainingBalance = this.amount;
  }

  if (this.remainingBalance <= 0) {
    this.status = "Paid";
    this.remainingBalance = 0;
  }
  next();
});

const Liability = models.Liability || model("Liability", liabilitySchema);
export default Liability;
