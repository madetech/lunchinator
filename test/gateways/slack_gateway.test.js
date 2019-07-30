const { expect, sinon } = require("../test_helper");
const { SlackGateway } = require("@gateways");

let userList = [];
let postMessageStub;

class FakeSlackClient {
  constructor({ token }) {
    this.token = token;
    this.users = {
      list: () => {}
    };
    this.chat = {
      postMessage: () => {}
    };

    // Easy way to get the Promise interface working.
    sinon.stub(this.users, "list").resolves({
      ok: true,
      members: userList
    });

    postMessageStub = sinon.stub(this.chat, "postMessage").resolves({
      ok: true,
      channel: "DM_CHANNEL_ID", // Differs from sent Channel ID (User ID)
      ts: "1564484225.000400",
      message: {
        type: "message",
        subtype: "bot_message",
        text: "Hello from Node!",
        ts: "1564484225.000400",
        username: "Lunchinator",
        bot_id: "BOT_ID"
      }
    });
  }
}

describe("SlackGateway", function() {
  before(function() {
    SlackGateway.prototype._slackClient = () => new FakeSlackClient({ token: "NOT_VALID" });
  });

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
          first_name: "Test"
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
    const messageText = "hello";
    const slackMessageDummy = { text: messageText };
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

    const sendMessageResponse = await gateway.sendMessage(slackUser, slackMessageDummy);

    expect(sendMessageResponse).to.eql({
      ok: true,
      channel: "DM_CHANNEL_ID",
      ts: "1564484225.000400",
      message: {
        type: "message",
        subtype: "bot_message",
        text: "Hello from Node!",
        ts: "1564484225.000400",
        username: "Lunchinator",
        bot_id: "BOT_ID"
      }
    });

    expect(sendMessageResponse.channel).to.not.eql(slackUser.id);

    expect(postMessageStub).to.have.been.calledWith({
      channel: slackUser.id,
      text: messageText
    });
  });
});
