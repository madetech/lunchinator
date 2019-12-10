function slackButtonPayloadFactory(slack_user_id = "U0CA5", restaurant_name = "TheRestrauntName", lunch_cycle_id = "2") {
    return testPayload = {
      type: "block_actions",
      team: {
        id: "T0CAG",
        domain: "acme-creamery"
      },
      user: {
        id: slack_user_id,
        username: "Amy McGee",
        name: "Amy McGee",
        team_id: "T3MDE"
      },
      api_app_id: "A0CA5",
      token: "Shh_its_a_seekrit",
      container: {
        type: "message",
        text: "The contents of the original message where the action originated"
      },
      trigger_id: "12466734323.1395872398",
      response_url: "http://www.postresponsestome.com/T123567/1509734234",
      actions: [
        {
          type: "button",
          block_id: "0UBeE",
          action_id: "gxi",
          text: {
            type: "plain_text",
            text: "Approve",
            emoji: true
          },
          value: lunch_cycle_id + "-" + restaurant_name,
          action_ts: "1575295464.505259"
        }
      ]
    }
    
  }

module.exports = slackButtonPayloadFactory;
