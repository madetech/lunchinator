exports.shorthands = undefined;

exports.down = pgm => {
  pgm.dropColumns("lunch_cycles", ["is_sent"]);
};
