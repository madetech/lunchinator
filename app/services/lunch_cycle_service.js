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
      lunchCycleGateway: PostgresLunchCycleGateway,
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

  getPreviewMessage(lunchCycle) {
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
    const nonResponders = await this.findNonRespondersIds.execute();
    for (const nonResponder of nonResponders) {
      await this.sendReminderToLateResponder.execute({ nonResponder });
    }
  }

  async fetchReactionsFromSlackUserResponses({ slackUserResponses }) {
    const updatedSlackUserResponses = [];

    for (const slackUserResponse of slackUserResponses) {
      const reactionsResponse = await this.fetchReactionsForSlackUserResponse.execute({
        slackUserResponse
      });

      const { updatedSlackUserResponse } = await this.updateSlackUserResponseWithReactions.execute({
        slackUserResponse,
        reactions: reactionsResponse.reactions
      });

      updatedSlackUserResponses.push(updatedSlackUserResponse);
    }

    return { updatedSlackUserResponses };
  }

  async exportResponsesToGoogleSheet({ lunchCycle, slackUserResponses }) {
    await this.exportSlackUserResponsesForLunchCycleToGoogleSheet.execute({
      lunchCycle,
      slackUserResponses
    });
  }
}

module.exports = LunchCycleService;
