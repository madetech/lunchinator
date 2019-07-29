# Lunchinator

[![CircleCI](https://circleci.com/gh/madetech/lunchinator.svg?style=svg)](https://circleci.com/gh/madetech/lunchinator)

An app to select people to go for lunch.

### Installation for Development

- You need to have Yarn installed (`brew install yarn`)
- Move into the `lunchinator` directory
- Run `yarn`
- Need to populate a `.env` file; please look at the sample for for an example.

### Setup Test/Dev Databases

We are using PostgreSQL to store information. You need to have two databases locally.

- Ensure PostgreSQL is installed and running (`brew install postgresql` and `brew services start postgresql`).
- Using `psql postgres` do the following:
- `CREATE DATABASE lunchinator_dev; CREATE DATABASE lunchinator_test;`
- Grant permission for your user: `GRANT ALL PRIVILEGES ON DATABASE lunchinator_dev TO $USER` and `GRANT ALL PRIVILEGES ON DATABASE lunchinator_test TO $USER;`
- Then run `yarn run migrate up` for development and `yarn run migrate-test up`

### Using Slack App in Development

We use `ngrok` to route traffic from the internet to our machine. See guide: https://api.slack.com/tutorials/tunneling-with-ngrok
