"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectType = void 0;
const mongoose_1 = require("mongoose");
const timesSchema = new mongoose_1.Schema({
    masjidId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Masjid",
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    lastEditor: {
        type: mongoose_1.Schema.Types.ObjectId,
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
        type: mongoose_1.Schema.Types.ObjectId,
    },
}, { timestamps: true });
timesSchema.index({ date: 1, masjidId: 1 }, { unique: true });
const selectType = (namazName) => {
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
exports.selectType = selectType;
exports.default = (0, mongoose_1.model)("PrayerTime", timesSchema);
