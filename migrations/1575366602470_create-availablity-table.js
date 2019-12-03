exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable("availability", {
    id: 'id',
    lunch_cycle_id: {
      type: "integer",
      notNull: true,
      references: '"lunch_cycles"',
      onDelete: "CASCADE"
    },
    slack_user_id: {
      type: "text",
      notNull: true
    },
    available: {
      type: "boolean",
      notNull: true
    },
    restaurant_name: {
      type: "text",
      notNull: true
    },
    created_at: {
      type: "timestamp with time zone",
      notNull: true,
      default: pgm.func("current_timestamp")
    }
  })
  
  pgm.createIndex("availability", "lunch_cycle_id");
  pgm.createIndex("availability", "slack_user_id");
  pgm.createIndex("availability", ["lunch_cycle_id", "slack_user_id"], { unique: true });

};

exports.down = (pgm) => {
  pgm.dropTable("availability");
};
