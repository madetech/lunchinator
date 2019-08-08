exports.shorthands = undefined;

exports.up = pgm => {
  pgm.addColumns("lunch_cycles", {
    is_sent: { type: "boolean" }
  });
};
