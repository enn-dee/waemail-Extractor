import Imap from "node-imap";
import { simpleParser } from "mailparser";
import dotenv from "dotenv";
import dayjs from "dayjs";
import { logger } from "../utils/logger";
import { findMasjidByEmail } from "./mazjidFromdb";
import timesModel from "../models/times.model";
import { Types } from "mongoose";

dotenv.config();

export class EmailProcessor {
  private imapUser: string;
  private imapHost: string;
  private imapPass: string;
  private imapPort: number;
  private imap: Imap;

  constructor() {
    this.imapUser = process.env.IMAP_USER as string;
    this.imapHost = process.env.IMAP_HOST as string;
    this.imapPass = process.env.IMAP_PASSWORD as string;
    this.imapPort = parseInt(process.env.IMAP_PORT || "993");

    this.imap = new Imap({
      user: this.imapUser,
      password: this.imapPass,
      host: this.imapHost,
      port: this.imapPort,
      tls: true,
      authTimeout: 30000,
      connTimeout: 30000,
    });
  }

  private async getPrayerTimesByMasjidId(masjidId: string) {
    try {
      if (!Types.ObjectId.isValid(masjidId)) {
        throw new Error("Invalid Masjid ID");
      }

      const MasjidInfo = await timesModel.findOne({ masjidId: new Types.ObjectId(masjidId) }).sort({ date: -1 });

      if (!MasjidInfo) {
        console.log("No prayer times found for the given Masjid ID");
        return null;
      }

      const timingsArray = MasjidInfo.timings.map((timing) => ({
        namazName: timing.namazName,
        type: timing.type,
        azaanTime: dayjs.unix(timing.azaanTime).format('YYYY-MM-DD HH:mm:ss'),
        jamaatTime: dayjs.unix(timing.jamaatTime).format('YYYY-MM-DD HH:mm:ss'),
      }));

      return [{timingsArray}];
    } catch (error) {
      console.error("Error fetching prayer times:", error);
      throw error;
    }
  }

  private openInbox(cb: any) {
    this.imap.openBox("INBOX", true, cb);
  }

  public async fetchEmails(): Promise<any[]> {
    const websites: any[] = [];

    return new Promise((resolve, reject) => {
      this.imap.once("ready", () => {
        this.openInbox(async (err: any, box: any) => {
          if (err) return reject(err);

          this.imap.search(
            ["ALL", ["SINCE", dayjs().subtract(2, "day").format("DD-MMM-YYYY")]],
            (err: any, results: any) => {
              if (err) return reject(err);

              if (results.length === 0) {
                this.imap.end();
                return resolve(websites);
              }

              const f = this.imap.fetch(results, { bodies: "" });
              const emailPromises: Promise<void>[] = [];

              f.on("message", (msg: any, seqno: any) => {
                const emailProcessing = new Promise<void>((resolveEmail) => {
                  msg.on("body", (stream: any, info: any) => {
                    simpleParser(stream, async (err: any, parsed: any) => {
                      if (err) {
                        console.error("Error parsing email: ", err);
                        return resolveEmail();
                      }

                      const emailBody = parsed.text || parsed.html;
                      const fromEmail = parsed.from?.text.match(/<(.*?)>/)?.[1];
                      console.log(`Email- ${fromEmail}`);

                      if (fromEmail) {
                        try {
                          const masjidData = await findMasjidByEmail(fromEmail);
                          if (masjidData) {
                            for (const masjid of masjidData) {
                              if (masjid.externalLinks[1]?.url) {
                                logger.info(`Masjid- ${masjid.masjidName} , Masjid ID- ${masjid._id}`);

                                try {
                                  const prayerTimes = await this.getPrayerTimesByMasjidId(masjid._id);
                                  if (prayerTimes) {
                                    // console.log(`MasjidId ${masjid._id} PrayerTimes: `, prayerTimes);
                                    websites.push({
                                      masjidId: masjid._id,
                                      masjidName: masjid.masjidName,
                                      website: masjid.externalLinks[1].url,
                                      masjidWhatsappId: masjid.externalLinks[3]?.url?.endsWith('@g.us') ? masjid.externalLinks[3].url : "No WhatsApp ID",
                                      body: emailBody,
                                      prayerTimes,
                                    });
                                  }
                                } catch (error) {
                                  console.error("Failed to fetch prayer times:", error);
                                }
                              }
                            }
                          } else {
                            console.log(`No data for Masjid with email- ${fromEmail}`);
                          }
                        } catch (err) {
                          console.error("Error fetching Masjid data: ", err);
                        }
                      }
                      resolveEmail();
                    });
                  });
                });

                emailPromises.push(emailProcessing);
              });

              f.once("end", () => {
                Promise.all(emailPromises).then(() => {
                  this.imap.end();
                  resolve(websites);
                });
              });
            }
          );
        });
      });

      this.imap.once('error', (err) => {
        if (err.code === 'EPIPE') {
          console.error('IMAP server closed the connection:', err);
        } else {
          console.error('IMAP error occurred:', err);
        }
        this.imap.end();
      });

      this.imap.connect();
    });
  }
}

export default EmailProcessor;
