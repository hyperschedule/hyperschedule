#!/usr/bin/env node

/*
This script loops through the hyperschedule github and pulls the github username of everyone who has written at
least one commit or opened an issue. The result is saved to contributors.json

Sorry for writing this thing in vanilla JS. I don't want to put this file in backend, which means we can't run it through
ts-node without unnecessarily introducing it as a dependency.
 */

import { writeFileSync } from "fs";

const names = new Set();

// API at https://docs.github.com/en/rest/commits/commits?apiVersion=2022-11-28#list-commits
async function treeFetch(start, getName) {
    const contents = [];
    let next = start,
        last;
    do {
        let resp = await fetch(next, {
            headers: {
                "X-GitHub-Api-Version": "2022-11-28",
                Accept: "application/json",
            },
        });
        // we are using vanilla javascript so we get to use horribly unsafe code
        [next, last] = [...resp.headers.get("Link").matchAll(/<(.*?)>/g)].map(
            (m) => m[1],
        );
        contents.push(resp.json());
    } while (next !== last);

    const allData = await Promise.all(contents);
    for (const data of allData) {
        for (const entry of data) {
            names.add(getName(entry));
        }
    }
}

const masterSHA = await (
    await fetch(
        "https://api.github.com/repos/hyperschedule/hyperschedule/commits/master",
        {
            headers: {
                "X-GitHub-Api-Version": "2022-11-28",
                Accept: "application/vnd.github.sha",
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
await treeFetch(
    `https://api.github.com/repos/hyperschedule/hyperschedule/commits?per_page=100&sha=${masterSHA}`,
    commit,
);
await treeFetch(
    "https://api.github.com/repos/hyperschedule/hyperschedule/issues?state=all&per_page=100",
    issue,
);

const filtered = [...names].filter((n) => n && !n.endsWith("[bot]"));
console.log(filtered);

writeFileSync("contributors.json", JSON.stringify(filtered, null, 2));
