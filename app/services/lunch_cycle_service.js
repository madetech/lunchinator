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
  FetchReactionsForSlackUserResponse,
  UpdateSlackUserResponseWithReactions,
  ExportSlackUserResponseToGoogleSheet,
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
    this.fetchReactionsForSlackUserResponse = new FetchReactionsForSlackUserResponse({
      slackGateway: slackGateway
    });
    this.updateSlackUserResponseWithReactions = new UpdateSlackUserResponseWithReactions({
      slackUserResponseGateway: slackUserResponseGateway,
      lunchCycleGateway: lunchCycleGateway
    });
    this.exportSlackUserResponsesForLunchCycleToGoogleSheet = new ExportSlackUserResponseToGoogleSheet(
      {
        slackUserResponseGateway: slackUserResponseGateway,
        googleSheetGateway: new GoogleSheetGateway()
      }
    );
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

  async fetchUserResponses() {
    const postgresLunchCycleGateway = new PostgresLunchCycleGateway();
    const postgresSlackUserResponseGateway = new PostgresSlackUserResponseGateway();
    const lunchCycle = await postgresLunchCycleGateway.getCurrent();

    const userResponses = await postgresSlackUserResponseGateway.findAllForLunchCycle({
      lunchCycle
    });

    const updatedResponses = [];

    for (const slackUserResponse of userResponses) {
      const reactionsResponse = await this.fetchReactionsForSlackUserResponse.execute({
        slackUserResponse
      });

      const { updatedSlackUserResponse } = await this.updateSlackUserResponseWithReactions.execute({
        slackUserResponse,
        reactions: reactionsResponse.reactions
      });

      updatedResponses.push(updatedSlackUserResponse);
    }

    return updatedResponses;
  }

  async exportResponsesToGoogleSheet(slackUserResponses) {
    const postgresLunchCycleGateway = new PostgresLunchCycleGateway();
    const lunchCycle = await postgresLunchCycleGateway.getCurrent();

    await this.exportSlackUserResponsesForLunchCycleToGoogleSheet.execute({
      lunchCycle,
      slackUserResponses
    });
  }
}

module.exports = LunchCycleService;
