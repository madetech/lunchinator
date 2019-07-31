exports.shorthands = undefined;

exports.up = pgm => {
  pgm.createTable("slack_user_responses", {
    lunch_cycle_id: {
      type: "integer",
      notNull: true,
      references: '"lunch_cycles"',
      primaryKey: true,
      onDelete: "cascade"
    },
    slack_user_id: {
      type: "varchar(100)",
      notNull: true,
      primaryKey: true
    },
    email: { type: "varchar(256)" },
    first_name: { type: "varchar(256)" },
    message_channel: { type: "varchar(256)" },
    message_id: { type: "varchar(256)" },
    available_emojis: { type: "json" },
    created_at: {
      type: "timestamp with time zone",
      notNull: true,
      default: pgm.func("current_timestamp")
    },
    updated_at: {
      type: "timestamp with time zone",
      notNull: true,
      default: pgm.func("current_timestamp")
    }
  });

  pgm.createIndex("slack_user_responses", "lunch_cycle_id");
  pgm.createIndex("slack_user_responses", "slack_user_id");
  pgm.createIndex("slack_user_responses", ["lunch_cycle_id", "slack_user_id"], { unique: true });
};

exports.down = pgm => {
  pgm.dropTable("slack_user_responses");
};
