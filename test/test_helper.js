require("module-alias/register");

const chai = require("chai");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
const expect = chai.expect;
chai.use(sinonChai);

const config = require("@app/config");

module.exports = {
  sinon,
  expect,
  config
};
