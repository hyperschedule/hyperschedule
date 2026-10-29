// Setup webhook if it exists
const WEBHOOK_URL = process.env.DISCORD_ERROR_WEBHOOK;
let enableDiscord = WEBHOOK_URL ? true : false;

export enum SeverityLevel {
    Trace = ":pen_ballpoint: Trace",
    Info = ":information_source: Info",
    Warn = ":scream: Warn",
    Error = ":skull: Error",
}

// Embed hex colors for respective SeverityLevel values
const levelColors: Record<SeverityLevel, string> = {
    ":pen_ballpoint: Trace": "acbdba",
    ":information_source: Info": "00798c",
    ":scream: Warn": "edae49",
    ":skull: Error": "d1495b",
};

// Send fancy embed error messages at specified error level
// with module in footer and content in code block
export async function logDiscord(
    level: SeverityLevel,
    module: string,
    content: unknown,
): Promise<void> {
    if (!enableDiscord) {
        return;
    }

    if (typeof content === "object" && content !== null) {
        content = JSON.stringify(content, null, 4);
    }

    const embed = {
        title: level,
        description: `\`\`\`${String(content)}\`\`\``,
        // Colors need to be converted from hex to decimal
        color: parseInt(levelColors[level], 16),
        footer: {
            text: module,
        },
        timestamp: new Date().toISOString(),
    };

    await fetch(WEBHOOK_URL!, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ embeds: [embed] }),
    });
}
