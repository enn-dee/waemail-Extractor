"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchEmails = void 0;
const node_imap_1 = __importDefault(require("node-imap"));
const mailparser_1 = require("mailparser");
const dotenv_1 = __importDefault(require("dotenv"));
const dayjs_1 = __importDefault(require("dayjs"));
const logger_1 = require("../utils/logger");
const mazjidFromdb_1 = require("./mazjidFromdb");
dotenv_1.default.config();
const imapuser = process.env.IMAP_USER;
const imaphost = process.env.IMAP_HOST;
const imappass = process.env.IMAP_PASSWORD;
const fetchEmails = async () => {
    const imap = new node_imap_1.default({
        user: imapuser,
        password: imappass,
        host: imaphost,
        port: parseInt(process.env.IMAP_PORT || "993"),
        tls: true,
        authTimeout: 30000,
        connTimeout: 30000,
        tlsOptions: { rejectUnauthorized: false },
    });
    const openInbox = (cb) => {
        imap.openBox("INBOX", true, cb);
    };
    const websites = [];
    return new Promise((resolve, reject) => {
        imap.once("ready", function () {
            openInbox(async function (err, box) {
                if (err)
                    return reject(err);
                imap.search(["ALL", ["SINCE", (0, dayjs_1.default)().subtract(2, "day").format("DD-MMM-YYYY")]], function (err, results) {
                    if (err)
                        return reject(err);
                    if (results.length === 0) {
                        imap.end();
                        return resolve(websites);
                    }
                    const f = imap.fetch(results, { bodies: "" });
                    f.on("message", function (msg, seqno) {
                        msg.on("body", function (stream, info) {
                            (0, mailparser_1.simpleParser)(stream, async (err, parsed) => {
                                if (err) {
                                    console.error("Error parsing email: ", err);
                                    return;
                                }
                                const fromEmail = parsed.from?.text.match(/<(.*?)>/)?.[1];
                                if (fromEmail) {
                                    const masjidData = await (0, mazjidFromdb_1.findMasjidByEmail)(fromEmail);
                                    if (masjidData) {
                                        masjidData.forEach((masjid) => {
                                            if (masjid.externalLinks[1]?.url) {
                                                logger_1.logger.info(`Masjid- ${masjid.masjidName} , data- ${masjidData}`);
                                                websites.push({
                                                    masjidName: masjid.masjidName,
                                                    website: masjid.externalLinks[1].url,
                                                });
                                            }
                                        });
                                    }
                                    else {
                                        console.log(`No data for Masjid with email- ${fromEmail}`);
                                    }
                                }
                            });
                        });
                    });
                    f.once("end", function () {
                        imap.end();
                        resolve(websites);
                    });
                });
            });
        });
        imap.once("error", function (err) {
            reject(err);
        });
        imap.connect();
    });
};
exports.fetchEmails = fetchEmails;
