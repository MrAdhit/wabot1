import * as fs from "fs";
import WAWebJS, { Client, MessageMedia } from "whatsapp-web.js";
import parse from "url-parse";
import { hash } from "../hasher";
import * as lib from "../lib";
import ytdl from "ytdl-core";

let client: Client;

interface Command {
    [command: string]: {
        invoke: (message: WAWebJS.Message, args: string[]) => void;
    };
}

const Commands: Command = {
    ping: {
        invoke(message, args) {
            message.reply("pong");
        },
    },
    download: {
        invoke(message, args) {
            let type = args[0];
            args.shift();
            let url = parse(args[0]);

            if (!["mp3", "mp4"].includes(type)) return;
            if (
                !["youtu.be", "youtube.com", "www.youtube.com"].includes(
                    url.host
                )
            )
                return;

            if (type.includes("mp4")) {
                message.reply("MP4 is not yet supported");
                return;
            }

            lib.createThread(async () => {
                let vidInfo = await ytdl.getInfo(url.href);

                if (parseInt(vidInfo.videoDetails.lengthSeconds) > 300) {
                    message.reply(
                        "Video duration is too long. (Maximum 5 minutes)"
                    );
                    return;
                }

                let downloading = await client.sendMessage(
                    message.from,
                    "Downloading MP3"
                );

                let filePath = `./cache/${vidInfo.videoDetails.title.replace(
                    /\s+/g,
                    "_"
                )}.mp3`;

                let upload = async () => {
                    downloading.delete(true);
                    let uploading = await client.sendMessage(
                        message.from,
                        "Uploading MP3"
                    );

                    let media = MessageMedia.fromFilePath(filePath);

                    await client.sendMessage(message.from, media, {
                        sendMediaAsDocument: true,
                    });
                    uploading.delete(true);
                };

                if (fs.existsSync(filePath)) {
                    upload();
                    return;
                }

                let vid = ytdl(url.href, {
                    quality: "highestaudio",
                });
                vid.pipe(fs.createWriteStream(filePath)).on("finish", () => {
                    upload();
                });
            });
        },
    },
};

export function handle(message: WAWebJS.Message, c: Client) {
    client = c;
    let identifier = new hash(message.from).identifier;

    let content = message.body.split(" ");
    let command: string = content[0];
    content.shift();
    let args = content;

    if (!Object.keys(Commands).includes(command)) return;

    console.log(`User "${identifier}" is executing command "${command}"`);
    Commands[command].invoke(message, args);
}
