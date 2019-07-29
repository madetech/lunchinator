class FetchAllSlackUsers {
  constructor(options) {
    this.slackGateway = options.slackGateway;
  }

  execute() {
    return {
      slackUsers: this.slackGateway.fetchUsers()
    };
  }
}

module.exports = FetchAllSlackUsers;
