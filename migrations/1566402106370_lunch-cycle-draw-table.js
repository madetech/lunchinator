exports.shorthands = undefined;

exports.up = pgm => {
  pgm.createTable("lunch_cycle_draws", {
    id: "id",
    lunch_cycle_id: {
      type: "integer",
      notNull: true,
      primaryKey: true
    },
    draw: { type: "json" },
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

  pgm.createIndex("lunch_cycle_draws", "lunch_cycle_id");
};

exports.down = pgm => {
  pgm.dropTable("lunch_cycle_draws");
};
