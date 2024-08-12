import { Client } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";

export const startWhatsAppClient = () => {
  const client = new Client();

  client.on("qr", (qr) => {
    qrcode.generate(qr, { small: true });
  });

  client.on("ready", () => {
    console.log("WhatsApp Client is ready!");
  });

  client.on("message", (message) => {
    console.log(`Received message: ${message.body}`);
  });

  client.initialize();
};
