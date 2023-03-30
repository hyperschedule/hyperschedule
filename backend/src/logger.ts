import pino from "pino";
import pretty from "pino-pretty";

let rootLogger: pino.Logger | null = null;

// processName is a string name of the process. e.g. server, fetcher, etc.
// used to separate log files
export function createRootLogger(processName: string) {
    let env = process.env.NODE_ENV;

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
                ],
            });
            rootLogger = pino({ level: "trace" }, transport);
            break;
        default:
            rootLogger = pino();
    }
}

// module should be a string in the format such as `db.user`
export function createLogger(module: string): pino.Logger {
    if (rootLogger === null)
        if (process.env.NODE_ENV === "test") createRootLogger("test");
        else
            throw Error("Root logger not created. Call createRootLogger first");
    return rootLogger!.child({ module });
}
