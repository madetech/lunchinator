class SlashCommandFactory {
  getCommand(headersOverrides = {}, bodyOverrides = {}) {
    const baseHeaders = {
      "user-agent": "Slackbot 1.0 (+https://api.slack.com/robots)",
      "accept-encoding": "gzip,deflate",
      accept: "application/json,*/*",
      "x-slack-signature": "v0=xxx",
      "x-slack-request-timestamp": "1564476490",
      "content-length": "374",
      "content-type": "application/x-www-form-urlencoded",
      host: "an.endpoint.com",
      "cache-control": "max-age=259200",
      "x-forwarded-for": "1.1.1.1"
    };

    const baseBody = {
      token: "gIkuvaNzQIHg97ATvDxqgjtO",
      team_id: "madetechteam",
      team_domain: "example",
      enterprise_id: "E0001",
      enterprise_name: "MadeTech",
      channel_id: "C2147483705",
      channel_name: "test",
      user_id: "TEST_U2147483697",
      user_name: "Steve",
      command: "/lunchinator_new",
      text: "we dont use this",
      response_url: "https://hooks.slack.com/commands/1234/5678",
      trigger_id: "13345224609.738474920.8088930838d88f008e0"
    };

    return {
      headers: { ...baseHeaders, ...headersOverrides },
      body: { ...baseBody, ...bodyOverrides }
    };
  }
}

module.exports = SlashCommandFactory;
