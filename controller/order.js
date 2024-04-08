require("dotenv").config();
const Order = require("../model/Order");
const CartOrder = require("../model/CartOrder");
const User = require("../model/User");
const Cart = require("../model/Cart");
const Menu = require("../model/Menu");
const Warmindo = require("../model/Warmindo");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const key = process.env.TOKEN_SECRET_KEY;
//const cloudinary = require("../util/cloudinary_config");
//const fs = require("fs");

const getOrderByUserId = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;
    let token;
    if (authorization !== null && authorization.startsWith("Bearer ")) {
      token = authorization.substring(7);
    } else {
      const error = new Error("You need to login");
      error.statusCode = 400;
      throw error;
    }

    const decoded = jwt.verify(token, key);

    //decoded akan punya payload/data role & userId
    const loggedUser = await User.findOne({
      where: {
        id: decoded.userId,
      },
    });

    if (!loggedUser) {
      const error = new Error(`User with id ${decoded.userId} not exist!`);
      error.statusCode = 400;
      throw error;
    }

    const currentOrder = await Order.findOne({
      attributes: ["id", "total", "status", "date"],
      where: {
        userId: loggedUser.id,
      },
      include: [
        {
          model: Cart,
          attributes: ["quantity"],
          include: [
            {
              model: User,
              attributes: ["id", "fullName"],
            },
            {
              model: Menu,
              attributes: ["price", "name"],
              include: {
                model: Warmindo,
                attributes: ["name", "address"],
              },
            },
          ],
        },
      ],
    });

    if (!currentOrder) {
      const error = new Error(
        `Order with userId ${loggedUser.id} is not existed`
      );
      error.statusCode = 400;
      throw error;
    }

    res.status(200).json({
      status: "Success",
      message: `Successfully fetch Order data with userId ${loggedUser.id}`,
      currentOrder,
      total,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message,
    });
  }
};

const postOrder = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;
    let token;
    if (authorization !== null && authorization.startsWith("Bearer ")) {
      token = authorization.substring(7);
    } else {
      const error = new Error("You need to login");
      error.statusCode = 400;
      throw error;
    }

    const decoded = jwt.verify(token, key);

    //decoded akan punya payload/data role & userId
    const loggedUser = await User.findOne({
      where: {
        id: decoded.userId,
      },
    });

    if (!loggedUser) {
      const error = new Error(`User with id ${decoded.userId} not exist!`);
      error.statusCode = 400;
      throw error;
    }

    const currentCart = await Cart.findAll({
      where: {
        userId: loggedUser.id,
      },
      include: {
        model: Menu,
        attributes: ["price", "id"],
      },
    });

    if (currentCart.length === 0) {
      const error = new Error("Your cart is empty");
      error.statusCode = 400;
      throw error;
    }

    // Menghitung total dengan mengalikan kuantitas dengan harga setiap item di keranjang
    let total = 0;
    currentCart.forEach((cartItem) => {
      total += cartItem.quantity * cartItem.menu.price;
    });

    // Memindahkan data dari Cart ke CartOrder
    const cartOrders = await Promise.all(currentCart.map(async (cartItem) => {
      const cartOrder = await CartOrder.create({
        quantity: cartItem.quantity,
        price: cartItem.menu.price,
        menuId: cartItem.menu.id,
        userId: loggedUser.id,
      });
      return cartOrder;
    }));

    const newOrder = await Order.create({
      total,
      status: "pending", // or any default status
      date: new Date(),
      userId: loggedUser.id,
    });

    // Clear the cart after placing order
    await Cart.destroy({
      where: {
        userId: loggedUser.id,
      },
    });

    res.status(201).json({
      status: "Success",
      message: "Order placed successfully",
      order: newOrder,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message,
    });
  }
};

const prossesOrder = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;
    let token;
    if (authorization !== null && authorization.startsWith("Bearer ")) {
      token = authorization.substring(7);
    } else {
      const error = new Error("You need to login");
      error.statusCode = 400;
      throw error;
    }

    const decoded = jwt.verify(token, key);

    //decoded akan punya payload/data role & userId
    const loggedUser = await User.findOne({
      where: {
        id: decoded.userId,
      },
    });

    if (!loggedUser) {
      const error = new Error(`User with id ${decoded.userId} not exist!`);
      error.statusCode = 400;
      throw error;
    }

    // Cari pesanan yang memiliki userId sesuai dengan token dan status belum diproses
    const order = await Order.findOne({
      where: {
        userId: decoded.userId,
        status: "pending" // Ubah sesuai dengan status pesanan yang ingin Anda proses
      }
    });

    // Jika tidak ada pesanan yang sesuai kriteria
    if (!order) {
      return res.status(404).json({ message: "No pending orders found for this user" });
    }

    // Ubah status pesanan menjadi "Di Proses"
    order.status = "Di Proses";
    await order.save();

    // Berhasil mengubah status pesanan
    return res.status(200).json({ message: "Order status berhasil di update menjadi 'Di Proses'" });
  } catch (error) {
    console.error("Error in processing order:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};



module.exports = {
  getOrderByUserId,
  postOrder,
  prossesOrder
};
