const { expect, sinon } = require("../test_helper");
const { ProcessLuncherResponse } = require("@use_cases");

describe("ProcessLuncherResponse", function() {
  it("calls the updateLuncherReactions UseCase", async function() {
		const addAvailability = sinon.stub();
    const usecase = new ProcessLuncherResponse({
			luncherAvailabilityGateway: {
        addAvailability: addAvailability
      }                                   
    });
		await usecase.execute({lunch_cycle_id: 2, payload: JSON.parse(testPayload)})
    expect(addAvailability).to.have.been.calledWith({
			slack_user_id: 'U0CA5', 
			lunch_cycle_id: 678000, 
			restaurant_name: 'TheRestrauntName'
		});
  })
});

const testPayload = `{
	"type": "block_actions",
	"team": {
		"id": "T0CAG",
		"domain": "acme-creamery"
	},
	"user": {
		"id": "U0CA5",
		"username": "Amy McGee",
		"name": "Amy McGee",
		"team_id": "T3MDE"
	},
	"api_app_id": "A0CA5",
	"token": "Shh_its_a_seekrit",
	"container": {
		"type": "message",
		"text": "The contents of the original message where the action originated"
	},
	"trigger_id": "12466734323.1395872398",
	"response_url": "https://www.postresponsestome.com/T123567/1509734234",
	"actions": [
		{
			"type": "button",
			"block_id": "0UBeE",
			"action_id": "gxi",
			"text": {
				"type": "plain_text",
				"text": "Approve",
				"emoji": true
			},
			"value": "678000-TheRestrauntName",
			"style": "primary",
			"action_ts": "1575295464.505259"
		}
	]
}`
