import Imap from "node-imap";
import EventEmitter from "events";
import StorageService from "../models/file-storage/index";
// import mobileAppModel from "models/mobileApp.model";
import Social, { ISocial, SocialSource } from "../models/social.model";
// import NotificationFactory from "modules/firebase/Notification";
import dotenv from "dotenv";
import dayjs from "dayjs";
import { Attachment, simpleParser } from "mailparser";
import masjidModel , {IMasjid}from "../models/mazjid.model";
import { v4 as uuidv4 } from "uuid";
// import Notification from "models/notification.model";
import mongoose from "mongoose";
import { AiDataExtraction } from "../modules/openai";
import TimingRepository from "../repository/Timing.repo";
// 
enum EmailMessageType {
    ADD = 90,
    UPDATE = 91,
    DELETE = 92,
}

dotenv.config();

export default class EmailService {
    private static instance: EmailService = new this();
    private storageService: StorageService = StorageService.instance;
    private eventEmitter: EventEmitter = new EventEmitter();
    private imap: Imap;
    private constructor() {
        // this.eventEmitter.on("SocialEmail", this.handleNotification);
        this.imap = new Imap({
            user: process.env.IMAP_USER as string,
            password: process.env.IMAP_PASSWORD as string,
            host: process.env.IMAP_HOST as string,
            port: Number(process.env.IMAP_PORT),
            tls: true,
        });
    }

    public static get service() {
        return this.instance;
    }

    // private handleNotification = async (
    //     data: ISocial,
    //     type: EmailMessageType,
    // ): Promise<void> => {
    //     try {
    //         const tokens = await mobileAppModel.find({
    //             $or: [
    //                 { defaultMasjids: { $in: [data.masjidId] } },
    //                 {
    //                     favoriteMasjids: { $in: [data.masjidId] },
    //                 },
    //             ],
    //         });
    //         const payload = {
    //             title: "New Social Post",
    //             body: data.message,
    //             data: {
    //                 masjidId: data.masjidId.toString(),
    //                 _id: data._id?.toString(),
    //                 type: type.toString(),
    //             },
    //         };
    //         const androidTokens = tokens
    //             .filter((token) => token.device === "android")
    //             .map((token) => token.fcm);
    //         const iosTokens = tokens
    //             .filter((token) => token.device === "ios")
    //             .map((token) => token.fcm);
    //         await Promise.all([
    //             NotificationFactory.fn.sendToMultiple(
    //                 androidTokens,
    //                 payload.title,
    //                 payload.body,
    //                 payload.data,
    //                 "android",
    //             ),
    //             NotificationFactory.fn.sendToMultiple(
    //                 iosTokens,
    //                 payload.title,
    //                 payload.body,
    //                 payload.data,
    //                 "ios",
    //             ),
    //         ]);

    //         const notification = new Notification({
    //           title: payload.title || "New update available",
    //           body: payload.body || "New update available",
    //           type,
    //           payload: payload.data,
    //           asset: "",
    //           masjidId: new mongoose.Types.ObjectId(payload.data.masjidId),
    //           expiresAt: dayjs().add(10, "days").toDate(),
    //           createdBy: new mongoose.Types.ObjectId(payload.data.masjidId),
    //         });
      
    //         await notification.save();
    //     } catch (error) {
    //         console.error(error);
    //     }
    // };

    private getMasjid = async (emailPayload: string): Promise<IMasjid | null> => {
        let email = emailPayload.toLowerCase();
        if (email.includes("<")) {
            email = email.split("<")[1].split(">")[0];
        }
        const masjid = await masjidModel.findOne({
            "externalLinks.url": {
                $regex: email,
            },
        });
        if (!masjid) {
            return null;
        }

        return masjid;
    };

    private openInbox = (cb: (err: Error | null, box: Imap.Box) => void) => {
        this.imap.openBox("INBOX", false, cb);
    };

    private handleMedia = async (
        attachment: Attachment,
        masjidId: string,
    ): Promise<string> => {
        try {
            const fileName = `${masjidId}/email/${uuidv4()}-${attachment.filename}`;
            const url = await this.storageService.uploadFile(
                attachment.content,
                fileName,
            );
            return `${process.env.AWS_S3_BASE_URL}/${url}`;
        } catch (err) {
            console.log(err);
            return "";
        }
    };

    private handleNewMessage = (msg: Imap.ImapMessage, seqno: number) => {
        try {
            console.log("Message #%d", seqno);
            let body: string = "";
            let attributes: Imap.ImapMessageAttributes;
            msg.on("body", (stream) => {
                stream.on("data", (chunk) => {
                    body += chunk.toString("utf8");
                });
            });
            msg.once("attributes", (attrs) => {
                attributes = attrs;
            });

            msg.once("end", async () => {
                const parsed = await simpleParser(body);
                const data = {
                    from: parsed.from?.text,
                    subject: parsed.subject,
                    text: parsed.text,
                    html: parsed.html,
                    date: parsed.date,
                    attachments: parsed.attachments,
                    uuid: parsed.messageId,
                };
                if (!data.from) {
                    return;
                }
                if (parsed.from && parsed.from.value && parsed.from.value.length > 0) {
                    const fromAddress = parsed.from.value[0].address;
                    const fromName = parsed.from.value[0].name || "Unknown Name";
                    console.log(`From: ${fromName} <${fromAddress}>`);
                }
                data.text = data.text?.replaceAll(data.from, "");
                data.text = data.text?.replaceAll(
                    process.env.EMAIL_ADDRESS as string,
                    "",
                );
                data.text = data.text?.replaceAll("unsubscribe", "");
                if (data.html) {
                    data.html = data.html.replaceAll(data.from, "");
                    data.html = data.html.replaceAll(
                        process.env.EMAIL_ADDRESS as string,
                        "",
                    );
                    data.html = data.html.replaceAll("unsubscribe", "");
                }

                if (!data.text) {
                    return;
                }

                const masjid = await this.getMasjid(data.from);
                if (!masjid) {
                    this.imap.addFlags(attributes.uid, ["\\Seen"], (addFlagsError) => {
                        if (addFlagsError) {
                            console.error("Error marking email as read:", addFlagsError);
                        } else {
                            console.log(`Email marked as read with UID ${attributes.uid}`);
                        }
                    });
                } else {
                    const timing = await AiDataExtraction(data.text);
                    if (timing) {
                        await TimingRepository.repository.handleTiming(
                            masjid._id,
                            timing,
                            "email",
                            new mongoose.Types.ObjectId(),
                        );
                    }
                    const urls: string[] = [];
                    if (data.attachments) {
                        for (let i = 0; i < data.attachments.length; i++) {
                            const attachment = data.attachments[i];
                            const url = await this.handleMedia(
                                attachment,
                                masjid._id.toString(),
                            );
                            urls.push(url);
                        }
                    }
                    const newSocial = await Social.create({
                        masjidId: masjid._id,
                        message: data.text,
                        html_message: data.html,
                        attachments: urls,
                        messageId: attributes.uid,
                        source: SocialSource.EMAIL,
                    });
                    this.eventEmitter.emit(
                        "SocialEmail",
                        newSocial,
                        EmailMessageType.ADD,
                    );
                    this.imap.addFlags(attributes.uid, "Deleted", (addFlagsError) => {
                        if (addFlagsError) {
                            console.error("Error marking email as read:", addFlagsError);
                        } else {
                            console.log(`Email removed with UID ${attributes.uid}`);
                        }
                    });
                }
            });
        } catch (error) {
            console.error(error);
        }
    };
   
    
    
    private readUnseenMessages = () => {
        this.openInbox((err) => {
            if (err) throw err;
            this.imap.search(
                ["UNSEEN", ["SINCE", dayjs().subtract(1, "day").format("DD-MMM-YYYY")]],
                (err, results) => {
                    if (err) throw err;
                    if (results.length > 0) {
                        const f = this.imap.fetch(results, { bodies: "" });
                        f.on("message", this.handleNewMessage);
                        f.once("error", (err) => console.log("Fetch error: " + err));
                        f.once("end", () => console.log("Done fetching all messages!"));
                    }
                },
            );
        });
    };

    private handleReady = () => {
        this.openInbox((err, box) => {
            if (err) throw err;
            console.log(`You have ${box.messages.total} message(s)`);
            this.imap.on("mail", (numNewMsgs) => {
                console.log(`You hav e ${numNewMsgs} new message(s)`);
                // this.readUnseenMessages();
            });
        });
    };

    public init = async () => {
        this.imap.once("ready", this.handleReady);
        this.imap.once("error", () => {
            this.imap.end();
        });
        this.imap.once("end", () => {
            console.log("Connection ended");
            this.imap.connect();
        });

        this.imap.connect();
    };


}
