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
    const targetedCart = await Cart.destroy({
      where: {
        menuId: id_menu,
      },
    });

    if (!targetedCart) {
      const error = new Error(`Cart with id ${id_menu} is not existed`);
      error.statusCode = 400;
      throw error;
    }

    res.status(200).json({
      status: "Success",
      message: `Successfully delete Cart data with id ${id_menu}`,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message,
    });
  }
};

const updateCart = async (req, res, next) => {
  try {
    const { menu_id } = req.params;
    const { quantity } = req.body;

    const currentCart = await Cart.findOne({
      where: {
        menuId: menu_id,
      },
    });

    if (!currentCart) {
      const error = new Error(`Cart with id ${menu_id} is not existed`);
      error.statusCode = 400;
      throw error;
    }

    await Cart.update(
      {
        quantity,
      },
      {
        where: {
          menuId: currentCart.menuId,
        },
      }
    );

    const updatedCart = await Cart.findOne({
      where: {
        menuId: currentCart.menuId,
      },
    });

    res.status(200).json({
      status: "Success",
      message: `Successfully update Cart data with id ${currentCart.menuId}`,
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

module.exports = {
  getCartByUserId,
  postMenuToCart,
  updateCart,
  deleteCart,
};
