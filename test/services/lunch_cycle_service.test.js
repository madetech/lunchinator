const { expect, sinon } = require("../test_helper");
const { LunchCycle } = require("@domain");
const { LunchCycleService } = require("@services");
const { RestaurantFactory } = require("../factories");

describe("LunchCycleService", async function() {
  it("can get a new lunch cycle", async function() {
    const expected = new LunchCycle();
    const service = new LunchCycleService();
    const spy = { execute: sinon.fake.returns({ lunchCycle: expected }) };
    sinon.stub(service, "createNewLunchCycle").value(spy);

    const response = await service.createLunchCycle({ headers: {}, body: {} });

    expect(spy.execute).to.have.been.called;
    expect(response.lunchCycle).to.be.eql(expected);
  });

  it("can get lunch cycle restaurants", async function() {
    const service = new LunchCycleService();
    const restaurantList = [
      RestaurantFactory.getRestaurant({ name: "restaurant1", emoji: "emoji1" })
    ];
    const spy = { execute: sinon.fake.returns({ restaurants: restaurantList }) };
    sinon.stub(service, "getNewLunchCycleRestaurants").value(spy);

    const restaurants = await service.getLunchCycleRestaurants();

    expect(spy.execute).to.have.been.called;
    expect(restaurants).to.be.eql(restaurantList);
  });

  it("can get preview message", async function() {
    const expected = { text: "message" };
    const service = new LunchCycleService();
    const spy = { execute: sinon.fake.returns(expected) };
    sinon.stub(service, "generateLuncherMessage").value(spy);

    const message = await service.getPreviewMessage(new LunchCycle());

    expect(spy.execute).to.have.been.called;
    expect(message).to.be.equal(expected);
  });

  it("can fetch all the slack users", async function() {
    const service = new LunchCycleService();
    const expected = [
      { id: "U2147483697", profile: { email: "test1@example.com", real_name: "Test1" } }
    ];
    const spy = { execute: sinon.fake.returns({ slackUsers: expected }) };
    sinon.stub(service, "fetchAllSlackUsers").value(spy);

    const slackUsers = await service.fetchSlackUsers();

    expect(spy.execute).to.have.been.called;
    expect(slackUsers).to.eql(expected);
  });

  it("can send DM's to slack users", async function() {
    const service = new LunchCycleService();
    const slackUsers = [
      { id: "U2147483697", profile: { email: "test1@example.com", real_name: "Test1" } },
      { id: "U2147483397", profile: { email: "test2@example.com", real_name: "Test2" } }
    ];
    const spy = {
      execute: sinon.fake.returns({ slackMessageResponse: {}, slackUserResponse: {} })
    };
    sinon.stub(service, "sendDirectMessageToSlackUser").value(spy);

    await service.sendMessagesToSlackUsers(slackUsers, new LunchCycle());

    expect(spy.execute).to.have.been.callCount(slackUsers.length);
  });
  
  it("can record attendance", async function() {
    const service = new LunchCycleService();

    const spy = { execute: sinon.spy() };
    sinon.stub(service, "processLuncherResponse").value(spy);

    await service.recordAttendance({});

    expect(spy.execute).to.have.been.called;
  });
  
  it("can messge non responders", async function() {
    const service = new LunchCycleService();

    const findNonRespondersIds = { execute: sinon.fake.returns({nonResponderIds: [1, 2] }) };
    sinon.stub(service, "findNonRespondersIds").value(findNonRespondersIds);

    const sendReminderToLateResponder = { execute: sinon.spy() };
    sinon.stub(service, "sendReminderToLateResponder").value(sendReminderToLateResponder);

    await service.remindLateResponders();

    expect(findNonRespondersIds.execute).to.have.been.called;
    expect(sendReminderToLateResponder.execute).to.have.been.calledWith({nonResponderId: 1});
    expect(sendReminderToLateResponder.execute).to.have.been.calledWith({nonResponderId: 2});
  });


  it("can get current availabilities", async function() {
    const service = new LunchCycleService();

    const lunchCycleGateway = { execute: sinon.fake.returns({ lunchCycle: 1, availableUsers: 2 }) };
    sinon.stub(service, "getCurrentUserAvailabilities").value(lunchCycleGateway);

    const responce = await service.currentAvailabilities();

    expect(lunchCycleGateway.execute).to.have.been.called;
    expect(responce.lunchCycle).to.eql(1);
    expect(responce.availabilities).to.eql(2)
  });
  
});
