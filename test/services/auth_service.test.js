const { expect, sinon } = require("../test_helper");

const { AuthService } = require("@services");

describe("AuthService", function() {
  it("can check slack user is lunchinator admin", function() {
    const service = new AuthService();
    const spy = { execute: sinon.fake.returns({ isValid: true }) };
    sinon.stub(service, "isLunchinatorAdmin").value(spy);

    const result = service.isAdmin("user");

    expect(spy.execute).to.have.been.called;
    expect(result).to.be.true;
  });

  it("can verify a slack request", function() {
    const service = new AuthService();
    const spy = { execute: sinon.fake.returns({ isVerified: true }) };
    sinon.stub(service, "verifySlackRequest").value(spy);

    const result = service.verifyRequest({ headers: {}, body: {} });

    expect(spy.execute).to.have.been.called;
    expect(result).to.be.true;
  });

  it("can verify a slack request is not valid", function() {
    const service = new AuthService();
    const spy = { execute: sinon.fake.returns({ isVerified: false }) };
    sinon.stub(service, "verifySlackRequest").value(spy);

    const isVerified = service.verifyRequest({ headers: {}, body: {} });

    expect(spy.execute).to.have.been.called;
    expect(isVerified).to.be.false;
  });
});
