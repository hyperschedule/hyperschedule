// Setup discord bot for logging error messages
import * as Discord from "discord.js";

const discordKey = process.env.DISCORD_KEY;
const channelId = String(process.env.CHANNEL_ID);

// Check if env variables are populated
if (!discordKey || !channelId) {
    throw Error(
        "discordKey and/or channelId not populated in backend env variables",
    );
}

// Create our reporting Discord client
const client = new Discord.Client({
    intents: [Discord.GatewayIntentBits.Guilds],
});
void client.login(discordKey);

export enum SeverityLevel {
    Trace = ":pen_ballpoint: Trace",
    Info = ":information_source: Info",
    Warn = ":scream: Warn",
    Error = ":skull: Error",
}

// Embed colors for respective SeverityLevel values
const levelColors: Record<SeverityLevel, [number, number, number]> = {
    ":pen_ballpoint: Trace": [172, 189, 186],
    ":information_source: Info": [0, 121, 140],
    ":scream: Warn": [237, 174, 73],
    ":skull: Error": [209, 73, 91],
};

export class discordReporter {
    module: string;

    constructor(module: string) {
        this.module = module;
    }

    async log(level: SeverityLevel, content: unknown): Promise<void> {
        // Wait for client to initialize before messaging
        if (!client.isReady()) {
            await new Promise<void>((resolve) => {
                client.once(Discord.Events.ClientReady, () => resolve());
            });
        }

        const channel = await client.channels.fetch(channelId);

        if (typeof content === "object" && content !== null) {
            content = JSON.stringify(content, null, 4);
        }
        const messageEmbed = new Discord.EmbedBuilder()
            .setColor(levelColors[level])
            .setFooter({ text: this.module })
            .setTitle(level)
            .setDescription(`\`\`\`${String(content)}\`\`\``)
            .setTimestamp();

        if (channel?.type === Discord.ChannelType.GuildText) {
            await channel.send({ embeds: [messageEmbed] });
        }
    }
}
