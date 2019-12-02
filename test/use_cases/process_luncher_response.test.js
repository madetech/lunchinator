const { expect, sinon } = require("../test_helper");
const { ProcessLuncherResponse } = require("@use_cases");

describe("ProcessLuncherResponse", function() {
  it("calls the updateLuncherReactions UseCase", async function() {
		const addAvailability = sinon.stub();
		const getCurrent = sinon.stub().resolves( {lunch_cycle_id: 2} )
    const usecase = new ProcessLuncherResponse({
			luncherAvailabilityGateway: {
        addAvailability: addAvailability
      },  
			lunchCycleDrawGateway: {
				getCurrent: getCurrent
			}                                       
    });
		await usecase.execute(JSON.parse(testPayload))
		expect(getCurrent).to.have.been.calledOnce
    expect(addAvailability).to.have.been.calledWith({
			 userid: 'U0CA5', 
			 lunchCycleId: 2, 
			 restaurantName: 'TheRestrauntName'
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
			"value": "TheRestrauntName",
			"style": "primary",
			"action_ts": "1575295464.505259"
		}
	]
}`
