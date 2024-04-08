require("dotenv").config();
const Warmindo = require("../model/Warmindo");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const key = process.env.TOKEN_SECRET_KEY;
//const cloudinary = require("../util/cloudinary_config");
//const fs = require("fs");

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
    const { name, address } = req.body;

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

    const updatedWarmindo = await Warmindo.update(
      {
        name,
        address,
      },
      {
        where: {
          id: currentWarmindo.id,
        },
      }
    );

    res.status(200).json({
      status: "Success",
      message: `Successfully update warmindo data with id ${id}`,
      updated: {
        name: currentWarmindo.name,
        address: currentWarmindo.address,
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
