const { expect, sinon } = require("../test_helper");
const { ProcessLuncherResponse } = require("@use_cases");

describe("ProcessLuncherResponse", function() {
  it("calls the ProcessLuncherResponse usecase", async function() {
    const { usecase, addAvailability } = setUp();

    let testPayload = getTestPayloadFor("Available");

    await usecase.execute(JSON.parse(testPayload));
    expect(addAvailability).to.have.been.calledWith({
      slack_user_id: "U0CA5",
      lunch_cycle_id: 678000,
      restaurant_name: "TheRestaurantName",
      available: true
    });
  });

  it("calls the ProcessLuncherResponse usecase when not available", async function() {
    const { usecase, addAvailability } = setUp();

    let testPayload = getTestPayloadFor("Unavailable");

    await usecase.execute(JSON.parse(testPayload));
    expect(addAvailability).to.have.been.calledWith({
      slack_user_id: "U0CA5",
      lunch_cycle_id: 678000,
      restaurant_name: "TheRestaurantName",
      available: false
    });
});

	it("calls the SlackGateway usecase with updated message", async function () {
		const { usecase, sendInteractiveMessageResponse } = setUp();
		
		let testPayload = getTestPayloadFor("Available");
		let testPayloadParsed = JSON.parse(testPayload)

		const responseURL = testPayloadParsed.response_url;
		let message = getResponseMessage()
		
		await usecase.execute(JSON.parse(testPayload));
		expect(sendInteractiveMessageResponse).to.have.been.calledWith(responseURL, message);
  });
	
	it("calls the ProcessLuncherResponse usecase with findByID having been called", async function() {
    const { usecase, findById } = setUp();

    let testPayload = getTestPayloadFor("Available");

    await usecase.execute(JSON.parse(testPayload));
    expect(findById).to.have.been.calledWith(678000);
  });

});

function setUp() {
	const executeOne = sinon.stub().returns(getResponseMessage());
	const sendInteractiveMessageResponse = sinon.stub()
	const findById = sinon.stub().returns(lunchCycleStub());
	const addAvailability = sinon.stub();
	const usecase = new ProcessLuncherResponse({
		luncherAvailabilityGateway: {
			addAvailability: addAvailability
		},
		slackGateway: {
			sendInteractiveMessageResponse: sendInteractiveMessageResponse
		},
		generateLunchersMessage: {
			execute: executeOne
		},
		lunchCycleGateway: {
			findById: findById
		}
		
	});
	return { usecase, addAvailability, sendInteractiveMessageResponse, findById };
}

function getTestPayloadFor(buttonName) {
  return `{
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
				"text": "${buttonName}",
				"emoji": true
			},
			"value": "678000-TheRestaurantName",
			"style": "primary",
			"action_ts": "1575295464.505259"
		}
	]
}`;
}

function getResponseMessage() {
	return [
		{
			type: 'section',
			text: {
				type: 'mrkdwn',
				text: '*Hey* Barry! It’s time to enter the draw for the next cycle of company lunches.\n' +
					'\n'
			}
		},
		{ type: 'divider' },
		{
			type: 'section',
			text: {
				type: 'mrkdwn',
				text: ':bowtie: 12/03/2020   <googlemaps|restaurant1>    vegan:green_heart:  vegetarian :orange_heart:  meat:green_heart:  halal:question:'
			}
		},
		{
			type: 'actions', elements: [{
				type: 'button',
				text: { type: 'plain_text', emoji: false, text: 'Available' },
				style: 'primary',
				value: '10-restaurant1'
			},
			{
				type: 'button',
				text: { type: 'plain_text', emoji: false, text: 'Unavailable' },
				value: '10-restaurant1'
			}]
		},
		{ type: 'divider' },
		{
			type: 'section',
			text: {
				type: 'mrkdwn',
				text: ':smile: 19/03/2020   <googlemaps|restaurant2>    vegan:green_heart:  vegetarian :orange_heart:  meat:green_heart:  halal:question:'
			}
		},
		{
			type: 'actions', elements: [{
				type: 'button',
				text: { type: 'plain_text', emoji: false, text: 'Available' },
				style: 'primary',
				value: '10-restaurant1'
			},
			{
				type: 'button',
				text: { type: 'plain_text', emoji: false, text: 'Unavailable' },
				value: '10-restaurant1'
			}]
		},
		{ type: 'divider' },
		{
			type: 'section',
			text: {
				type: 'mrkdwn',
				text: ':simple_smile: 26/03/2020   <googlemaps|restaurant3>    vegan:green_heart:  vegetarian :orange_heart:  meat:green_heart:  halal:question:'
			}
		},
		{
			type: 'actions', elements: [{
				type: 'button',
				text: { type: 'plain_text', emoji: false, text: 'Available' },
				style: 'primary',
				value: '10-restaurant1'
			},
			{
				type: 'button',
				text: { type: 'plain_text', emoji: false, text: 'Unavailable' },
				value: '10-restaurant1'
			}]
		},
		{ type: 'divider' },
		{
			type: 'section',
			text: {
				type: 'mrkdwn',
				text: ':laughing: 02/04/2020   <googlemaps|restaurant4>    vegan:green_heart:  vegetarian :orange_heart:  meat:green_heart:  halal:question:'
			}
		},
		{
			type: 'actions', elements: [{
				type: 'button',
				text: { type: 'plain_text', emoji: false, text: 'Available' },
				style: 'primary',
				value: '10-restaurant1'
			},
			{
				type: 'button',
				text: { type: 'plain_text', emoji: false, text: 'Unavailable' },
				value: '10-restaurant1'
			}]
		},
		{ type: 'divider' },
		{
			type: 'section',
			text: {
				type: 'mrkdwn',
				text: ':blush: 09/04/2020   <googlemaps|restaurant5>    vegan:green_heart:  vegetarian :orange_heart:  meat:green_heart:  halal:question:'
			}
		},
		{
			type: 'actions', elements: [{
				type: 'button',
				text: { type: 'plain_text', emoji: false, text: 'Available' },
				style: 'primary',
				value: '10-restaurant1'
			},
			{
				type: 'button',
				text: { type: 'plain_text', emoji: false, text: 'Unavailable' },
				value: '10-restaurant1'
			}]
		},
		{ type: 'divider' },
		{
			type: 'section',
			text: {
				type: 'mrkdwn',
				text: ':relaxed: 16/04/2020   <googlemaps|restaurant6>    vegan:green_heart:  vegetarian :orange_heart:  meat:green_heart:  halal:question:'
			}
		},
		{
			type: 'actions', elements: [{
				type: 'button',
				text: { type: 'plain_text', emoji: false, text: 'Available' },
				style: 'primary',
				value: '10-restaurant1'
			},
			{
				type: 'button',
				text: { type: 'plain_text', emoji: false, text: 'Unavailable' },
				value: '10-restaurant1'
			}]
		},
		{ type: 'divider' },
		{
			type: 'section',
			text: {
				type: 'mrkdwn',
				text: ':green_heart: = Great          :orange_heart: = Some          :broken_heart: = None          :question: = Unknown'
			}
		}
	]
}
	
	function lunchCycleStub() {
		return ` LunchCycle {
			id: 1,
			restaurants: [
				Restaurant {
					name: 'Restaurant-1',
					dietaries: [Object],
					notes: '',
					emoji: ':bowtie:',
					direction: 'googlemaps',
					date: undefined
				},
				Restaurant {
					name: 'Restaurant-2',
					dietaries: [Object],
					notes: '',
					emoji: ':bowtie:',
					direction: 'googlemaps',
					date: undefined
				},
				Restaurant {
					name: 'Restaurant-3',
					dietaries: [Object],
					notes: '',
					emoji: ':bowtie:',
					direction: 'googlemaps',
					date: undefined
				},
				Restaurant {
					name: 'Restaurant-4',
					dietaries: [Object],
					notes: '',
					emoji: ':bowtie:',
					direction: 'googlemaps',
					date: undefined
				}
			],
			starts_at: null,
			created_at: 2019-12-12T15:42:37.311Z,
			updated_at: 2019-12-12T15:42:37.311Z
		} `
	}
	
