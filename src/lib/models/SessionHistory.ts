import mongoose, { type Document, type Model, Schema, Types } from "mongoose";

export interface ISessionAttendee {
  name: string;
  roleId: string;
  hourlyRate: number;
}

export interface ISessionHistory extends Document {
  userId: Types.ObjectId;
  sessionName: string;
  attendees: ISessionAttendee[];
  totalCostMMK: number;
  elapsedSeconds: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

const SessionAttendeeSchema = new Schema<ISessionAttendee>(
  {
    name: { type: String, required: true },
    roleId: { type: String, required: true },
    hourlyRate: { type: Number, required: true, default: 0 },
  },
  { _id: false },
);

const SessionHistorySchema = new Schema<ISessionHistory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sessionName: { type: String, required: true },
    attendees: { type: [SessionAttendeeSchema], default: [] },
    totalCostMMK: { type: Number, required: true, default: 0 },
    elapsedSeconds: { type: Number, required: true, default: 0 },
    currency: { type: String, required: true, default: "MMK" },
  },
  { timestamps: true },
);

export const SessionHistory: Model<ISessionHistory> =
  mongoose.models.SessionHistory ??
  mongoose.model<ISessionHistory>("SessionHistory", SessionHistorySchema);
