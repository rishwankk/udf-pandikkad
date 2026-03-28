import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBoothStatus extends Document {
  booth: number;
  boothName: string;
  observer: string;
  contact: string;
  ward: string;
  flex: {
    status: "pending" | "partially" | "completed" | "";
    extraRequest: boolean;
  };
  poster: {
    status: "pending" | "partially" | "completed" | "";
    extraRequest: boolean;
  };
  round1: {
    status: "started" | "partially" | "completed" | "";
  };
  round2: {
    status: "started" | "partially" | "completed" | "";
  };
  round3: {
    status: "started" | "partially" | "completed" | "";
  };
  kudumbaYogamDate: string;
  expectedLead: number;
  lastUpdated: Date;
  entryTime: Date;
}

const BoothStatusSchema = new Schema<IBoothStatus>(
  {
    booth: { type: Number, required: true, unique: true },
    boothName: { type: String, required: true },
    observer: { type: String, required: true },
    contact: { type: String, required: true },
    ward: { type: String, default: "" },
    flex: {
      status: { type: String, default: "" },
      extraRequest: { type: Boolean, default: false },
    },
    poster: {
      status: { type: String, default: "" },
      extraRequest: { type: Boolean, default: false },
    },
    round1: { status: { type: String, default: "" } },
    round2: { status: { type: String, default: "" } },
    round3: { status: { type: String, default: "" } },
    kudumbaYogamDate: { type: String, default: "" },
    expectedLead: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now },
    entryTime: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const BoothStatus: Model<IBoothStatus> =
  mongoose.models.BoothStatus ||
  mongoose.model<IBoothStatus>("BoothStatus", BoothStatusSchema);

export default BoothStatus;
