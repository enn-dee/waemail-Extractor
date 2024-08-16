"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.masjidSchema = void 0;
const mongoose_1 = require("mongoose");
const regex_constant_1 = __importDefault(require("../constants/regex.constant"));
exports.masjidSchema = new mongoose_1.Schema({
    masjidName: {
        type: String,
        trim: true,
        unique: true,
        required: true,
    },
    masjidProfilePhoto: {
        type: String,
        default: "",
        match: [regex_constant_1.default.URL, "Invalid masjid image url"],
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
        type: mongoose_1.Schema.Types.ObjectId,
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
            match: [regex_constant_1.default.COORDINATES, "Invalid coordinates"],
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
                match: [regex_constant_1.default.URL, "Invalid url"],
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
}, { timestamps: true });
exports.masjidSchema.index({ location: "2dsphere" });
exports.masjidSchema.statics.getMasjidById = async function (id) {
    try {
        const masjid = await this.findOne({ _id: id, isFreezed: false });
        if (!masjid) {
            throw new Error("Masjid not found");
        }
        return masjid;
    }
    catch (error) {
        throw new Error(error.message);
    }
};
exports.default = (0, mongoose_1.model)("Masjid", exports.masjidSchema);
