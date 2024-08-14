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
        //debug: console.log,
    });
    const openInbox = (cb) => {
        imap.openBox("INBOX", true, cb);
    };
    imap.once("ready", function () {
        openInbox(function (err, box) {
            if (err)
                throw err;
            //will fetch mails of preivous 2 days
            // const DaysAgo = dayjs().subtract(2, "day").toDate();
            imap.search(["ALL", ["SINCE", (0, dayjs_1.default)().subtract(2, "day").format("DD-MMM-YYYY")]], function (err, results) {
                if (err) {
                    console.error("Search Error: ", err);
                    return;
                }
                if (results.length === 0) {
                    console.log("No emails found.");
                    imap.end();
                    return;
                }
                const f = imap.fetch(results, {
                    bodies: "",
                });
                f.on("message", function (msg, seqno) {
                    const prefix = "(#" + seqno + ") ";
                    msg.on("body", function (stream, info) {
                        (0, mailparser_1.simpleParser)(stream, (err, parsed) => {
                            if (err) {
                                console.error("Error parsing email: ", err);
                                return;
                            }
                            const subjectLower = (parsed.subject || "").toLowerCase();
                            console.log(`${prefix}Text: ${parsed.text}`);
                            // console.log(`${prefix}HTML: ${parsed.html}`);
                            console.log(`${prefix}From: ${parsed.from?.text}`);
                            // console.log(`${prefix}Subject: ${parsed.subject}`);
                        });
                    });
                });
                f.once("end", function () {
                    imap.end();
                });
            });
        });
    });
    imap.once("error", function (err) {
        console.error("IMAP Error: ", err);
    });
    imap.connect();
};
exports.fetchEmails = fetchEmails;
