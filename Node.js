var http = require('http');
var formidable = require('formidable');
var fs = require('fs');


http.createServer(function (req, res) {
    if (req.url == '/fileupload') {
        var form = new formidable.IncomingForm();
        var merge = require('easy-pdf-merge');
        res.write('done');

        // console.log(form.parse(req));
        form.parse(req, function (err, file, files) {
            console.log(files);

            // var oldpath1 = files.filetoupload1.path;
            // var oldpath2 = files.filetoupload2.path;
            // var newpath = '/home/ryan/Projects/pdf_merge/tempfile/temp/' + files.filetoupload1.name;
            //
            // var urls = [
            //     oldpath1,
            //     oldpath2
            // ];
            //
            // merge(urls,newpath,function(err){
            //
            //     if(err)
            //         return console.log(err);
            //     else
            //         res.write('Successfully merged!');
            //         console.log('Successfully merged!');
            //     // '<script> alert("Success");</script>'
            //
            //
            //     res.end();
            // });


        });
    }

    // var counter = 1;
    // var limit = 3;
    // function addInput(divName){
    //     if (counter == limit)  {
    //         alert("You have reached the limit of adding " + counter + " inputs");
    //     }
    //     else {
    //         var newdiv = document.createElement('div');
    //         newdiv.innerHTML = "Entry " + (counter + 1) + " <br><input type='text' name='myInputs[]'>";
    //         document.getElementById(divName).appendChild(newdiv);
    //         counter++;
    //     }
    // }

}).listen(8080);









// var formidable = require('formidable'),
//     http = require('http'),
//     util = require('util');
//
// http.createServer(function(req, res) {
//     if (req.url == '/upload' && req.method.toLowerCase() == 'post') {
//         // parse a file upload
//         var form = new formidable.IncomingForm();
//
//         form.parse(req, function(err, fields, files) {
//             res.writeHead(200, {'content-type': 'text/plain'});
//             res.write('received upload:\n\n');
//             res.end(util.inspect({fields: fields, files: files}));
//         });
//
//         return;
//     }
//
//     // show a file upload form
//     res.writeHead(200, {'content-type': 'text/html'});
//     res.end(
//
//     // '<form action="/uploadmultiple"  enctype="multipart/form-data" method="POST">'+
//     //     'Select images:'+ '<input type="file" name="myFiles" multiple>'+
//     // '<input type="submit" value="Upload your files"/>'+
//     //     '</form>'
//
//         '<form action="/upload" enctype="multipart/form-data" method="post">'+
//         '<input type="text" name="title"><br>'+
//         '<input type="file" name="upload" multiple="multiple"><br>'+
//         '<input type="submit" value="Upload">'+
//         '</form>'
//     );
// }).listen(8080);