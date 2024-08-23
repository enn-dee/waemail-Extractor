import Imap from "node-imap";
import { simpleParser } from "mailparser";
import dotenv from "dotenv";
import dayjs from "dayjs";
import { logger } from "../utils/logger";
import { findMasjidByEmail } from "./mazjidFromdb";

dotenv.config();

const imapuser = process.env.IMAP_USER;
const imaphost = process.env.IMAP_HOST;
const imappass = process.env.IMAP_PASSWORD;

export const fetchEmails = async (): Promise<any[]> => {
  const imap = new Imap({
    user: imapuser as string,
    password: imappass as string,
    host: imaphost as string,
    port: parseInt(process.env.IMAP_PORT || "993"),
    tls: true,
    authTimeout: 30000,
    connTimeout: 30000,
    // tlsOptions: { rejectUnauthorized: false },
  });

  const openInbox = (cb: any) => {
    imap.openBox("INBOX", true, cb);
  };

  const websites: any[] = [];

  return new Promise((resolve, reject) => {
    imap.once("ready", function () {
      openInbox(async function (err: any, box: any) {
        if (err) return reject(err);

        imap.search(
          ["ALL", ["SINCE", dayjs().subtract(2, "day").format("DD-MMM-YYYY")]],
          function (err: any, results: any) {
            if (err) return reject(err);

            if (results.length === 0) {
              imap.end();
              return resolve(websites);
            }

            const f = imap.fetch(results, { bodies: "" });

            f.on("message", function (msg: any, seqno: any) {
              msg.on("body", function (stream: any, info: any) {
                simpleParser(stream, async (err: any, parsed: any) => {
                  if (err) {
                    console.error("Error parsing email: ", err);
                    return;
                  }

                  const fromEmail = parsed.from?.text.match(/<(.*?)>/)?.[1];
                  // console.log(`Text: ${parsed.text}`);
                  // console.log(`Subject: ${parsed.subject}`);
                  console.log(`Email- ${fromEmail}`);

                  if (fromEmail) {
                    const masjidData = await findMasjidByEmail(fromEmail);
                    if (masjidData) {
                      masjidData.forEach((masjid: any) => {
                        if (masjid.externalLinks[1]?.url) {
                          logger.info(
                            `Masjid- ${masjid.masjidName} , Masjid ID- ${masjid._id}`
                          );
                          websites.push({
                            masjidId: masjid._id,
                            masjidName: masjid.masjidName,
                            website: masjid.externalLinks[1].url,
                            masjidWhatsappId: masjid.externalLinks[3]?.url?.endsWith('@g.us') ? masjid.externalLinks[3].url : "No WhatsApp ID",
                            body: parsed.text
                          });
                        }
                      });
                    } else {
                      console.log(
                        `No data for Masjid with email- ${fromEmail}`
                      );
                    }
                  }
                });
              });
            });

            f.once("end", function () {
              imap.end();
              resolve(websites);
            });
          }
        );
      });
    });
    imap.once('error', (err) => {
      if (err.code === 'EPIPE') {
        console.error('IMAP server closed the connection:', err);
      } else {
        console.error('IMAP error occurred:', err);
      }
      imap.end();
    });

    // imap.once("error", function (err: any) {
    //   reject(err);
    // });

    imap.connect();
  });
};
