const multer = require('multer');

const storage = multer.diskStorage({
  destination: function(req, file, cb){
    cb(null, 'files');
  },
  filename: function(req,file,cb){
    cb(null, file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Pastikan hanya menerima tipe file tertentu, misalnya gambar
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
}).single('file'); // Menggunakan key 'file' untuk unggahan berkas

module.exports = upload;
