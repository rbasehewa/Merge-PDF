function addFormRow() {
    $('<div class="form-group file"><input type="file" name="filetoupload2"><button type="button" onclick="removeThisFormRow(this)">X</button></div>').appendTo('#file-upload-fields');
}
function removeThisFormRow(el){
    $(el).closest('.form-group').remove();
}

function sumbitForm()
{
    alert('This will submit the form via ajax');
    alert('And then return a download link to the screen');
}
$('document').ready(function () {

    $("#pdf_form").submit(function(e) {

        e.preventDefault(); // avoid to execute the actual submit of the form.

        var form = $(this);
        var url = form.attr('action');

        $.ajax({
            type: "POST",
            url: url,
            data: form.serialize(), // serializes the form's elements.
            success: function(data)
            {
                alert(data); // show response from the php script.
            }
        });


    });

})