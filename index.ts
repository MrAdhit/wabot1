import { Client, LocalAuth } from "whatsapp-web.js";
import * as command from "./handler/command";
import * as lib from "./lib";

const client = new Client({
    authStrategy: new LocalAuth(),
});

client.on("qr", (qr) => {
    lib.drawQR(qr);
});

client.on("ready", () => {
    console.log(`Bot is ready!`);
    lib.quitWindow();
});

client.on("message", (message) => {
    command.handle(message, client);
});

client.initialize();
