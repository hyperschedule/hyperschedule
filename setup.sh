#!/bin/bash
set -ex

cd shared
yarn
yarn link
cd ..

cd backend
yarn
yarn link hyperschedule-shared
cd ..

cd frontend
yarn
yarn link hyperschedule-shared
cd ..

yarn
