import createTransport from "pino-discord-transport";

const options = {
    webhookUrl: process.env.DISCORD_WEBHOOK_URL,
    webhookType: 1,
};

export default function transport() {
    return createTransport(options);
}
