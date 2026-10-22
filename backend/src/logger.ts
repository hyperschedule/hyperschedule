import pino from "pino";
import pretty from "pino-pretty";
import { SeverityLevel, logDiscord } from "./reporter";

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

const levels = {
    parserWarn: 55, // between error (50) and fatal (60)
};

// eslint-disable-next-line
function buildLogger(stream?: pino.DestinationStream) {
    return pino(
        {
            customLevels: levels,
            // useOnlyCustomLevels: true,
            level: "trace",
            hooks: {
                logMethod(inputArgs, method, level) {
                    if (level === levels.parserWarn) {
                        const { module } = this.bindings();

                        void logDiscord(SeverityLevel.Error, module, inputArgs);
                    }
                    return method.apply(this, inputArgs);
                },
            },
        },
        stream!,
    );
}

// eslint-disable-next-line
function createRootLogger() {
    switch (env) {
        case "development":
            return buildLogger(
                pretty({
                    sync: true,
                    ignore: "pid,hostname",
                }),
            );
        case "test":
            return buildLogger(
                pino.transport({
                    target: "pino/file",
                    options: { destination: "/dev/null", level: "error" },
                }),
            );
        case "production":
            return buildLogger(
                pino.transport({
                    levels, // Add in our custom level value
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
                            level: "parserWarn",
                            options: {
                                destination: `/var/log/hyperschedule/${processName}.error.log`,
                                mkdir: true,
                            },
                        },
                        {
                            target: "pino/file",
                            level: "info",
                            options: { destination: 1 }, // STDOUT
                        },
                    ],
                }),
            );
        default:
            return buildLogger();
    }
}

const rootLogger = createRootLogger();

// eslint-disable-next-line
export function createLogger(module: string) {
    // module should be a string in the format such as `db.user`
    return rootLogger.child({ module });
}
