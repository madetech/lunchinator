exports.shorthands = undefined;

exports.up = pgm => {
  pgm.createTable("lunch_cycles", {
    id: "id",
    restaurants: { type: "json", notNull: true },
    starts_at: { type: "timestamp with time zone" },
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
};

exports.down = pgm => {
  pgm.dropTable("lunch_cycles");
};
