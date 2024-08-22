import { Schema, model, Types } from "mongoose";

export interface ITimes {
  masjidId: Types.ObjectId;
  date: Date;
  lastEditor: Types.ObjectId;
  timings: {
    namazName: string;
    azaanTime: number;
    jamaatTime: number;
    type: number;
  }[];
  source?: string;
  sourceId?: Types.ObjectId;
}

const timesSchema = new Schema<ITimes>(
  {
    masjidId: {
      type: Schema.Types.ObjectId,
      ref: "Masjid",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    lastEditor: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    timings: [
      {
        namazName: {
          type: String,
          required: true,
        },
        type: {
          type: Number,
        },
        azaanTime: { type: Number, trim: true },
        jamaatTime: { type: Number, trim: true },
      },
    ],
    source: {
      type: String,
    },
    sourceId: {
      type: Schema.Types.ObjectId,
    },
  },
  { timestamps: true }
);

timesSchema.index({ date: 1, masjidId: 1 }, { unique: true });

export const selectType = (namazName: string) => {
  switch (namazName) {
    case "Fajr":
      return 1;
    case "Dhur":
      return 2;
    case "Asar":
      return 3;
    case "Maghrib":
      return 4;
    case "Isha":
      return 5;
    default:
      return 0;
  }
};

export default model("PrayerTime", timesSchema);
