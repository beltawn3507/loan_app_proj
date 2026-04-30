import mongoose from "mongoose";

interface PaymentAttrs {
  loanId: mongoose.Types.ObjectId;
  utr: string;
  amount: number;
}

interface PaymentDoc extends mongoose.Document {
  loanId: mongoose.Types.ObjectId;
  utr: string;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface PaymentModel extends mongoose.Model<PaymentDoc> {
  build(attrs: PaymentAttrs): PaymentDoc;
}

const paymentSchema = new mongoose.Schema(
  {
    loanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Loan",
      required: true,
    },
    utr: {
      type: String,
      required: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { timestamps: true }
);

paymentSchema.set("toJSON", {
  transform(doc, ret: any) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
  },
});

paymentSchema.statics.build = (attrs: PaymentAttrs) => {
  return new Payment(attrs);
};

const Payment = mongoose.model<PaymentDoc, PaymentModel>(
  "Payment",
  paymentSchema
);

export { Payment };