module.exports = {
  db: {
    database: 'lunchinator_test',
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT
  }
};
