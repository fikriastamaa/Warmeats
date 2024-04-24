require("dotenv").config();
const Menu = require("../model/Menu");
const Warmindo = require("../model/Warmindo");
const Category = require("../model/Category");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { where } = require("sequelize");
const key = process.env.TOKEN_SECRET_KEY;
const cloudinary = require("../util/cloudinary_config");
const fs = require("fs");

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

    let pictureUrl = currentMenu.picture; // Inisialisasi URL gambar dengan gambar yang sudah ada

    // Proses upload gambar baru ke Cloudinary jika ada file yang diunggah
    if (req.file) {
      const file = req.file;

      // Konfigurasi upload ke Cloudinary
      const uploadOptions = {
        folder: "warmeats_menu/", // Folder di Cloudinary untuk menyimpan gambar menu
        public_id: `menu_${id}`, // Nama public_id unik untuk gambar menu
        overwrite: true,
      };

      // Upload gambar ke Cloudinary
      const uploadResult = await cloudinary.uploader.upload(
        file.path,
        uploadOptions
      );

      // Dapatkan URL gambar yang diunggah
      pictureUrl = uploadResult.secure_url;

      // Hapus file yang diunggah dari direktori lokal setelah diunggah ke Cloudinary
      fs.unlinkSync(file.path);
    }

    await currentMenu.update({
      name: req.body.name || currentMenu.name,
      price: req.body.price || currentMenu.price,
      picture: pictureUrl,
    });

    // Update data menu di database
    const updatedMenu = await Menu.findOne({
      where: {
        id: currentMenu.id,
      },
      attributes: ["id", "name", "price", "picture"],
    });

    res.status(200).json({
      status: "Success",
      message: `Successfully update menu data with id ${id}`,
      updated: {
        id: updatedMenu.id,
        name: updatedMenu.name,
        price: updatedMenu.price,
        picture: updatedMenu.picture,
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
