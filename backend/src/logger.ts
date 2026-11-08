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

type CustomLevels = pino.Level | "parserWarn";
const levels = {
    ...pino.levels.values,
    parserWarn: 55,
} as { [level in CustomLevels]: number };

// eslint-disable-next-line
function buildLogger(stream?: pino.DestinationStream) {
    return pino<CustomLevels>(
        {
            level: "trace",
            customLevels: levels,
            timestamp: pino.stdTimeFunctions.isoTime,
            formatters: {
                level: (label) => {
                    return { level: label.toUpperCase() };
                },
            },
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
        stream,
    );
}

// eslint-disable-next-line
function createRootLogger() {
    switch (env) {
        case "development":
            // Shared options between stdout and stderr logs
            let prettyOptions = {
                sync: true,
                ignore: "pid,hostname",
                customLevels: levels,
                colorize: true,
                customColors: { parserwarn: "red" }, // Uppercase title converted to lowercase
                useOnlyCustomProps: false,
            };

            return buildLogger(
                pino.multistream(
                    [
                        {
                            // Everything above this error level is sent to stdout
                            level: "trace",
                            stream: pretty({
                                ...prettyOptions,
                                destination: 1,
                            }),
                        },
                        {
                            // Everything above this error level is sent to stderr
                            level: "warn",
                            stream: pretty({
                                ...prettyOptions,
                                destination: 2,
                            }),
                        },
                    ],
                    {
                        levels,
                        dedupe: true,
                    },
                ),
            );
        case "test":
            return buildLogger({ write() {} });
        case "production":
            return buildLogger(
                pino.multistream(
                    [
                        {
                            // Everything above this error level is sent to stdout
                            level: "trace",
                            stream: process.stdout,
                        },
                        {
                            // Everything above this error level is sent to stderr
                            level: "warn",
                            stream: process.stderr,
                        },
                    ],
                    {
                        levels,
                        dedupe: true,
                    },
                ),
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
