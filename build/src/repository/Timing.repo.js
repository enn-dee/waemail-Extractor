"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const times_model_1 = __importStar(require("../models/times.model"));
const geo_tz_1 = require("geo-tz");
const dayjs_1 = __importDefault(require("dayjs"));
const utc_1 = __importDefault(require("dayjs/plugin/utc"));
const timezone_1 = __importDefault(require("dayjs/plugin/timezone"));
const mazjid_model_1 = __importDefault(require("../models/mazjid.model"));
dayjs_1.default.extend(utc_1.default);
dayjs_1.default.extend(timezone_1.default);
class TimingRepository {
    static instance = new this();
    constructor() { }
    static get repository() {
        return this.instance;
    }
    convertToUTCUnix = (date, time, coordinates) => {
        if (!date || !coordinates) {
            return null;
        }
        if (!time || time === "") {
            return null;
        }
        const timezone = (0, geo_tz_1.find)(coordinates[0], coordinates[1]);
        if (!timezone) {
            return null;
        }
        const dateObj = (0, dayjs_1.default)(`${date} ${time}`).tz(timezone[0]);
        return dateObj.unix();
    };
    getInUTC = (date, coordinates) => {
        if (!date || !coordinates) {
            return null;
        }
        const timezone = (0, geo_tz_1.find)(coordinates[0], coordinates[1]);
        if (!timezone) {
            return null;
        }
        const dateObj = (0, dayjs_1.default)(date).tz(timezone[0]);
        return dateObj.toDate();
    };
    handleTiming = async (masjidId, timings, source, sourceId) => {
        try {
            const date = (0, dayjs_1.default)().format("YYYY-MM-DD");
            const masjid = await mazjid_model_1.default.findById(masjidId);
            if (!masjid) {
                throw new Error("Masjid not found");
            }
            const timingsToSave = [];
            for (const timing of timings) {
                const azaanTime = this.convertToUTCUnix(date, timing.azzanTime, masjid.location.coordinates) || 0;
                const jamaatTime = this.convertToUTCUnix(date, timing.iqamahTime, masjid.location.coordinates) || 0;
                if (azaanTime === 0 || jamaatTime === 0) {
                    continue;
                }
                timingsToSave.push({
                    namazName: timing.name,
                    azaanTime,
                    jamaatTime,
                    type: (0, times_model_1.selectType)(timing.name),
                });
            }
            const existingTimings = await times_model_1.default.findOne({ masjidId, date: {
                    $gte: (0, dayjs_1.default)().startOf("day").toDate(),
                    $lte: (0, dayjs_1.default)().endOf("day").toDate(),
                } });
            if (existingTimings) {
                existingTimings.timings = timingsToSave;
                existingTimings.source = source;
                existingTimings.sourceId = sourceId;
                await existingTimings.save();
            }
            else {
                await times_model_1.default.create({
                    masjidId,
                    date: (0, dayjs_1.default)().toDate(),
                    timings: timingsToSave,
                    source,
                    sourceId,
                });
            }
        }
        catch (error) {
            console.error(error);
        }
    };
    deleteUsingSourceId = async (sourceId) => {
        try {
            await times_model_1.default.deleteOne({ sourceId });
        }
        catch (error) {
            console.error(error);
        }
    };
}
exports.default = TimingRepository;
