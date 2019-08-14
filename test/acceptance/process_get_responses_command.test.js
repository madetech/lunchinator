const { expect, sinon } = require("../test_helper");
const { SlashCommandFactory, RestaurantFactory } = require("../factories");
const moment = require("moment");

const { LunchCycle } = require("@domain");
const {
  InMemoryLunchCycleGateway,
  InMemorySlackUserResponseGateway,
  GoogleSheetGateway
} = require("@gateways");
const { IsLunchinatorAdmin, ExportLunchersToGoogleSheet } = require("@use_cases");

let inMemoryLunchCycleGateway;
let inMemorySlackUserResponseGateway;
let slashCommandResponse;
let luncher;

describe("Process Get Responses Slash Command", function() {
  beforeEach(function() {
    inMemoryLunchCycleGateway = new InMemoryLunchCycleGateway();
    inMemorySlackUserResponseGateway = new InMemorySlackUserResponseGateway();
    slashCommandResponse = undefined;
  });

  it("can export Lunchers to Existing Google Sheets and existing row", async function() {
    GivenALunchCycleExists();
    await GivenALuncherExists();
    WhenTheCommandIsReceived();
    ThenTheUserIsValid();
    await ThenTheLunchersWillHaveBeenExportedToExisting();
  });

  it("can export Lunchers to Existing Google Sheets and new row", async function() {
    GivenALunchCycleExists();
    await GivenALuncherExists();
    WhenTheCommandIsReceived();
    ThenTheUserIsValid();
    await ThenTheLunchersWillHaveBeenExportedToExistingSheetNewRow();
  });

  it("can export SlackUserResponses to new Google Sheets and new row", async function() {
    GivenALunchCycleExists();
    await GivenALuncherExists();
    WhenTheCommandIsReceived();
    ThenTheUserIsValid();
    await ThenTheLunchersWillHaveBeenExportedToNewSheetNewRow();
  });
});

function GivenALunchCycleExists() {
  inMemoryLunchCycleGateway.create(
    new LunchCycle({
      starts_at: "2020-01-01T00:00:00+00:00",
      restaurants: [RestaurantFactory.getRestaurant({ name: "rest1", emoji: ":bowtie:" })]
    })
  );
}

async function GivenALuncherExists() {
  const lunchCycles = await inMemoryLunchCycleGateway.all();

  luncher = await inMemorySlackUserResponseGateway.create({
    slackUser: {
      id: "U2147483697",
      profile: {
        email: "test@example.com",
        first_name: "Test"
      }
    },
    slackMessageResponse: {
      channel: "DM_CHANNEL_ID_1",
      ts: "1564484225.000400"
    },
    lunchCycle: lunchCycles[0]
  });

  const emojis = [":bowtie:"];
  luncher = await inMemorySlackUserResponseGateway.saveEmojis({
    luncher,
    emojis
  });
}

function WhenTheCommandIsReceived() {
  slashCommandResponse = new SlashCommandFactory().getCommand(
    {},
    {
      command: "/lunchinator_export"
    }
  );
}

function ThenTheUserIsValid() {
  const useCase = new IsLunchinatorAdmin();
  const response = useCase.execute({ userId: slashCommandResponse.body.user_id });
  expect(response.isValid).to.be.true;
}

async function ThenTheLunchersWillHaveBeenExportedToExisting() {
  const lunchCycles = await inMemoryLunchCycleGateway.all();
  const lunchCycle = lunchCycles[0];
  const googleSheetGateway = new GoogleSheetGateway();

  const doc = {};
  const worksheet = { title: moment.utc(lunchCycle.starts_at).format("DD/MM/YYYY") };
  const sheetInfo = { worksheets: [worksheet] };
  const row = { email: "test@example.com" };
  const rows = [row];

  sinon.stub(googleSheetGateway, "fetchDoc").resolves(doc);
  sinon.stub(googleSheetGateway, "getInfo").resolves(sheetInfo);
  sinon.stub(googleSheetGateway, "getRows").resolves(rows);
  sinon.stub(googleSheetGateway, "saveRow").resolves();

  const useCase = new ExportLunchersToGoogleSheet({
    slackUserResponseGateway: inMemorySlackUserResponseGateway,
    googleSheetGateway: googleSheetGateway,
    lunchCycleGateway: inMemoryLunchCycleGateway
  });

  const response = await useCase.execute({ lunchCycle, lunchers: [luncher] });

  expect(response).to.be.true;

  expect(googleSheetGateway.saveRow).to.have.been.calledWith({
    row: { email: "test@example.com", firstname: "Test", "rest1-01012020": "x" }
  });
}

async function ThenTheLunchersWillHaveBeenExportedToExistingSheetNewRow() {
  const lunchCycles = await inMemoryLunchCycleGateway.all();
  const lunchCycle = lunchCycles[0];
  const googleSheetGateway = new GoogleSheetGateway();

  const doc = {};
  const worksheet = { title: moment.utc(lunchCycle.starts_at).format("DD/MM/YYYY") };
  const sheetInfo = { worksheets: [worksheet] };
  const row = { email: "other.test@example.com" };
  const rows = [row];

  sinon.stub(googleSheetGateway, "fetchDoc").resolves(doc);
  sinon.stub(googleSheetGateway, "getInfo").resolves(sheetInfo);
  sinon.stub(googleSheetGateway, "getRows").resolves(rows);
  sinon.stub(googleSheetGateway, "addRow").resolves();

  const useCase = new ExportLunchersToGoogleSheet({
    slackUserResponseGateway: inMemorySlackUserResponseGateway,
    googleSheetGateway: googleSheetGateway,
    lunchCycleGateway: inMemoryLunchCycleGateway
  });

  const response = await useCase.execute({ lunchCycle, lunchers: [luncher] });

  expect(response).to.be.true;

  expect(googleSheetGateway.addRow).to.have.been.calledWith({
    sheet: worksheet,
    row: { email: "test@example.com", firstname: "Test", "rest1-01012020": "x" }
  });
}

async function ThenTheLunchersWillHaveBeenExportedToNewSheetNewRow() {
  const lunchCycles = await inMemoryLunchCycleGateway.all();
  const lunchCycle = lunchCycles[0];
  const googleSheetGateway = new GoogleSheetGateway();

  const doc = {};
  const worksheet = {};
  const sheetInfo = { worksheets: [] };
  const rows = [];

  sinon.stub(googleSheetGateway, "fetchDoc").resolves(doc);
  sinon.stub(googleSheetGateway, "getInfo").resolves(sheetInfo);
  sinon.stub(googleSheetGateway, "addWorksheetTo").resolves(worksheet);
  sinon.stub(googleSheetGateway, "getRows").resolves(rows);
  sinon.stub(googleSheetGateway, "addRow").resolves();

  const useCase = new ExportLunchersToGoogleSheet({
    slackUserResponseGateway: inMemorySlackUserResponseGateway,
    googleSheetGateway: googleSheetGateway,
    lunchCycleGateway: inMemoryLunchCycleGateway
  });

  const response = await useCase.execute({ lunchCycle, lunchers: [luncher] });

  expect(response).to.be.true;

  expect(googleSheetGateway.addWorksheetTo).to.have.been.calledWith({
    doc: doc,
    title: moment.utc(lunchCycle.starts_at).format("DD/MM/YYYY"),
    headers: ["First Name", "Email", "rest1 - 01/01/2020"]
  });
  expect(googleSheetGateway.addRow).to.have.been.calledWith({
    sheet: worksheet,
    row: { email: "test@example.com", firstname: "Test", "rest1-01012020": "x" }
  });
}
