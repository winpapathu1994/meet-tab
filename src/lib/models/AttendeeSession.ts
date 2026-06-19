import mongoose, { type Document, type Model, Schema, Types } from "mongoose";

export interface IAttendeeEntry {
  name: string;
  roleId: string;
  hourlyRate: number;
}

export interface IAttendeeSession extends Document {
  userId: Types.ObjectId;
  attendees: IAttendeeEntry[];
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

const AttendeeSessionSchema = new Schema<IAttendeeSession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    attendees: { type: [AttendeeEntrySchema], default: [] },
  },
  { timestamps: { createdAt: false, updatedAt: true } },
);

export const AttendeeSession: Model<IAttendeeSession> =
  mongoose.models.AttendeeSession ??
  mongoose.model<IAttendeeSession>("AttendeeSession", AttendeeSessionSchema);
