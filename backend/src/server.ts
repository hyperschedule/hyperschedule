import fastify from "fastify";

const server = fastify();
import fs from "fs";

const courses = JSON.parse(
    fs.readFileSync("./src/hmc-api/sample/parsed-sample-v4.json", {
        encoding: "utf-8",
    }),
);

server.get("/v4/courses", async (request, response) => {
    return courses;
});

server.listen({ port: 8080 }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(0);
    }
    console.log(`Server listening at ${address}`);
});
