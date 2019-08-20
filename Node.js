var http = require('http');
var formidable = require('formidable');
var fs = require('fs');

http.createServer(function (req, res) {
    if (req.url == '/fileupload') {
        var form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            var oldpath = files.filetoupload.path;
            var newpath = '/home/ryan/Projects/pdf_merge/tempfile/' + files.filetoupload.name;
            fs.rename(oldpath, newpath, function (err) {
                if (err) throw err;
                res.write('File uploaded and moved!');
                res.end();
            });
        });
    } else {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write('<form action="fileupload" method="post" enctype="multipart/form-data">');
        res.write('<input type="file" name="filetoupload"><br>');
        res.write('<input type="submit">');
        res.write('</form>');
        return res.end();
    }
}).listen(8080);




// var http = require('http');
// var formidable = require('formidable');
// var fs = require('fs');
//
// http.createServer(function (req, res) {
//     if (req.url == '/fileupload') {
//
//
//         var merge = require('easy-pdf-merge');
//         merge(['/home/ryan/Projects/pdf_merge/tempfile/1.pdf','/home/ryan/Projects/pdf_merge/tempfile/2.pdf'],'/home/ryan/Projects/pdf_merge/tempfile/temp/',function(err){
//
//             if(err)
//                 return console.log(err);
//             console.log('Successfully merged!');
//         });
//
//     } else {
//         res.writeHead(200, {'Content-Type': 'text/html'});
//         res.write('<form action="fileupload" method="post" enctype="multipart/form-data">');
//         res.write('<input type="file" name="Upload Files"><br>');
//         res.write('<input type="file" name="Upload Files"><br>');
//         res.write('<input type="file" name="Upload Files"><br>');
//         res.write('<input type="file" name="Upload Files"><br>');
//
//         res.write('<input type="submit">');
//         res.write('<input type="reset">');
//         res.write('</form>');
//         return res.end();
//     }
// }).listen(8080);
