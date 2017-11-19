#!/usr/bin/env node

const child_process = require('mz/child_process');
const express = require('express');
const fs = require('mz/fs');
const moment = require('moment');
const process = require('process');

let courses = null;
let production = false;

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
  courses = JSON.parse(jsonString);
}

async function parseAndSlurpRepeatedly()
{
  let originalDelay = 500;
  let delay = originalDelay;
  // No exponential backoff during development.
  const backoffFactor = production ? 1.5 : 1;
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

// https://stackoverflow.com/q/11001817/3538165
function allowCrossDomain(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

  // intercept OPTIONS method
  if ('OPTIONS' == req.method) {
    res.send(200);
  }
  else {
    next();
  }
};

async function runWebserver()
{
  const server = express();
  server.use(allowCrossDomain);
  server.get('/api/v1/all-courses', (req, res, next) => {
    if (courses)
    {
      const mtime = moment(fs.statSync('courses.json').mtime);
      const now = moment();
      const staleness = mtime.from(now);
      res.json({
        courses: courses,
        lastUpdate: staleness,
      });
    }
    else
    {
      res.status(500).send('Server could not fetch Portal data');
    }
  });
  const staticDir = production ? 'static/production' : 'static/src';
  server.use(express.static(staticDir));
  server.use((req, res, next) => {
    res.status(404).send('Not found');
  });
  server.use((err, req, res, next) => {
    console.error('Internal server error');
    console.error(err);
    res.status(500).send('Internal server error');
  });
  const port = process.env.PORT || 5000;
  await new Promise((resolve, reject) => server.listen(port, err => {
    if (err)
    {
      reject(err);
    }
    else
    {
      const mode = production ? 'production' : 'dev';
      console.log(
        `Hyperschedule webserver (${mode}) listening on port ${port}`);
      resolve();
    }
  }));
}

async function start()
{
  parseAndSlurpRepeatedly();
  await runWebserver();
}

function handleCommandLineArguments()
{
  // First two arguments are the node binary and the script name.
  for (let arg of process.argv.slice(2))
  {
    if (arg == '--production')
    {
      production = true;
    }
    else if (arg == '--dev')
    {
      production = false;
    }
    else
    {
      console.error(`Unexpected argument '${arg}', ignoring`);
    }
  }
}

handleCommandLineArguments();
start()
  .catch(err => {
    console.error('Hyperschedule webserver terminated unexpectedly');
    console.error(err);
    process.exit(1);
  });
