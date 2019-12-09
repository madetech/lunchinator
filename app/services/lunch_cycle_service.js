const {
  PostgresLunchCycleGateway,
  GoogleSheetGateway,
  SlackGateway,
  PostgresSlackUserResponseGateway,
  PostgresLunchCycleDrawGateway,
  PostgresLuncherAvailabilityGateway
} = require("@gateways");

const {
  GetNewLunchCycleRestaurants,
  FetchRestaurantsFromGoogleSheet,
  GenerateLunchersMessage,
  CreateNewLunchCycle,
  FetchAllSlackUsers,
  SendDirectMessageToSlackUser,
  FindNonResponderIds,
  GenerateReminderMessage,
  SendReminderToLateResponder,
  DrawLunchers,
  GenerateSelectedLunchersMessage,
  SendMessageToSelectedLunchers,
  GetCurrentLunchCycleWeek,
  SendAnnouncement,
  GenerateAnnouncementsMessage,
  ProcessLuncherResponse
} = require("@use_cases");

const config = require("@app/config");

class LunchCycleService {
  constructor() {
    const lunchCycleGateway = new PostgresLunchCycleGateway();
    const slackUserResponseGateway = new PostgresSlackUserResponseGateway();
    const slackGateway = new SlackGateway();
    const googleSheetGateway = new GoogleSheetGateway();
    const postgresLuncherAvailabilityGateway = new PostgresLuncherAvailabilityGateway(config.db)

    this.createNewLunchCycle = new CreateNewLunchCycle({
      lunchCycleGateway: lunchCycleGateway
    });
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
    this.findNonRespondersIds = new FindNonResponderIds({
      lunchCycleGateway: lunchCycleGateway,
      luncherAvailabilityGateway: postgresLuncherAvailabilityGateway
    });
    this.sendReminderToLateResponder = new SendReminderToLateResponder({
      slackGateway: slackGateway,
      generateReminderMessage: new GenerateReminderMessage()
    });
    this.drawLunchers = new DrawLunchers({
      lunchCycleGateway: lunchCycleGateway,
      postgresLuncherAvailabilityGateway: postgresLuncherAvailabilityGateway
    });
    this.sendMessageToSelectedLuncher = new SendMessageToSelectedLunchers({
      slackGateway: slackGateway,
      generateSelectedLunchersMessage: new GenerateSelectedLunchersMessage()
    });
    this.getCurrentLunchCycleWeek = new GetCurrentLunchCycleWeek({
      lunchCycleDrawGateway: new PostgresLunchCycleDrawGateway()
    });
    this.sendAnnouncement = new SendAnnouncement({
      slackGateway: slackGateway,
      generateAnnouncementsMessage: new GenerateAnnouncementsMessage()
    });
    this.processLuncherResponse = new ProcessLuncherResponse({
      luncherAvailabilityGateway: postgresLuncherAvailabilityGateway
    })
  }

  async createLunchCycle({ restaurants }) {
    const response = await this.createNewLunchCycle.execute({
      restaurants: restaurants
    });

    return response;
  }

  async getCurrentLunchCycle() {
    const postgresLunchCycleGateway = new PostgresLunchCycleGateway();
    const currentLunchCycle = await postgresLunchCycleGateway.getCurrent();
    return currentLunchCycle;
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
    const lunchCycleDrawGateway = new PostgresLunchCycleDrawGateway();
    const lunchCycleWeeks = await lunchCycleDrawGateway.getCurrent();
    lunchCycleWeeks.forEach(async lunchCycleWeek => {
      await this.sendMessageToSelectedLuncher.execute({ lunchCycleWeek });
    });
  }

  async updateDraw(lunchCycleDraw) {
    const lunchCycleDrawGateway = new PostgresLunchCycleDrawGateway();
    await lunchCycleDrawGateway.update(lunchCycleDraw);
  }
  async sendToAnnouncement() {
    const currentLunchCycleWeek = await this.getCurrentLunchCycleWeek.execute();
    await this.sendAnnouncement.execute(currentLunchCycleWeek);
  }
  async recordAttendance(payload) {
    await this.processLuncherResponse.execute(payload)
  }
}

module.exports = LunchCycleService;
