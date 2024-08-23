import { AiTime } from "../modules/openai";
import { Types } from "mongoose";
import TimesModel, { selectType } from "../models/times.model";
import { find } from "geo-tz";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone"
import MasjidModel from "../models/mazjid.model";

dayjs.extend(utc);
dayjs.extend(timezone);

export default class TimingRepository {
  private static instance: TimingRepository = new this();
  private constructor() {}

  public static get repository() {
    return this.instance;
  }

  private convertToUTCUnix = (date: string, time: string, coordinates: number[]): number | null => {
    if (!date || !coordinates) {
      return null;
    }

    if (!time || time === "") {
      return null;
    }

    const timezone = find(coordinates[0], coordinates[1]);
    if (!timezone) {
      return null;
    }

    const dateObj = dayjs(`${date} ${time}`).tz(timezone[0]);
    return dateObj.unix();
  }

  public getInUTC = (date: string, coordinates: number[]): Date | null => {
    if (!date || !coordinates) {
      return null;
    }

    const timezone = find(coordinates[0], coordinates[1]);
    if (!timezone) {
      return null;
    }

    const dateObj = dayjs(date).tz(timezone[0]);
    return dateObj.toDate();
  }

  public handleTiming = async (
    masjidId: Types.ObjectId,
    timings: AiTime[],
    source: string,
    sourceId: Types.ObjectId
  ): Promise<void> => {
    try {
        const date = dayjs().format("YYYY-MM-DD");
        const masjid = await MasjidModel.findById(masjidId);
        if (!masjid) {
          throw new Error("Masjid not found");
        }
        const timingsToSave = [] 
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
            type: selectType(timing.name),
          });
        }
        
        const existingTimings = await TimesModel.findOne({ masjidId, date: {
          $gte: dayjs().startOf("day").toDate(),
          $lte: dayjs().endOf("day").toDate(),
        } });

        if (existingTimings) {
          existingTimings.timings = timingsToSave;
          existingTimings.source = source;
          existingTimings.sourceId = sourceId;
          await existingTimings.save();
        } else {
          await TimesModel.create({
            masjidId,
            date: dayjs().toDate(),
            timings: timingsToSave,
            source,
            sourceId,
          });
        }
    } catch (error) {
      console.error(error);
    }
  };

  public deleteUsingSourceId = async (sourceId: Types.ObjectId): Promise<void> => {
    try {
      await TimesModel.deleteOne({ sourceId });
    } catch (error) {
      console.error(error);
    }
  }
}
