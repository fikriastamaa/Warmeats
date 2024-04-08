const Sequelize = require("sequelize");
const my_db = require("../util/connect_db");

const Cart = my_db.define("carts", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  },
  quantity: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
});

module.exports = Cart;
