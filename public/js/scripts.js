function addFormRow() {
    $('<div class="form-group file"><input type="file" name="pdfs"><button type="button" onclick="removeThisFormRow(this)">X</button></div>').appendTo('#file-upload-fields');
}
function removeThisFormRow(el) {
    $(el).closest('.form-group').remove();
}
