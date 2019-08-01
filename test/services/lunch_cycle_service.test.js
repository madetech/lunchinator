const { expect, sinon } = require("../test_helper");
const { LunchCycle } = require("@domain");
const { LunchCycleService } = require("@services");
const { RestaurantFactory } = require("../factories");

describe("LunchCycleService", async function() {
  it("can get a new lunch cycle", async function() {
    const expected = new LunchCycle();
    const spy = { execute: sinon.fake.returns({ lunchCycle: expected }) };

    const service = new LunchCycleService({
      createNewLunchCycle: spy
    });

    const response = await service.createLunchCycle({ headers: {}, body: {} });

    expect(spy.execute).to.have.been.called;
    expect(response.lunchCycle).to.be.eql(expected);
  });

  it("can check slack user is lunchinator admin", function() {
    const spy = { execute: sinon.fake.returns({ isValid: true }) };

    const service = new LunchCycleService({
      isLunchinatorAdmin: spy
    });

    const result = service.isAdmin("user");

    expect(spy.execute).to.have.been.called;
    expect(result).to.be.true;
  });

  it("can verify a slack request", function() {
    const spy = { execute: sinon.fake.returns({ isVerified: true }) };

    const service = new LunchCycleService({
      verifySlackRequest: spy
    });

    const result = service.verifyRequest({ headers: {}, body: {} });

    expect(spy.execute).to.have.been.called;
    expect(result).to.be.true;
  });

  it("can verify a slack request is not valid", function() {
    const spy = { execute: sinon.fake.returns({ isVerified: false }) };

    const service = new LunchCycleService({
      verifySlackRequest: spy
    });

    const isVerified = service.verifyRequest({ headers: {}, body: {} });

    expect(spy.execute).to.have.been.called;
    expect(isVerified).to.be.false;
  });

  it("can get lunch cycle restaurants", async function() {
    const restaurantList = [
      RestaurantFactory.getRestaurant({ name: "restaurant1", emoji: "emoji1" })
    ];

    const spy = { execute: sinon.fake.returns({ restaurants: restaurantList }) };

    const service = new LunchCycleService({
      verifySlackRequest: sinon.fake(),
      getNewLunchCycleRestaurants: spy
    });

    const restaurants = await service.getLunchCycleRestaurants();

    expect(spy.execute).to.have.been.called;
    expect(restaurants).to.be.eql(restaurantList);
  });

  it("can get preview message", function() {
    const expected = "message";
    const spy = { execute: sinon.fake.returns({ text: expected }) };

    const service = new LunchCycleService({
      createNewLunchCycle: sinon.fake(),
      verifySlackRequest: sinon.fake(),
      getNewLunchCycleRestaurants: sinon.fake(),
      generateSlackMessage: spy
    });

    const message = service.getPreviewMessage(new LunchCycle());

    expect(spy.execute).to.have.been.called;
    expect(message).to.be.equal(expected);
  });

  it("can fetch all the slack users", async function() {
    const expected = [
      { id: "U2147483697", profile: { email: "test1@example.com", first_name: "Test1" } }
    ];
    const spy = { execute: sinon.fake.returns({ slackUsers: expected }) };

    const service = new LunchCycleService({
      createNewLunchCycle: sinon.fake(),
      verifySlackRequest: sinon.fake(),
      getNewLunchCycleRestaurants: sinon.fake(),
      generateSlackMessage: sinon.fake(),
      fetchAllSlackUsers: spy
    });

    const slackUsers = await service.fetchSlackUsers();

    expect(spy.execute).to.have.been.called;
    expect(slackUsers).to.eql(expected);
  });

  it("can send DM's to slack users", async function() {
    const slackUsers = [
      { id: "U2147483697", profile: { email: "test1@example.com", first_name: "Test1" } },
      { id: "U2147483397", profile: { email: "test2@example.com", first_name: "Test2" } }
    ];
    const spy = {
      execute: sinon.fake.returns({
        slackMessageResponse: {},
        slackUserResponse: {}
      })
    };

    const service = new LunchCycleService({
      createNewLunchCycle: sinon.fake(),
      verifySlackRequest: sinon.fake(),
      getNewLunchCycleRestaurants: sinon.fake(),
      fetchAllSlackUsers: sinon.fake(),
      generateSlackMessage: sinon.fake(),
      sendDirectMessageToSlackUser: spy
    });

    await service.sendMessagesToSlackUsers(slackUsers, new LunchCycle());

    expect(spy.execute).to.have.callCount(slackUsers.length);
  });
});
