import mongoose, { Types } from "mongoose";
import MasjidModel from "../models/mazjid.model";

export enum SocialSource {
    EMAIL = 0,
    WHATSAPP = 1,
    ANNOUNCEMENT = 2,
}


export interface ISocial extends mongoose.Document {
    _id?: Types.ObjectId;
    source: string;
    masjidId: Types.ObjectId;
    message: string;
    attachments: string[];
    html_message: string;
    isEdited: boolean;
    isDeleted: boolean;
    messageId?: string;
    lastestEditMsgKey?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const SocialSchema = new mongoose.Schema<ISocial>({
    source: { type: String, required: true },
    masjidId: { type: mongoose.Schema.Types.ObjectId, ref: MasjidModel, required: true },
    message: { type: String, default: "" },
    attachments: { type: [String], default: [] },
    html_message: { type: String, default: "" },
    isEdited: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    messageId: { type: String, required: false },
    lastestEditMsgKey: { type: String, required: false },
}, { timestamps: true });

const Social = mongoose.model<ISocial>("Social", SocialSchema);
export default Social;
