const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function(req, file, callback){
    callback(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

function checkFileType(file, callback){
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname){
    return callback(null,true);
  } else {
    callback('Error: Images Only!');
  }
}

const upload = multer({
  storage: storage,
  limits:{fileSize: 1000000},
  fileFilter: function(req, file, callback){
    checkFileType(file, callback);
  }
}).single('profilePicture');



module.exports = upload;