import mongoose, { type Document, type Model, Schema, Types } from "mongoose";

export interface IAttendeeEntry {
  name: string;
  roleId: string;
  hourlyRate: number;
}

export interface IPreset extends Document {
  userId: Types.ObjectId;
  name: string;
  attendees: IAttendeeEntry[];
  createdAt: Date;
  updatedAt: Date;
}

const AttendeeEntrySchema = new Schema<IAttendeeEntry>(
  {
    name: { type: String, required: true },
    roleId: { type: String, required: true },
    hourlyRate: { type: Number, required: true, default: 0 },
  },
  { _id: false },
);

const PresetSchema = new Schema<IPreset>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    attendees: { type: [AttendeeEntrySchema], default: [] },
  },
  { timestamps: true },
);

export const Preset: Model<IPreset> =
  mongoose.models.Preset ?? mongoose.model<IPreset>("Preset", PresetSchema);
