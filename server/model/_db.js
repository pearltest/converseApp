const Sequelize = require('sequelize');

const db = new Sequelize({
  dialect: 'mssql',
  dialectModulePath: 'sequelize-msnodesqlv8',
  dialectOptions: {
    connectionString: 'Server=eipdevdb;Database=Converse; Trusted_Connection=yes;'
  },
});


module.exports = db;
