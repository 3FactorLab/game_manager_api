/**
 * @file order.model.ts
 * @description Mongoose model for purchase orders.
 */
import mongoose, { Document, Schema, Types } from "mongoose";
import { OrderStatus } from "../types/enums";
import { IUser } from "./user.model"; // Assuming IUser is defined in user.model.ts
import { IGame } from "./game.model"; // Assuming IGame is defined in game.model.ts

export interface IOrder extends Document {
  user: IUser["_id"];
  items: {
    game: IGame["_id"];
    title: string;
    price: number;
    licenseKey: string;
  }[];
  totalAmount: number;
  currency: string;
  status: OrderStatus;
  stripePaymentIntentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        game: { type: Schema.Types.ObjectId, ref: "Game", required: true },
        title: { type: String, required: true },
        price: { type: Number, required: true },
        licenseKey: { type: String, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    currency: { type: String, default: "eur" },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
    },
    stripePaymentIntentId: { type: String },
  },
  { timestamps: true }
);

const Order = mongoose.model<IOrder>("Order", orderSchema);

export default Order;
