exports.shorthands = undefined;

exports.up = pgm => {
  pgm.renameTable("slack_user_responses", "lunchers");
};

exports.down = pgm => {
  pgm.renameTable("lunchers", "slack_user_responses");
};
