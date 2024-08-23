"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialSource = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mazjid_model_1 = __importDefault(require("../models/mazjid.model"));
var SocialSource;
(function (SocialSource) {
    SocialSource[SocialSource["EMAIL"] = 0] = "EMAIL";
    SocialSource[SocialSource["WHATSAPP"] = 1] = "WHATSAPP";
    SocialSource[SocialSource["ANNOUNCEMENT"] = 2] = "ANNOUNCEMENT";
})(SocialSource || (exports.SocialSource = SocialSource = {}));
const SocialSchema = new mongoose_1.default.Schema({
    source: { type: String, required: true },
    masjidId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: mazjid_model_1.default, required: true },
    message: { type: String, default: "" },
    attachments: { type: [String], default: [] },
    html_message: { type: String, default: "" },
    isEdited: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    messageId: { type: String, required: false },
    lastestEditMsgKey: { type: String, required: false },
}, { timestamps: true });
const Social = mongoose_1.default.model("Social", SocialSchema);
exports.default = Social;
