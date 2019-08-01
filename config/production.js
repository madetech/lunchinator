module.exports = {
  db: {
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT
  }
};
