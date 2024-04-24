require("dotenv").config();
const Cart = require("../model/Cart");
const User = require("../model/User");
const Warmindo = require("../model/Warmindo");
const Menu = require("../model/Menu");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const key = process.env.TOKEN_SECRET_KEY;
//const cloudinary = require("../util/cloudinary_config");
//const fs = require("fs");

const getCartByUserId = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;
    let token;
    if ((authorization !== null) & authorization.startsWith("Bearer ")) {
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
      const error = new Error(`User with id ${id} not exist!`);
      error.statusCode = 400;
      throw error;
    }

    const currentCart = await Cart.findAll({
      attributes: ["id", "quantity"],
      include: [
        {
          model: User,
          attributes: ["id", "fullName"],
        },
        {
          model: Menu,
          attributes: ["name", "price"],
          include: {
            model: Warmindo,
            attributes: ["name", "address"],
          },
        },
      ],
      where: {
        userId: loggedUser.id,
      },
    });

    if (!currentCart) {
      const error = new Error(
        `Cart with id_user ${loggedUser.id} is not existed`
      );
      error.statusCode = 400;
      throw error;
    }

    res.status(200).json({
      status: "Success",
      message: `Successfully fetch Cart data with id_user ${loggedUser.id}`,
      currentCart,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message,
    });
  }
};

const postMenuToCart = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;
    let token;
    if ((authorization !== null) & authorization.startsWith("Bearer ")) {
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
      const error = new Error(`User with id ${id} not exist!`);
      error.statusCode = 400;
      throw error;
    }

    const { id_menu, quantity } = req.body;

    //insert data ke tabel User
    const currentCart = await Cart.create({
      userId: loggedUser.id,
      menuId: id_menu,
      quantity,
    });

    //send response
    res.status(201).json({
      status: "success",
      message: "Add new menu to Cart successfull!",
      currentCart,
    });
  } catch (error) {
    //jika status code belum terdefined maka status = 500;
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message,
    });
  }
};

const deleteCart = async (req, res, next) => {
  try {
    const { id_menu } = req.params;
    const authorization = req.headers.authorization;
    let token;

    if (authorization && authorization.startsWith("Bearer ")) {
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
      const error = new Error(`User with id ${decoded.userId} does not exist!`);
      error.statusCode = 400;
      throw error;
    }

    const userId = decoded.userId;

    // Memeriksa apakah pengguna memiliki izin untuk mengakses cart
    const cartToDelete = await Cart.findOne({
      where: {
        menuId: id_menu,
        userId: userId,
      },
    });

    if (!cartToDelete) {
      const error = new Error(`You are not authorized to delete this cart`);
      error.statusCode = 403; // Forbidden
      throw error;
    }

    // Lakukan penghapusan cart
    await Cart.destroy({
      where: {
        menuId: id_menu,
        userId: userId,
      },
    });

    res.status(200).json({
      status: "Success",
      message: `Successfully delete Cart data with id ${id_menu}`,
    });
  } catch (error) {
    console.log(error.message);
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message,
    });
  }
};

const updateCart = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;
    let token;
    if (authorization && authorization.startsWith("Bearer ")) {
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
      const error = new Error(`User with id ${decoded.userId} does not exist!`);
      error.statusCode = 400;
      throw error;
    }

    const { id_menu, quantity } = req.body;
    const userId = decoded.userId;

    // Memeriksa apakah pengguna memiliki izin untuk mengakses cart
    if (!(await isUserAuthorized(userId, id_menu))) {
      const error = new Error(`You are not authorized to update this cart`);
      error.statusCode = 403; // Forbidden
      throw error;
    }

    // Lakukan pembaruan cart
    const updatedCart = await Cart.update(
      { quantity },
      { where: { menuId: id_menu, userId: userId } }
    );

    res.status(200).json({
      status: "Success",
      message: `Successfully updated Cart data with id ${id_menu}`,
      updated: {
        updatedCart,
      },
    });
  } catch (error) {
    console.log(error.message);
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message,
    });
  }
};

// Fungsi untuk memeriksa otorisasi pengguna terhadap cart
const isUserAuthorized = async (userId, menuId) => {
  try {
    const cart = await Cart.findOne({ where: { menuId, userId } });
    return cart !== null;
  } catch (error) {
    console.log(error.message);
    return false;
  }
};

module.exports = {
  getCartByUserId,
  postMenuToCart,
  updateCart,
  deleteCart,
};
