require("dotenv").config();

//ambil module express
const mysql = require("mysql2")
const express = require("express");
const app = express();
const cors = require('cors');

//ambil router yang mengandle endpoint user
const cartRouter = require("./routes/cart");
//const categoryRouter = require('./routes/category');
const menuRouter = require("./routes/menu");
const orderRouter = require("./routes/order");
const userRouter = require("./routes/user");
const warmindoRouter = require("./routes/warmindo");
const association = require("./util/assoc_db");

//ambil data dari dotenv
const PORT = process.env.PORT;

// konek ke db
// const db = mysql.createConnection({
//   host : "localhost",
//   database : process.env.DB_NAME,
//   user : process.env.DB_USERNAME,
//   password : process.env.DB_PASSWORD
// })

// db.connect((err) => {
//   if (err) throw err
//   console.log("database connected...")

//   const sql = "SELECT * FROM users"
//   db.query(sql, (err, result) => {
//     console.log("hasil database ->", result)
//     app.get("/", (req, res) => {
//       res.send(result)
//     })
//   })
// })

// Gunakan cors middleware
app.use(cors());

//untuk ngambil request body
app.use(express.json());

//jalanin router
app.use(cartRouter);
//app.use(categoryRouter);
app.use(menuRouter);
app.use(orderRouter);
app.use(userRouter);
app.use(warmindoRouter);

app.use("/", (req, res, next) => {
  res.status(404).json({
    message: "Resource not found!",
  });
});



association()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err.message);
  });
