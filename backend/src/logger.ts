import pino from "pino";
import pretty from "pino-pretty";

let env = process.env.NODE_ENV;

if (env === undefined) {
    // we use console because nothing else has loaded yet
    // eslint-disable-next-line no-console
    console.warn(
        `(logger.ts) process.env.NODE_ENV not set, assuming development...`,
    );
    env = "development";
}

let rootLogger: pino.Logger;

switch (env) {
    case "development":
        /* eslint-disable-next-line */
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
                        destination: "/var/log/hyperschedule/backend.log",
                        mkdir: true,
                    },
                },
                {
                    target: "pino/file",
                    level: "error",
                    options: {
                        destination: "/var/log/hyperschedule/backend.error.log",
                        mkdir: true,
                    },
                },
                {
                    target: "pino/file",
                    level: "info",
                    options: {
                        destination: 1, // STDOUT
                        mkdir: true,
                    },
                },
            ],
        });
        rootLogger = pino(transport);
        break;
    default:
        rootLogger = pino();
}

export { rootLogger };

// module should be a string in the format such as `db.user`
export function createLogger(module: string) {
    return rootLogger.child({ module });
}
