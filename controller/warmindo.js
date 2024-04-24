require("dotenv").config();
const Warmindo = require("../model/Warmindo");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { picture } = require("../util/cloudinary_config");
const key = process.env.TOKEN_SECRET_KEY;
const cloudinary = require("../util/cloudinary_config");
const fs = require("fs");

const getAllWarmindo = async (req, res, next) => {
  try {
    const warmindos = await Warmindo.findAll({
      attributes: ["id", "name", "address", "picture"],
    });

    res.status(200).json({
      status: "Success",
      message: "Successfully fetch all warmindo data",
      warmindo: warmindos,
    });
  } catch (error) {
    console.log(error.message);
  }
};

//handler get warmindo by id
const getWarmindoById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentWarmindo = await Warmindo.findOne({
      attributes: ["id", "name", "address", "picture"],
      where: {
        id: id,
      },
    });

    if (!currentWarmindo) {
      const error = new Error(`Warmindo with id ${id} is not existed`);
      error.statusCode = 400;
      throw error;
    }

    res.status(200).json({
      status: "Success",
      message: `Successfully fetch warmindo data with id ${id}`,
      currentWarmindo,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message,
    });
  }
};

//handler add warmindo
const postWarmindo = async (req, res, next) => {
  try {
    const { name, address } = req.body;

    //insert data ke tabel Warmindo
    const currentWarmindo = await Warmindo.create({
      name,
      address,
    });

    //send response
    res.status(201).json({
      status: "success",
      message: "Add Warmindo Successfull!",
      currentWarmindo,
    });
  } catch (error) {
    //jika status code belum terdefined maka status = 500;
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message,
    });
  }
};

//handler delete warmindo by id
const deleteWarmindo = async (req, res, next) => {
  //hanya admin yang bisa ngedelete
  try {
    const { id } = req.params;
    const targetedWarmindo = await Warmindo.destroy({
      where: {
        id: id,
      },
    });

    if (!targetedWarmindo) {
      const error = new Error(`Warmindo with id ${id} is not existed`);
      error.statusCode = 400;
      throw error;
    }

    res.status(200).json({
      status: "Success",
      message: `Successfully delete warmindo data with id ${id}`,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "Error",
      message: error.message,
    });
  }
};

const updateWarmindo = async (req, res, next) => {
  try {
    const { id } = req.params;

    const currentWarmindo = await Warmindo.findOne({
      where: {
        id: id,
      },
    });

    if (!currentWarmindo) {
      const error = new Error(`Warmindo with id ${id} is not existed`);
      error.statusCode = 400;
      throw error;
    }

    let pictureUrl = currentWarmindo.picture; // Inisialisasi URL gambar dengan gambar yang sudah ada

    // Proses upload gambar baru ke Cloudinary jika ada file yang diunggah
    if (req.file) {
      const file = req.file;

      // Konfigurasi upload ke Cloudinary
      const uploadOptions = {
        folder: "warmindo_profile/", // Folder di Cloudinary untuk menyimpan gambar warmindo
        public_id: `warmindo_${id}`, // Nama public_id unik untuk gambar warmindo
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

    await currentWarmindo.update({
      name: req.body.name || currentWarmindo.name,
      address: req.body.address || currentWarmindo.address,
      picture: pictureUrl,
    });

    // Update data warmindo di database
    const updatedWarmindo = await Warmindo.findOne({
      where: {
        id: currentWarmindo.id,
      },
      attributes: ["id", "name", "address", "picture"],
    });

    res.status(200).json({
      status: "Success",
      message: `Successfully update warmindo data with id ${id}`,
      updated: {
        id: updatedWarmindo.id,
        name: updatedWarmindo.name,
        address: updatedWarmindo.address,
        picture: updatedWarmindo.picture,
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
  getAllWarmindo,
  getWarmindoById,
  postWarmindo,
  deleteWarmindo,
  updateWarmindo,
};
