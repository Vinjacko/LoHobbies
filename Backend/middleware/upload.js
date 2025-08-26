const multer = require('multer');
const path = require('path');

// crea un motore di archiviazione per salvare i file sul disco del server
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function( file, callback){
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
  fileFilter: function( file, callback){
    checkFileType(file, callback);
  }
}).single('profilePicture');  // viene caricato solo un file dal modulo HTML 'profilePicture'



module.exports = upload;