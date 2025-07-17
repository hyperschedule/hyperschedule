At the project root, first download all data by

```
rsync -ruavh root@srv.banana.hyperschedule.io:/srv/hyperschedule/data/ data/
```

Then, delete all the data with

```
docker compose down --volumes --remove-orphans
```

At this point, run `pnpm docker` and load frontend to confirm there is no more data (empty term selector). Run

```
docker compose exec -T backend sh -c "pnpm dev-node src/load-current-term.ts"
```

Restart the service by running `pnpm docker` again and confirm in the browser that the new term data is loaded (you may
need to clear browser cache in dev tool). Run `pnpm docker-dump-db` to get a new database dump file. Then, add the files
to git and delete the old data files with (e.g. if we want to add data for FA2024)

```
git rm -r --cached data/SP2024 && git add -f data/FA2024 data/db_dump
```

Commit to git as per usual, then generate the full dump (all sections but exclude user info) on the server for the team members.
