module.exports = {
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || null,
  database: process.env.DB_NAME || 'projeto2',
  host: process.env.DB_HOST || '127.0.0.1',
  dialect: 'mysql',
};
