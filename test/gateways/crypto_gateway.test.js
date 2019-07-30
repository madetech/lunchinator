const { CryptoGateway } = require("@gateways");
const { expect } = require("../test_helper");

describe("CryptoGateway", function() {
  it("can check two signatures are equal", function() {
    const mySignature = "signature";
    const theirSignature = "signature";
    const gateway = new CryptoGateway();
    expect(gateway.areSignaturesEqual(mySignature, theirSignature)).to.be.true;
  });
  it("can check two signatures are not equal", function() {
    const mySignature = "signature";
    const theirSignature = "signature2";
    const gateway = new CryptoGateway();
    expect(gateway.areSignaturesEqual(mySignature, theirSignature)).to.be.false;
  });
});
