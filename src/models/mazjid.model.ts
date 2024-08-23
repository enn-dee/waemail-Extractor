import mongoose, { Schema, model } from "mongoose";
import RegexValidator from "../constants/regex.constant";

export interface IMasjid extends mongoose.Document {
  _id: mongoose.Types.ObjectId;
  masjidName: string;
  masjidProfilePhoto: string;
  description: string;
  address: string;
  location: {
    type: string;
    coordinates: number[];
  };
  lastEditor: mongoose.Types.ObjectId;
  contact: string;
  externalLinks: { name: string; url: string }[];
  isFreezed: boolean;
  isAssigned: boolean;
  getMasjidById: (id: string) => Promise<IMasjid>;
}

export const masjidSchema = new Schema<IMasjid>(
  {
    masjidName: {
      type: String,
      trim: true,
      unique: true,
      required: true,
    },
    masjidProfilePhoto: {
      type: String,
      default: "",
      match: [RegexValidator.URL, "Invalid masjid image url"],
    },
    description: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      required: true,
    },
    contact: {
      type: String,
      // match: [RegexValidator.PHONE_NUMBER, "Invalid contact number"],
      required: false,
    },
    lastEditor: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
        select: false,
      },
      coordinates: {
        type: [Number],
        required: true,
        match: [RegexValidator.COORDINATES, "Invalid coordinates"],
      },
    },
    externalLinks: [
      {
        name: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
          match: [RegexValidator.URL, "Invalid url"],
        },
      },
    ],
    isFreezed: {
      type: Boolean,
      default: false,
      select: false,
    },
    isAssigned: {
      type: Boolean,
      default: false,
    }
  },
  { timestamps: true }
);

masjidSchema.index({ location: "2dsphere" });

masjidSchema.statics.getMasjidById = async function (
  id: string
): Promise<IMasjid> {
  try {
    const masjid = await this.findOne({ _id: id, isFreezed: false });
    if (!masjid) {
      throw new Error("Masjid not found");
    }
    return masjid;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export default model<IMasjid>("Masjid", masjidSchema);
