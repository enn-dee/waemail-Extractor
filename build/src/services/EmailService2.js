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
const node_imap_1 = __importDefault(require("node-imap"));
const events_1 = __importDefault(require("events"));
const index_1 = __importDefault(require("../models/file-storage/index"));
// import mobileAppModel from "models/mobileApp.model";
const social_model_1 = __importStar(require("../models/social.model"));
// import NotificationFactory from "modules/firebase/Notification";
const dotenv_1 = __importDefault(require("dotenv"));
const dayjs_1 = __importDefault(require("dayjs"));
const mailparser_1 = require("mailparser");
const mazjid_model_1 = __importDefault(require("../models/mazjid.model"));
const uuid_1 = require("uuid");
// import Notification from "models/notification.model";
const mongoose_1 = __importDefault(require("mongoose"));
const openai_1 = require("../modules/openai");
const Timing_repo_1 = __importDefault(require("../repository/Timing.repo"));
// 
var EmailMessageType;
(function (EmailMessageType) {
    EmailMessageType[EmailMessageType["ADD"] = 90] = "ADD";
    EmailMessageType[EmailMessageType["UPDATE"] = 91] = "UPDATE";
    EmailMessageType[EmailMessageType["DELETE"] = 92] = "DELETE";
})(EmailMessageType || (EmailMessageType = {}));
dotenv_1.default.config();
class EmailService {
    static instance = new this();
    storageService = index_1.default.instance;
    eventEmitter = new events_1.default();
    imap;
    constructor() {
        // this.eventEmitter.on("SocialEmail", this.handleNotification);
        this.imap = new node_imap_1.default({
            user: process.env.IMAP_USER,
            password: process.env.IMAP_PASSWORD,
            host: process.env.IMAP_HOST,
            port: Number(process.env.IMAP_PORT),
            tls: true,
        });
    }
    static get service() {
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
    getMasjid = async (emailPayload) => {
        let email = emailPayload.toLowerCase();
        if (email.includes("<")) {
            email = email.split("<")[1].split(">")[0];
        }
        const masjid = await mazjid_model_1.default.findOne({
            "externalLinks.url": {
                $regex: email,
            },
        });
        if (!masjid) {
            return null;
        }
        return masjid;
    };
    openInbox = (cb) => {
        this.imap.openBox("INBOX", false, cb);
    };
    handleMedia = async (attachment, masjidId) => {
        try {
            const fileName = `${masjidId}/email/${(0, uuid_1.v4)()}-${attachment.filename}`;
            const url = await this.storageService.uploadFile(attachment.content, fileName);
            return `${process.env.AWS_S3_BASE_URL}/${url}`;
        }
        catch (err) {
            console.log(err);
            return "";
        }
    };
    handleNewMessage = (msg, seqno) => {
        try {
            console.log("Message #%d", seqno);
            let body = "";
            let attributes;
            msg.on("body", (stream) => {
                stream.on("data", (chunk) => {
                    body += chunk.toString("utf8");
                });
            });
            msg.once("attributes", (attrs) => {
                attributes = attrs;
            });
            msg.once("end", async () => {
                const parsed = await (0, mailparser_1.simpleParser)(body);
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
                data.text = data.text?.replaceAll(process.env.EMAIL_ADDRESS, "");
                data.text = data.text?.replaceAll("unsubscribe", "");
                if (data.html) {
                    data.html = data.html.replaceAll(data.from, "");
                    data.html = data.html.replaceAll(process.env.EMAIL_ADDRESS, "");
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
                        }
                        else {
                            console.log(`Email marked as read with UID ${attributes.uid}`);
                        }
                    });
                }
                else {
                    const timing = await (0, openai_1.AiDataExtraction)(data.text);
                    if (timing) {
                        await Timing_repo_1.default.repository.handleTiming(masjid._id, timing, "email", new mongoose_1.default.Types.ObjectId());
                    }
                    const urls = [];
                    if (data.attachments) {
                        for (let i = 0; i < data.attachments.length; i++) {
                            const attachment = data.attachments[i];
                            const url = await this.handleMedia(attachment, masjid._id.toString());
                            urls.push(url);
                        }
                    }
                    const newSocial = await social_model_1.default.create({
                        masjidId: masjid._id,
                        message: data.text,
                        html_message: data.html,
                        attachments: urls,
                        messageId: attributes.uid,
                        source: social_model_1.SocialSource.EMAIL,
                    });
                    this.eventEmitter.emit("SocialEmail", newSocial, EmailMessageType.ADD);
                    this.imap.addFlags(attributes.uid, "Deleted", (addFlagsError) => {
                        if (addFlagsError) {
                            console.error("Error marking email as read:", addFlagsError);
                        }
                        else {
                            console.log(`Email removed with UID ${attributes.uid}`);
                        }
                    });
                }
            });
        }
        catch (error) {
            console.error(error);
        }
    };
    readUnseenMessages = () => {
        this.openInbox((err) => {
            if (err)
                throw err;
            this.imap.search(["UNSEEN", ["SINCE", (0, dayjs_1.default)().subtract(1, "day").format("DD-MMM-YYYY")]], (err, results) => {
                if (err)
                    throw err;
                if (results.length > 0) {
                    const f = this.imap.fetch(results, { bodies: "" });
                    f.on("message", this.handleNewMessage);
                    f.once("error", (err) => console.log("Fetch error: " + err));
                    f.once("end", () => console.log("Done fetching all messages!"));
                }
            });
        });
    };
    handleReady = () => {
        this.openInbox((err, box) => {
            if (err)
                throw err;
            console.log(`You have ${box.messages.total} message(s)`);
            this.imap.on("mail", (numNewMsgs) => {
                console.log(`You hav e ${numNewMsgs} new message(s)`);
                // this.readUnseenMessages();
            });
        });
    };
    init = async () => {
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
exports.default = EmailService;
