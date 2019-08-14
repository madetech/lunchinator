const {
  PostgresLunchCycleGateway,
  GoogleSheetGateway,
  CryptoGateway,
  SlackGateway,
  PostgresSlackUserResponseGateway
} = require("@gateways");

const {
  GetNewLunchCycleRestaurants,
  GetPreviousLunchCycle,
  FetchRestaurantsFromGoogleSheet,
  VerifySlackRequest,
  GenerateSlackMessage,
  CreateNewLunchCycle,
  IsLunchinatorAdmin,
  FetchAllSlackUsers,
  SendDirectMessageToSlackUser,
  FetchReactionsForLuncher,
  UpdateLuncherReactions,
  ExportLunchersToGoogleSheet,
  FindNonResponderIds,
  GenerateReminderMessage,
  SendReminderToLateResponder
} = require("@use_cases");

class LunchCycleService {
  constructor() {
    const lunchCycleGateway = new PostgresLunchCycleGateway();
    const slackUserResponseGateway = new PostgresSlackUserResponseGateway();
    const slackGateway = new SlackGateway();

    this.createNewLunchCycle = new CreateNewLunchCycle({
      lunchCycleGateway: lunchCycleGateway
    });
    this.verifySlackRequest = new VerifySlackRequest({ gateway: new CryptoGateway() });
    this.getNewLunchCycleRestaurants = new GetNewLunchCycleRestaurants({
      fetchRestaurantsFromGoogleSheet: new FetchRestaurantsFromGoogleSheet({
        googleSheetGateway: new GoogleSheetGateway()
      }),
      getPreviousLunchCycle: new GetPreviousLunchCycle({
        lunchCycleGateway: lunchCycleGateway
      })
    });
    this.fetchAllSlackUsers = new FetchAllSlackUsers({
      slackGateway: slackGateway
    });
    this.sendDirectMessageToSlackUser = new SendDirectMessageToSlackUser({
      slackGateway: slackGateway,
      slackUserResponseGateway: slackUserResponseGateway,
      generateSlackMessage: new GenerateSlackMessage(),
      lunchCycleGateway: lunchCycleGateway
    });
    this.generateSlackMessage = new GenerateSlackMessage();
    this.isLunchinatorAdmin = new IsLunchinatorAdmin();
    this.fetchLuncherReactions = new FetchReactionsForLuncher({
      slackGateway: slackGateway
    });
    this.updateLuncherReactions = new UpdateLuncherReactions({
      slackUserResponseGateway: slackUserResponseGateway,
      lunchCycleGateway: lunchCycleGateway
    });

    this.exportLunchersToGoogleSheet = new ExportLunchersToGoogleSheet({
      slackUserResponseGateway: slackUserResponseGateway,
      googleSheetGateway: new GoogleSheetGateway(),
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
    const response = await this.getNewLunchCycleRestaurants.execute();
    return response.restaurants;
  }

  async getPreviewMessage() {
    const postgresLunchCycleGateway = new PostgresLunchCycleGateway();
    const lunchCycle = await postgresLunchCycleGateway.getCurrent();

    const message = this.generateSlackMessage.execute({
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

  async exportLunchers() {
    await this.exportLunchersToGoogleSheet.execute();
  }
}

module.exports = LunchCycleService;
