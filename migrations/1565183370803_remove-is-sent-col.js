exports.shorthands = undefined;

exports.up = pgm => {
  pgm.dropColumns("lunch_cycles", ["is_sent"]);
};
