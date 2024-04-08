require("dotenv").config();
const Menu = require("../model/Menu");
const Warmindo = require("../model/Warmindo");
const Category = require("../model/Category");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { where } = require("sequelize");
const key = process.env.TOKEN_SECRET_KEY;
//const cloudinary = require("../util/cloudinary_config");
//const fs = require("fs");

const getAllMenu = async (req, res, next) => {
  try {
    const menus = await Menu.findAll({
      attributes: ["id", "name", "price", "picture"],
      include: [
        {
          model: Warmindo,
          attributes: ["name"],
        },
        {
          model: Category,
          attributes: ["name"],
        },
      ],
    });

    res.status(200).json({
      status: "Success",
      message: "Successfully fetch all menu data",
      menus,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const getMenuByWarmindoId = async (req, res, next) => {
  try {
    const { warmindoId } = req.params;
    const currentWarmindo = await Warmindo.findOne({
      where: {
        id: warmindoId,
      },
    });

    if (!currentWarmindo) {
      const error = new Error(`Warmindo with id ${warmindoId} is not existed`);
      error.statusCode = 400;
      throw error;
    }

    const menus = await Menu.findAll({
      attributes: ["id", "name", "price", "picture"],
      include: [
        {
          model: Warmindo,
          attributes: ["name"],
        },
        {
          model: Category,
          attributes: ["name"],
        },
      ],
      where: {
        warmindoId: warmindoId,
      },
    });

    res.status(200).json({
      status: "Success",
      message: `Successfully fetch all menu data from warmindo with id ${warmindoId}`,
      menus,
    });
  } catch (error) {
    console.log(error.message);
  }
};

//handler get menu by id
const getMenuById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentMenu = await Menu.findOne({
      attributes: ["id", "name", "price", "picture"],
      include: [
        {
          model: Warmindo,
          attributes: ["name"],
        },
        {
          model: Category,
          attributes: ["name"],
        },
      ],
      where: {
        id: id,
      },
    });

    if (!currentMenu) {
      const error = new Error(`Menu with id ${id} is not existed`);
      error.statusCode = 400;
      throw error;
    }

    res.status(200).json({
      status: "Success",
      message: `Successfully fetch menu data with id ${id}`,
      currentMenu,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message,
    });
  }
};

const postMenu = async (req, res, next) => {
  try {
    const { name, price, id_warmindo, id_category } = req.body;

    //insert data ke tabel User
    const currentMenu = await Menu.create({
      name,
      price,
      warmindoId: id_warmindo,
      categoryId: id_category,
    });

    //send response
    res.status(201).json({
      status: "success",
      message: "Add new menu successfull!",
      currentMenu,
    });
  } catch (error) {
    //jika status code belum terdefined maka status = 500;
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message,
    });
  }
};

const deleteMenu = async (req, res, next) => {
  try {
    //menjalankan operasi hapus
    const { id } = req.params;

    const targetedMenu = await Menu.destroy({
      where: {
        id: id,
      },
    });

    if (!targetedMenu) {
      const error = new Error(`Menu with id ${userId} is not existed`);
      error.statusCode = 400;
      throw error;
    }

    res.status(200).json({
      status: "Success",
      message: "Successfully delete menu",
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message,
    });
  }
};

const updateMenu = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, price, picture } = req.body;

    const currentMenu = await Menu.findOne({
      where: {
        id: id,
      },
    });

    if (!currentMenu) {
      const error = new Error(`Menu with id ${id} is not existed`);
      error.statusCode = 400;
      throw error;
    }

    // let imageUrl;
    // //proses datanya
    // if (req.file) {
    //   const file = req.file;

    //   const uploadOption = {
    //     folder: "Profile_Member/",
    //     public_id: `user_${currentUser.id}`,
    //     overwrite: true,
    //   };

    //   const uploadFile = await cloudinary.uploader.upload(
    //     file.path,
    //     uploadOption
    //   );

    //   //didapat image URL
    //   imageUrl = uploadFile.secure_url;

    //   //ngehapus file yang diupload didalam dir lokal
    //   fs.unlinkSync(file.path);
    // }

    const updatedMenu = await Menu.update(
      {
        name,
        price,
        picture,
      },
      {
        where: {
          id: currentMenu.id,
        },
      }
    );

    res.status(200).json({
      status: "Success",
      message: `Successfully update menu data with id ${id}`,
      updated: {
        name: currentMenu.name,
        price: currentMenu.address,
        picture: currentMenu.picture,
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
  getAllMenu,
  getMenuByWarmindoId,
  getMenuById,
  postMenu,
  updateMenu,
  deleteMenu,
};
