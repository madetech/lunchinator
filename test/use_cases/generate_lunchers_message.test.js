const { GenerateLunchersMessage } = require("@use_cases");
const { expect } = require("../test_helper");
const { RestaurantFactory } = require("../factories");
const { LunchCycle } = require("@domain");

const restaurantList = [
  RestaurantFactory.getRestaurant({ name: "restaurant1", emoji: ":bowtie:", date: "12/03/2020" }),
  RestaurantFactory.getRestaurant({ name: "restaurant2", emoji: ":smile:", date: "19/03/2020" }),
  RestaurantFactory.getRestaurant({ name: "restaurant3", emoji: ":smile:", date: "23/03/2020" })
];

describe("GenerateLunchersMessage", function() {
  const lunchCycle = new LunchCycle({
    id: 10,
    restaurants: restaurantList,
    starts_at: new Date("2020-03-12T00:00:00")
  });

  it("can generate a lunch cycle message with a first name", function() {
    const slackRealName = "Barry Smith";
    const useCase = new GenerateLunchersMessage();
    const response = useCase.execute({ lunchCycle: new LunchCycle(), realName: slackRealName, available: null });

    let expected = [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `\*Hey\* ${slackRealName}! It’s time to enter the draw for the next cycle of company lunches.\n\n`
        }
      },
      {
        type: "divider"
      }
    ];

    expected.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text:
          ":green_heart: = Great          :orange_heart: = Some          :broken_heart: = None          :question: = Unknown"
      }
    });

    expect(response.blocks).to.be.eql(expected);
  });

  xit("can generate a lunch cycle message without a first name", function() {
    const noFirstName = null;
    const preview = "THIS IS A PREVIEW \n";
    const useCase = new GenerateLunchersMessage();
    const response = useCase.execute({ lunchCycle: lunchCycle, firstName: noFirstName, available: true });

    let expected = [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `${preview}\*Hey\* {full name}! It’s time to enter the draw for the next cycle of company lunches.\n\n`
        }
      },
      {
        type: "divider"
      }
    ];

    expected.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text:
          ":green_heart: = Great          :orange_heart: = Some          :broken_heart: = None          :question: = Unknown"
      }
    });

    expect(response.blocks).to.be.eql(expected);
  });
  
  it('shows the current availabllty by highlighting the corasponing',function() {
    const slackFirstName = "Barry";
    const useCase = new GenerateLunchersMessage();

    const response = useCase.execute({
      lunchCycle: lunchCycle,
      realName: slackFirstName,
      available: {
        "restaurant1": true,
        "restaurant2": false
      }
    });

    let expected = [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `\*Hey\* ${slackFirstName}! It’s time to enter the draw for the next cycle of company lunches.\n\n`
        }
      },
      {
        type: "divider"
      }
    ];

     expected = expected.concat(
    [
      {
        text: {
          text: ":bowtie: 12/03/2020   <googlemaps|restaurant1>    vegan:green_heart:  vegetarian :orange_heart:  meat:green_heart:  halal:question:",
          type: "mrkdwn"
        },
        type: "section"
      },
      {
        elements: [
          {
            style: "primary",
            text: {
              emoji: false,
              text: "Available",
              type: "plain_text"
            },
            type: "button",
            value: "10-restaurant1"
          },
          {
            text: {
              emoji: false,
              text: "Unavailable",
              type: "plain_text",
            },
            type: "button",
            value: "10-restaurant1",
          }
        ],
        type: "actions"
      },
      {
        type: "divider"
      },
      {
        text: {
          text: ":smile: 19/03/2020   <googlemaps|restaurant2>    vegan:green_heart:  vegetarian :orange_heart:  meat:green_heart:  halal:question:",
          type: "mrkdwn"
        },
        type: "section"
      },
      {
        elements: [
          {
            text: {
              emoji: false,
              text: "Available",
              type: "plain_text"
            },
            type: "button",
            value: "10-restaurant2"
          },
          {
            style: "danger",
            text: {
              emoji: false,
              text: "Unavailable",
              type: "plain_text"
            },
            type: "button",
            value: "10-restaurant2"
          }
        ],
        type: "actions"
      },
      {
        type: "divider"
      },
      {
        text: {
          text: ":smile: 23/03/2020   <googlemaps|restaurant3>    vegan:green_heart:  vegetarian :orange_heart:  meat:green_heart:  halal:question:",
          type: "mrkdwn"
        },
        type: "section"
      },
      {
        elements: [
          {
            text: {
              emoji: false,
              text: "Available",
              type: "plain_text"
            },
            type: "button",
            value: "10-restaurant3"
          },
          {
            text: {
              emoji: false,
              text: "Unavailable",
              type: "plain_text"
            },
            type: "button",
            value: "10-restaurant3"
          }
        ],
        type: "actions"
      },
      {
        type: "divider"
      },
    ])


    expected.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text:
          ":green_heart: = Great          :orange_heart: = Some          :broken_heart: = None          :question: = Unknown"
      }
    });
    expect(response.blocks).to.be.eql(expected)
  })
});
