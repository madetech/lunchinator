class SlashCommandFactory {
  getCommand(overrides = {}) {
    const base = {
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

    return { ...base, ...overrides };
  }
}

module.exports = SlashCommandFactory;
