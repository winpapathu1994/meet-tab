import mongoose, { type Document, type Model, Schema } from "mongoose";

export interface IRole extends Document {
  label: string;
  hourlyRate: number;
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema = new Schema<IRole>(
  {
    label: { type: String, required: true, trim: true },
    hourlyRate: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
);

export const Role: Model<IRole> =
  mongoose.models.Role ?? mongoose.model<IRole>("Role", RoleSchema);
