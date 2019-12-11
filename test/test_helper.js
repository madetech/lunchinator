require("module-alias/register");

const chai = require("chai");
const sinon = require("sinon");

const sinonChai = require("sinon-chai");
chai.use(sinonChai);

const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

const chaiNock = require('chai-nock');
chai.use(chaiNock);

const expect = chai.expect;

const config = require("@app/config");

sinon.stub(config, "GOOGLE_SERVICE_ACCOUNT_EMAIL").get(() => "test@madetech.com");
sinon.stub(config, "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY").get(() => "NOT_VALID");

async function clearPostgres() {
  if (process.env.NODE_ENV === "test") {
    const { Client } = require("pg");
    const client = new Client(config.db);
    await client.connect();
    await client
      .query("TRUNCATE lunch_cycles,lunchers,lunch_cycle_draws,availability RESTART IDENTITY CASCADE")
      .finally(() => client.end());
  } else {
    throw new Error("Cannot run this outside of 'NODE_ENV=test'");
  }
}

module.exports = {
  sinon,
  expect,
  config,
  clearPostgres
};
