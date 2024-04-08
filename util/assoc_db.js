require("dotenv").config();
const Cart = require("../model/Cart");
const CartOrder = require("../model/CartOrder");
const Category = require("../model/Category");
const Menu = require("../model/Menu");
const Order = require("../model/Order");
const User = require("../model/User");
const Warmindo = require("../model/Warmindo");
const my_db = require("./connect_db");

//one to many Warmindo to Menu
Warmindo.hasMany(Menu);
Menu.belongsTo(Warmindo);

//one to many Category to Menu
Category.hasMany(Menu);
Menu.belongsTo(Category);

//one to many Cart to Menu
Menu.hasMany(Cart);
Cart.belongsTo(Menu);

//one to many User to Cart
User.hasMany(Cart);
Cart.belongsTo(User);


//one to many Order to Menu
User.hasMany(Order);
Order.belongsTo(User);

//one to many User to Cart
User.hasMany(CartOrder);
CartOrder.belongsTo(User);

//one to many User to Cart
Menu.hasMany(CartOrder);
CartOrder.belongsTo(Menu);

const makanan = {
  id: 1,
  name: "Makanan",
};

const minuman = {
  id: 2,
  name: "Minuman",
};

const association = async () => {
  try {
    await my_db.sync({ force: false });
    // await Category.create(makanan);
    // await Category.create(minuman);
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = association;
