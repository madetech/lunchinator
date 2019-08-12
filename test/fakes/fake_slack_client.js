const { sinon } = require("../test_helper");

class FakeSlackClient {
  constructor({ token }) {
    this.token = token;
    this.reactions = {
      get: () => {}
    };
    this.users = {
      list: () => {}
    };
    this.chat = {
      postMessage: () => {}
    };

    this.postMessageStub = sinon.stub(this.chat, "postMessage").resolves({
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
      },
      blocks: []
    });

    const reactionsStub = sinon.stub(this.reactions, "get");

    reactionsStub
      .withArgs({
        channel: "DM_CHANNEL_ID_1",
        timestamp: "1564484225.000400"
      })
      .resolves({
        ok: true,
        type: "message",
        channel: "DM_CHANNEL_ID_1",
        message: {
          type: "message",
          subtype: "bot_message",
          text: "Hello from Node!",
          ts: "1564484225.000400",
          username: "Lunchinator",
          bot_id: "BOT_ID",
          reactions: [
            { name: "pizza", users: ["U2147483697"], count: 1 },
            { name: "sushi", users: ["U2147483697"], count: 1 }
          ]
        }
      });
  }

  stubUserList(userList) {
    if (this._stubbedUsersList) {
      this._stubbedUsersList.restore();
    }

    // Easy way to get the Promise interface working.
    this._stubbedUsersList = sinon.stub(this.users, "list").resolves({
      ok: true,
      members: userList
    });

    return this._stubbedUsersList;
  }
}

module.exports = FakeSlackClient;
