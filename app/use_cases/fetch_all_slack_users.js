class FetchAllSlackUsers {
  constructor(options) {
    this.slackGateway = options.slackGateway;
  }

  async execute() {
    const slackUsers = await this.slackGateway.fetchUsers();

    return { slackUsers };
  }
}

module.exports = FetchAllSlackUsers;
