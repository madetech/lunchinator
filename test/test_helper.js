require("module-alias/register");

const chai = require("chai");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
const expect = chai.expect;
chai.use(sinonChai);

const config = require("@app/config");

sinon.stub(config, "GOOGLE_SERVICE_ACCOUNT_EMAIL").get(() => "test@madetech.com");
sinon.stub(config, "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY").get(() => "NOT_VALID");

module.exports = {
  sinon,
  expect,
  config
};
