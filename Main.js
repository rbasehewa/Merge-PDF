var express = require('express');
var app = express();
var path = require('path');
var multer = require('multer');


var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

var upload = multer({ storage: storage });


app.use(express.static('public'));

// viewed at http://localhost:8080
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});

// POST method route

app.post('/fileupload', upload.array('pdfs', 12), function (req, res, next) {
  console.log(req.fields);
  const merge = require('easy-pdf-merge');
  const urls = [];
  const newpath = 'output/out.pdf';

  req.files.forEach((file) => {
    urls.push(file.path);
  })

  merge(urls, newpath, function (err) {

    if (err)
      res.send(err);
    else
      

    // res.send('Successfully merged!');
    console.log("Successfully merged!");
    
    res.redirect('http://localhost:8080') ;
    
  
  });

});

app.listen(8080);