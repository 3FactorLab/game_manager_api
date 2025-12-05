import mongoose, { Schema, Document } from "mongoose";

export interface IRefreshToken extends Document {
  user: mongoose.Types.ObjectId;
  token: string;
  expires: Date;
  created: Date;
  revoked?: Date;
  replacedByToken?: string;
  isExpired: boolean;
  isActive: boolean;
}

const refreshTokenSchema = new Schema<IRefreshToken>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  token: { type: String, required: true },
  expires: { type: Date, required: true },
  created: { type: Date, default: Date.now },
  revoked: { type: Date },
  replacedByToken: { type: String },
});

// Virtual properties for convenience
refreshTokenSchema.virtual("isExpired").get(function (this: IRefreshToken) {
  return Date.now() >= this.expires.getTime();
});

refreshTokenSchema.virtual("isActive").get(function (this: IRefreshToken) {
  return !this.revoked && !this.isExpired;
});

refreshTokenSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    // Remove _id and user for security when returning to client (though we usually just return the string)
    const retAny = ret as any;
    delete retAny._id;
    delete retAny.id;
    delete retAny.user;
  },
});

export default mongoose.model<IRefreshToken>(
  "RefreshToken",
  refreshTokenSchema
);
