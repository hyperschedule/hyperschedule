import pino from "pino";
import pretty from "pino-pretty";

let rootLogger: pino.Logger | null = null;
let env = process.env.NODE_ENV;
let processName = process.env.PROCESS_NAME;
if (processName === undefined) {
    throw Error("PROCESS_NAME environment variable is undefined");
}

if (env === undefined) {
    // we use console because nothing else has loaded yet
    // eslint-disable-next-line no-console
    console.warn(
        `(logger.ts) process.env.NODE_ENV not set, assuming development...`,
    );
    env = "development";
}

switch (env) {
    case "development":
        rootLogger = pino(
            { level: "trace" },
            pretty({
                // colorize: true,
                sync: true,
                ignore: "pid,hostname",
            }),
        );
        break;
    case "test":
        rootLogger = pino(
            pino.transport({
                target: "pino/file",
                options: { destination: "/dev/null", level: "error" },
            }),
        );
        break;
    case "production":
        const transport = pino.transport({
            targets: [
                {
                    target: "pino/file",
                    level: "trace",
                    options: {
                        destination: `/var/log/hyperschedule/${processName}.log`,
                        mkdir: true,
                    },
                },
                {
                    target: "pino/file",
                    level: "error",
                    options: {
                        destination: `/var/log/hyperschedule/${processName}.error.log`,
                        mkdir: true,
                    },
                },
                {
                    target: "pino/file",
                    level: "info",
                    options: {
                        destination: 1, // STDOUT
                    },
                },
                ...(process.env.DISCORD_WEBHOOK_URL
                    ? [
                          {
                              target: "./discordTransport.mjs",
                              level: "error",
                              options: {
                                  webhookUrl: process.env.DISCORD_WEBHOOK_URL,
                                  webhookType: 1,
                              },
                          },
                      ]
                    : []),
            ],
        });
        rootLogger = pino({ level: "trace" }, transport);
        break;
    default:
        rootLogger = pino();
}

// module should be a string in the format such as `db.user`
export function createLogger(module: string): pino.Logger {
    return rootLogger!.child({ module });
}
