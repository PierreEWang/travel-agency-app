const pool = require('../database');

const getAllDestinations = async () => {
  const res = await pool.query('SELECT * FROM destinations');
  return res.rows;
};

module.exports = {
  getAllDestinations
};
