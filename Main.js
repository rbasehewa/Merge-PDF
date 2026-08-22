var express = require('express');
var app = express();
var path = require('path');
var multer = require('multer');
var crypto = require('crypto');
var fs = require('fs');
var execFile = require('child_process').execFile;

// easy-pdf-merge shells out via a joined command string and fails to quote
// its own jar path, which breaks on Windows paths containing spaces. Invoke
// the jar it bundles directly with an argument array instead (no shell).
var pdfBoxJar = path.join(__dirname, 'node_modules', 'easy-pdf-merge', 'jar', 'pdfbox.jar');


var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads')
  },
  filename: function (req, file, cb) {
    cb(null, crypto.randomUUID() + '.pdf')
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
  const files = req.files || [];
  const cleanup = function () {
    files.forEach(function (file) { fs.unlink(file.path, function () {}); });
  };

  if (files.length < 2) {
    cleanup();
    return res.status(400).json({ ok: false, message: 'Select at least two PDFs to merge.' });
  }

  const newpath = path.join(__dirname, 'output', 'out.pdf');
  const urls = files.map(function (file) { return file.path; });

  execFile('java', ['-jar', pdfBoxJar, 'PDFMerger'].concat(urls, [newpath]), function (err) {
    cleanup();

    if (err) {
      console.error(err);
      return res.status(500).json({ ok: false, message: 'Something went wrong while combining your PDFs.' });
    }

    fs.stat(newpath, function (statErr, stats) {
      console.log('Successfully merged!');
      res.json({ ok: true, filename: 'combined.pdf', size: statErr ? null : stats.size });
    });
  });

});

app.get('/download', function (req, res) {
  const filePath = path.join(__dirname, 'output', 'out.pdf');
  res.download(filePath, 'combined.pdf', function (err) {
    if (err && !res.headersSent) {
      res.status(404).send('No merged file is available yet.');
    }
  });
});

app.listen(8080);