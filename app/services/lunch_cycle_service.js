const {
  PostgresLunchCycleGateway,
  GoogleSheetGateway,
  CryptoGateway,
  SlackGateway,
  PostgresSlackUserResponseGateway,
  PostgresLunchCycleDrawGateway
} = require("@gateways");

const {
  GetNewLunchCycleRestaurants,
  FetchRestaurantsFromGoogleSheet,
  VerifySlackRequest,
  GenerateLunchersMessage,
  CreateNewLunchCycle,
  IsLunchinatorAdmin,
  FetchAllSlackUsers,
  SendDirectMessageToSlackUser,
  FetchReactionsForLuncher,
  UpdateLuncherReactions,
  FindNonResponderIds,
  GenerateReminderMessage,
  SendReminderToLateResponder,
  DrawLunchers,
  GenerateSelectedLunchersMessage,
  SendMessageToSelectedLunchers
} = require("@use_cases");

class LunchCycleService {
  constructor() {
    const lunchCycleGateway = new PostgresLunchCycleGateway();
    const slackUserResponseGateway = new PostgresSlackUserResponseGateway();
    const slackGateway = new SlackGateway();
    const googleSheetGateway = new GoogleSheetGateway();

    this.createNewLunchCycle = new CreateNewLunchCycle({
      lunchCycleGateway: lunchCycleGateway
    });
    this.verifySlackRequest = new VerifySlackRequest({ gateway: new CryptoGateway() });
    this.getNewLunchCycleRestaurants = new GetNewLunchCycleRestaurants({
      fetchRestaurantsFromGoogleSheet: new FetchRestaurantsFromGoogleSheet({
        googleSheetGateway: googleSheetGateway
      }),
      fetchAllSlackUsers: new FetchAllSlackUsers({
        slackGateway: slackGateway
      })
    });
    this.fetchAllSlackUsers = new FetchAllSlackUsers({
      slackGateway: slackGateway
    });
    this.sendDirectMessageToSlackUser = new SendDirectMessageToSlackUser({
      slackGateway: slackGateway,
      slackUserResponseGateway: slackUserResponseGateway,
      generateLunchersMessage: new GenerateLunchersMessage(),
      lunchCycleGateway: lunchCycleGateway
    });
    this.generateLuncherMessage = new GenerateLunchersMessage();
    this.isLunchinatorAdmin = new IsLunchinatorAdmin();
    this.fetchLuncherReactions = new FetchReactionsForLuncher({
      slackGateway: slackGateway
    });
    this.updateLuncherReactions = new UpdateLuncherReactions({
      slackUserResponseGateway: slackUserResponseGateway,
      lunchCycleGateway: lunchCycleGateway
    });
    this.findNonRespondersIds = new FindNonResponderIds({
      lunchCycleGateway: lunchCycleGateway,
      userResponseGateway: slackUserResponseGateway
    });
    this.sendReminderToLateResponder = new SendReminderToLateResponder({
      slackGateway: slackGateway,
      generateReminderMessage: new GenerateReminderMessage()
    });
    this.drawLunchers = new DrawLunchers({
      lunchCycleGateway: lunchCycleGateway,
      slackUserResponseGateway: slackUserResponseGateway
    });
    this.sendMessageToSelectedLuncher = new SendMessageToSelectedLunchers({
      slackGateway: slackGateway,
      generateSelectedLunchersMessage: new GenerateSelectedLunchersMessage()
    });
  }

  async createLunchCycle({ restaurants }) {
    const response = await this.createNewLunchCycle.execute({
      restaurants: restaurants
    });

    return response;
  }

  isAdmin(userId) {
    var isLunchinatorAdminResponse = this.isLunchinatorAdmin.execute({ userId: userId });
    return isLunchinatorAdminResponse.isValid;
  }

  verifyRequest(headers, body) {
    const response = this.verifySlackRequest.execute({
      slackSignature: headers["x-slack-signature"],
      timestamp: headers["x-slack-request-timestamp"],
      body: body
    });

    return response.isVerified;
  }

  async getLunchCycleRestaurants() {
    const postgresLunchCycleGateway = new PostgresLunchCycleGateway();
    const currentLunchCycle = await postgresLunchCycleGateway.getCurrent();
    const response = await this.getNewLunchCycleRestaurants.execute({
      currentLunchCycle
    });
    return response.restaurants;
  }

  async getPreviewMessage() {
    const postgresLunchCycleGateway = new PostgresLunchCycleGateway();
    const lunchCycle = await postgresLunchCycleGateway.getCurrent();

    const message = this.generateLuncherMessage.execute({
      lunchCycle: lunchCycle
    });

    return message;
  }

  async fetchSlackUsers() {
    const response = await this.fetchAllSlackUsers.execute();
    return response.slackUsers;
  }

  async sendMessagesToSlackUsers(slackUsers) {
    for (const slackUser of slackUsers) {
      await this.sendDirectMessageToSlackUser.execute({ slackUser });
    }
  }

  async remindLateResponders() {
    const response = await this.findNonRespondersIds.execute();
    for (const nonResponderId of response.nonResponderIds) {
      await this.sendReminderToLateResponder.execute({ nonResponderId });
    }
  }

  async updateLunchers() {
    const postgresLunchCycleGateway = new PostgresLunchCycleGateway();
    const postgresSlackUserResponseGateway = new PostgresSlackUserResponseGateway();

    const lunchCycle = await postgresLunchCycleGateway.getCurrent();
    const lunchers = await postgresSlackUserResponseGateway.findAllForLunchCycle({ lunchCycle });

    for (const luncher of lunchers) {
      const response = await this.fetchLuncherReactions.execute({ luncher });
      await this.updateLuncherReactions.execute({ luncher, reactions: response.reactions });
    }
  }

  async doLunchersDraw() {
    const lunchCycleGateway = new PostgresLunchCycleGateway();
    const lunchCycleDrawGateway = new PostgresLunchCycleDrawGateway();

    const response = await this.drawLunchers.execute();

    // this should me moved into drawLunchers
    const lunchCycle = await lunchCycleGateway.getCurrent();
    await lunchCycleDrawGateway.create(lunchCycle.id, response.lunchCycleDraw);
  }

  async getLatestLunchCycleDraw() {
    const lunchCycleDrawGateway = new PostgresLunchCycleDrawGateway();
    const lunchCycleDraw = await lunchCycleDrawGateway.getCurrent();
    return lunchCycleDraw;
  }

  async sendMessageToSelectedLunchers() {
    const response = await this.drawLunchers.execute();
    const lunchCycleWeeks = response.lunchCycleWeeks;
    lunchCycleWeeks.forEach(async lunchCycleWeek => {
      await this.sendMessageToSelectedLuncher.execute({ lunchCycleWeek });
    });
  }

  async updateDraw(lunchCycleDraw) {
    const lunchCycleDrawGateway = new PostgresLunchCycleDrawGateway();
    await lunchCycleDrawGateway.update(lunchCycleDraw);
  }
}

module.exports = LunchCycleService;
