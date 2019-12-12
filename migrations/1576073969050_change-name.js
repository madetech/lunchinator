exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.alterColumn( 'lunchers', 'first_name', { type: "text" })
  pgm.renameColumn( 'lunchers', 'first_name', 'real_name' );
};


exports.down = (pgm) => {
  pgm.renameColumn( 'lunchers',  'real_name', 'first_name');
  pgm.alterColumn( 'lunchers', 'first_name', { type: "varchar(256)" });
};
