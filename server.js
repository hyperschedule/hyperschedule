#!/usr/bin/env node

const child_process = require('mz/child_process');
const express = require('express');
const fs = require('mz/fs');
const moment = require('moment');
const process = require('process');

let courseData = null;

async function parseAndSlurpOnce()
{
  let result;
  try
  {
    result = await child_process.execFile('./fetch.py');
  }
  catch (err)
  {
    console.error('Fetch script terminated unexpectedly');
    console.error(err);
    throw err;
  }
  const jsonString = await fs.readFile('courses.json');
  const courses = JSON.parse(jsonString);
  const mtime = moment((await fs.stat('courses.json')).mtime);
  const now = moment();
  const staleness = mtime.from(now);
  courseData = {
    courses: courses,
    last_update: staleness,
  };
}

async function parseAndSlurpRepeatedly()
{
  let originalDelay = 500;
  let delay = originalDelay;
  const backoffFactor = 1.5;
  while (true)
  {
    try
    {
      await parseAndSlurpOnce();
      console.log('Fetch script completed successfully');
      delay = originalDelay;
    }
    catch (err)
    {
      // network error? try again, with exponential backoff
      delay *= backoffFactor;
    }
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}

async function runWebserver()
{
  const server = express();
  server.get('/api/v1/all-courses', (req, res, next) => {
    if (courseData)
    {
      res.json(courseData);
    }
    else
    {
      res.status(500).send('Server could not fetch Portal data');
    }
  });
  server.use(express.static('static'));
  server.use((req, res, next) => {
    res.status(404).send('Not found');
  });
  server.use((err, req, res, next) => {
    console.error('Internal server error');
    console.error(err);
    res.status(500).send('Internal server error');
  });
  const port = process.env.PORT || 3000;
  await new Promise((resolve, reject) => server.listen(port, err => {
    if (err)
    {
      reject(err);
    }
    else
    {
      console.log(`Hyperschedule webserver listening on port ${port}`);
      resolve();
    }
  }));
}

async function start()
{
  parseAndSlurpRepeatedly();
  await runWebserver();
}

start()
  .catch(err => {
    console.error('Hyperschedule webserver terminated unexpectedly');
    console.error(err);
    process.exit(1);
  });
