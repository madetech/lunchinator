const { expect, sinon } = require("../test_helper");
const { FakeSlackClient } = require("../fakes");
const { SlackGateway, SlackGatewayError } = require("@gateways");
const nock = require('nock');

let userList = [];
let fakeSlackClient;
describe("SlackGateway", function() {
  before(function() {
    nock.disableNetConnect()
    fakeSlackClient = new FakeSlackClient({ token: "NOT_VALID" });
    SlackGateway.prototype._slackClient = () => fakeSlackClient;
  });

  after(function() {
    nock.cleanAll()
  })

  it("can fetch all users from slack", async function() {
    userList = [
      {
        id: "USLACKID1",
        team_id: "TEAM_ID",
        name: "Test Name",
        deleted: false,
        profile: {
          email: "test2@example.com"
        },
        is_bot: false,
        is_app_user: false,
        updated: 1520258399
      },
      {
        id: "USLACKID2",
        team_id: "TEAM_ID",
        name: "Bob",
        deleted: false,
        profile: {
          email: "test@example.com"
        },
        is_bot: false,
        is_app_user: false,
        updated: 1550160376
      }
    ];

    fakeSlackClient.stubUserList(userList);

    const gateway = new SlackGateway();

    expect(await gateway.fetchUsers()).to.eql(userList);
  });

  it("can filter users without email addresses", async function() {
    userList = [
      {
        id: "USLACKID1",
        team_id: "TEAM_ID",
        name: "Test Name",
        deleted: false,
        profile: {
          real_name: "Test"
        },
        is_bot: false,
        is_app_user: false,
        updated: 1520258399
      },
      {
        id: "USLACKID2",
        team_id: "TEAM_ID",
        name: "Bob",
        deleted: false,
        profile: {
          email: "test@example.com"
        },
        is_bot: false,
        is_app_user: false,
        updated: 1550160376
      }
    ];

    fakeSlackClient.stubUserList(userList);
    const gateway = new SlackGateway();

    expect(await gateway.fetchUsers()).to.eql([
      {
        id: "USLACKID2",
        team_id: "TEAM_ID",
        name: "Bob",
        deleted: false,
        profile: {
          email: "test@example.com"
        },
        is_bot: false,
        is_app_user: false,
        updated: 1550160376
      }
    ]);
  });

  it("can filter users that have been deleted", async function() {
    userList = [
      {
        id: "USLACKID1",
        team_id: "TEAM_ID",
        name: "Test Name",
        deleted: true,
        profile: {
          email: "test1@example.com"
        },
        is_bot: false,
        is_app_user: false,
        updated: 1520258399
      },
      {
        id: "USLACKID2",
        team_id: "TEAM_ID",
        name: "Bob",
        deleted: false,
        profile: {
          email: "test@example.com"
        },
        is_bot: false,
        is_app_user: false,
        updated: 1550160376
      }
    ];

    fakeSlackClient.stubUserList(userList);
    const gateway = new SlackGateway();

    expect(await gateway.fetchUsers()).to.eql([
      {
        id: "USLACKID2",
        team_id: "TEAM_ID",
        name: "Bob",
        deleted: false,
        profile: {
          email: "test@example.com"
        },
        is_bot: false,
        is_app_user: false,
        updated: 1550160376
      }
    ]);
  });

  it("can filter users that are bots", async function() {
    userList = [
      {
        id: "USLACKID1",
        team_id: "TEAM_ID",
        name: "Test Name",
        deleted: false,
        profile: {
          email: "test1@example.com"
        },
        is_bot: true,
        is_app_user: false,
        updated: 1520258399
      },
      {
        id: "USLACKID2",
        team_id: "TEAM_ID",
        name: "Bob",
        deleted: false,
        profile: {
          email: "test@example.com"
        },
        is_bot: false,
        is_app_user: false,
        updated: 1550160376
      }
    ];

    fakeSlackClient.stubUserList(userList);
    const gateway = new SlackGateway();

    expect(await gateway.fetchUsers()).to.eql([
      {
        id: "USLACKID2",
        team_id: "TEAM_ID",
        name: "Bob",
        deleted: false,
        profile: {
          email: "test@example.com"
        },
        is_bot: false,
        is_app_user: false,
        updated: 1550160376
      }
    ]);
  });

  it("can filter users that are 'restricted'", async function() {
    userList = [
      {
        id: "USLACKID1",
        team_id: "TEAM_ID",
        name: "Test Name",
        deleted: false,
        profile: {
          email: "test1@example.com"
        },
        is_bot: false,
        is_app_user: false,
        is_restricted: true,
        is_ultra_restricted: false,
        updated: 1520258399
      },
      {
        id: "USLACKID2",
        team_id: "TEAM_ID",
        name: "Bob",
        deleted: false,
        profile: {
          email: "test@example.com"
        },
        is_bot: false,
        is_app_user: false,
        is_restricted: false,
        is_ultra_restricted: false,
        updated: 1550160376
      }
    ];

    fakeSlackClient.stubUserList(userList);
    const gateway = new SlackGateway();

    expect(await gateway.fetchUsers()).to.eql([
      {
        id: "USLACKID2",
        team_id: "TEAM_ID",
        name: "Bob",
        deleted: false,
        profile: {
          email: "test@example.com"
        },
        is_bot: false,
        is_app_user: false,
        is_restricted: false,
        is_ultra_restricted: false,
        updated: 1550160376
      }
    ]);
  });

  it("can filter users that are 'ultra restricted'", async function() {
    userList = [
      {
        id: "USLACKID1",
        team_id: "TEAM_ID",
        name: "Test Name",
        deleted: false,
        profile: {
          email: "test1@example.com"
        },
        is_bot: false,
        is_app_user: false,
        is_ultra_restricted: true,
        updated: 1520258399
      },
      {
        id: "USLACKID2",
        team_id: "TEAM_ID",
        name: "Bob",
        deleted: false,
        profile: {
          email: "test@example.com"
        },
        is_bot: false,
        is_app_user: false,
        is_ultra_restricted: false,
        updated: 1550160376
      }
    ];

    fakeSlackClient.stubUserList(userList);
    const gateway = new SlackGateway();

    expect(await gateway.fetchUsers()).to.eql([
      {
        id: "USLACKID2",
        team_id: "TEAM_ID",
        name: "Bob",
        deleted: false,
        profile: {
          email: "test@example.com"
        },
        is_bot: false,
        is_app_user: false,
        is_ultra_restricted: false,
        updated: 1550160376
      }
    ]);
  });

  it("can postMessage to correct Channel", async function() {
    const blocks = [];
    const slackMessageDummy = { blocks: blocks };
    const slackUser = {
      id: "USLACKID1",
      team_id: "TEAM_ID",
      name: "Test Name",
      deleted: false,
      profile: {
        email: "test2@example.com"
      },
      is_bot: false,
      is_app_user: false,
      updated: 1520258399
    };
    const gateway = new SlackGateway();

    const sendMessageResponse = await gateway.sendMessageWithBlocks(slackUser, slackMessageDummy);

    expect(sendMessageResponse).to.eql({
      ok: true,
      channel: "DM_CHANNEL_ID",
      ts: "1564484225.000400",
      message: {
        type: "message",
        subtype: "bot_message",
        text: "",
        ts: "1564484225.000400",
        username: "Lunchinator",
        bot_id: "BOT_ID"
      },
      blocks: []
    });

    expect(sendMessageResponse.channel).to.not.eql(slackUser.id);

    expect(fakeSlackClient.postMessageStub).to.have.been.calledWith({
      channel: slackUser.id,
      blocks: blocks,
      as_user: true,
      text: ""
    });
  });

  it("can postMessage to the correct user", async function() {
    const slackMessageDummy = { text: "" };
    const slackChannelId = "";
    const spy = {
      postMessage: sinon.fake.resolves({
        ok: true,
        channel: "DM_CHANNEL_ID", // Differs from sent Channel ID (User ID)
        ts: "1564484225.000400",
        message: {
          type: "message",
          subtype: "bot_message",
          text: "",
          ts: "1564484225.000400",
          username: "Lunchinator",
          bot_id: "BOT_ID"
        }
      })
    };
    const gateway = new SlackGateway();

    fakeSlackClient.chat = spy;

    const sendMessageResponse = await gateway.sendMessageWithText(
      slackChannelId,
      slackMessageDummy
    );

    expect(sendMessageResponse).to.eql({
      ok: true,
      channel: "DM_CHANNEL_ID",
      ts: "1564484225.000400",
      message: {
        type: "message",
        subtype: "bot_message",
        text: "",
        ts: "1564484225.000400",
        username: "Lunchinator",
        bot_id: "BOT_ID"
      }
    });
    expect(spy.postMessage).to.have.been.calledWith({
      channel: slackChannelId,
      text: slackMessageDummy.text,
      as_user: true
    });
  });

  it("can update Interactive Messages using their update url", () => {
    const gateway = new SlackGateway();
    const slackMessageDummy = { blocks: [ {a: 1} ] };

    const requestNock = nock('https://www.example.com')
      .post('/foo')
      .reply(200, 'ok');

    gateway.sendInteractiveMessageResponse(
      "https://www.example.com/foo",
      slackMessageDummy
    );

     return expect(requestNock).to.have.been.requestedWith({
      replace_original: true,
      text: "",
      blocks: [ { a: 1 } ]
    });
  })

  it("update Interactive Messages handles errors", function() {
    const gateway = new SlackGateway();
    const slackMessageDummy = { blocks: [ {} ] };

    nock('https://www.example.com')
      .post('/foo')
      .replyWithError('something awful happened')

    return expect(
      gateway.sendInteractiveMessageResponse("https://www.example.com/foo", slackMessageDummy)
    ).to.be.rejectedWith(
      SlackGatewayError, "error sending updated message"
    );
  })

  it("can handle errors when sending a message", async function() {
    const gateway = new SlackGateway();
    fakeSlackClient.chat.postMessage = sinon.fake.rejects(new Error("errrrrr"));
    const slackUser = { id: "1" };
    const message = { blocks: [] };

    await expect(gateway.sendMessageWithBlocks(slackUser, message)).to.be.rejectedWith(
      SlackGatewayError,
      "error sending message."
    );
  });
});
