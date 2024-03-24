#!/usr/bin/env node

/*
This script loops through the hyperschedule github and pulls the github username of everyone who has written at
least one commit or opened an issue. The result is saved to contributors.json

Sorry for writing this thing in vanilla JS. I don't want to put this file in backend, which means we can't run it through
ts-node without unnecessarily introducing it as a dependency.
 */

import { writeFileSync } from "fs";

const names = new Set();

const token = process.argv[2];
if (token === undefined)
    // we need API token because we would hit rate limit otherwise. for testing, a personal access token
    // with no permission is enough (it raises the rate limit from 60/hr to 5000/hr)
    throw Error(
        "Please supply a GitHub API token as the first command-line argument",
    );

const API_TOKEN = `Bearer ${token}`;

// API at https://docs.github.com/en/rest/commits/commits?apiVersion=2022-11-28#list-commits
async function treeFetch(start, getName) {
    const contents = [];
    let next = start,
        last;
    let completed = false;
    do {
        if (next === last) completed = true;

        let resp = await fetch(next, {
            headers: {
                "X-GitHub-Api-Version": "2022-11-28",
                Accept: "application/json",
                Authorization: API_TOKEN,
            },
        });
        if (!resp.ok) {
            console.error(resp.headers);
            throw Error(resp.statusText);
        }

        const links = resp.headers.get("Link").toLocaleLowerCase().split(",");
        const rel = new Map(
            links.map((l) =>
                l
                    .match(/<(.+?)>; rel="(.+?)"/)
                    .slice(1, 3)
                    .reverse(),
            ),
        );

        next = rel.get("next");
        last = rel.get("last");

        contents.push(resp.json());
    } while (!completed);

    const allData = await Promise.all(contents);
    for (const data of allData) {
        for (const entry of data) {
            names.add(getName(entry));
        }
    }
}

const masterSHA = await (
    await fetch(
        "https://api.github.com/repos/hyperschedule/hyperschedule/commits/legacy",
        {
            headers: {
                "X-GitHub-Api-Version": "2022-11-28",
                Accept: "application/vnd.github.sha",
                Authorization: API_TOKEN,
            },
        },
    )
).text();

const commit = (obj) => obj.author?.login;
const issue = (obj) => obj.user?.login;

// we don't use promise-all here because the insertion order determines the final order on the list,
// and we want to have the new code first, then the old code, and lastly issues
await treeFetch(
    `https://api.github.com/repos/hyperschedule/hyperschedule/commits?per_page=100`,
    commit,
);
console.log("Loaded contributors from v2");

await treeFetch(
    `https://api.github.com/repos/hyperschedule/hyperschedule/commits?per_page=100&sha=${masterSHA}`,
    commit,
);
console.log("Loaded contributors from master");

await treeFetch(
    "https://api.github.com/repos/hyperschedule/hyperschedule/issues?state=all&per_page=100",
    issue,
);
console.log("Loaded contributors from issues and PRs");

const filtered = [...names].filter((n) => n && !n.endsWith("[bot]"));

const result = await Promise.all(
    filtered.map(async (username) => {
        const resp = await fetch("https://api.github.com/users/" + username, {
            headers: {
                "X-GitHub-Api-Version": "2022-11-28",
                Accept: "application/json",
                Authorization: API_TOKEN,
            },
        });
        const profile = await resp.json();

        return { username, name: profile.name ?? null };
    }),
);

console.log("All names resolved");

writeFileSync("contributors.json", JSON.stringify(result, null, 2));
