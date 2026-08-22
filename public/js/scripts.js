(function () {
  var files = []; // { id, file, name, size }
  var uid = 0;
  var state = 'idle'; // idle | processing | success

  var dropzone, fileInput, filelistEl, statusLine, mergeBtn, noticeSlot, liveRegion;
  var card = document.getElementById('card');
  var toastEl = document.getElementById('toast');

  var ICON_TRASH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0-1 12a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1L6 7"/></svg>';
  var ICON_UP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 14l6-6 6 6"/></svg>';
  var ICON_DOWN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 10l6 6 6-6"/></svg>';
  var ICON_GRIP = '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.4"/><circle cx="15" cy="6" r="1.4"/><circle cx="9" cy="12" r="1.4"/><circle cx="15" cy="12" r="1.4"/><circle cx="9" cy="18" r="1.4"/><circle cx="15" cy="18" r="1.4"/></svg>';
  var ICON_WARN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 9v4.5M12 16.5h.01M10.6 4.6 2.9 18a1.5 1.5 0 0 0 1.3 2.2h15.6A1.5 1.5 0 0 0 21.1 18L13.4 4.6a1.5 1.5 0 0 0-2.8 0Z"/></svg>';
  var ICON_CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7"/></svg>';
  var ICON_DOC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3.5h7l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19V5A1.5 1.5 0 0 1 7 3.5Z"/><path d="M14 3.5V8h4.2"/></svg>';

  function formatSize(bytes) {
    if (bytes == null) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function totalSize() {
    return files.reduce(function (sum, f) { return sum + f.size; }, 0);
  }

  function announce(msg) {
    if (liveRegion) liveRegion.textContent = msg;
  }

  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () { toastEl.classList.remove('show'); }, 2400);
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  function addFiles(fileListArg) {
    var added = 0, rejected = 0;
    Array.prototype.forEach.call(fileListArg, function (f) {
      if (f.type !== 'application/pdf' && !/\.pdf$/i.test(f.name)) {
        rejected++;
        return;
      }
      files.push({ id: ++uid, file: f, name: f.name, size: f.size });
      added++;
    });
    if (rejected) showToast(rejected === 1 ? 'Skipped 1 file — only PDFs are supported' : 'Skipped ' + rejected + ' files — only PDFs are supported');
    if (added) announce(added + ' file' + (added > 1 ? 's' : '') + ' added');
    render();
  }

  function removeFile(id) {
    var f = files.find(function (x) { return x.id === id; });
    files = files.filter(function (x) { return x.id !== id; });
    if (f) announce('Removed ' + f.name);
    render();
  }

  function moveFile(id, dir) {
    var i = files.findIndex(function (x) { return x.id === id; });
    var j = i + dir;
    if (j < 0 || j >= files.length) return;
    var tmp = files[i]; files[i] = files[j]; files[j] = tmp;
    render();
  }

  function reorderByDrag(draggedId, targetId) {
    var from = files.findIndex(function (x) { return x.id === draggedId; });
    var to = files.findIndex(function (x) { return x.id === targetId; });
    if (from === -1 || to === -1 || from === to) return;
    var item = files.splice(from, 1)[0];
    files.splice(to, 0, item);
    render();
  }

  function renderRow(f, index) {
    var li = document.createElement('li');
    li.className = 'filerow';
    li.draggable = true;
    li.dataset.id = f.id;

    li.innerHTML =
      '<span class="order-badge">' + (index + 1) + '</span>' +
      '<span class="file-meta">' +
        '<span class="file-name">' + escapeHtml(f.name) + '</span>' +
        '<span class="file-size">' + formatSize(f.size) + '</span>' +
      '</span>' +
      '<span class="grip" aria-hidden="true">' + ICON_GRIP + '</span>' +
      '<span class="row-actions">' +
        '<button class="iconbtn up-btn" aria-label="Move ' + escapeHtml(f.name) + ' earlier" ' + (index === 0 ? 'disabled' : '') + '>' + ICON_UP + '</button>' +
        '<button class="iconbtn down-btn" aria-label="Move ' + escapeHtml(f.name) + ' later" ' + (index === files.length - 1 ? 'disabled' : '') + '>' + ICON_DOWN + '</button>' +
        '<button class="iconbtn remove-btn" aria-label="Remove ' + escapeHtml(f.name) + '">' + ICON_TRASH + '</button>' +
      '</span>';

    li.querySelector('.up-btn').addEventListener('click', function () { moveFile(f.id, -1); });
    li.querySelector('.down-btn').addEventListener('click', function () { moveFile(f.id, 1); });
    li.querySelector('.remove-btn').addEventListener('click', function () { removeFile(f.id); });

    li.addEventListener('dragstart', function (e) {
      li.classList.add('dragging');
      e.dataTransfer.setData('text/plain', String(f.id));
      e.dataTransfer.effectAllowed = 'move';
    });
    li.addEventListener('dragend', function () { li.classList.remove('dragging'); });
    li.addEventListener('dragover', function (e) {
      e.preventDefault();
      li.classList.add('drop-target');
    });
    li.addEventListener('dragleave', function () { li.classList.remove('drop-target'); });
    li.addEventListener('drop', function (e) {
      e.preventDefault();
      li.classList.remove('drop-target');
      var draggedId = Number(e.dataTransfer.getData('text/plain'));
      reorderByDrag(draggedId, f.id);
    });

    return li;
  }

  function render() {
    if (state !== 'idle') return;

    filelistEl.innerHTML = '';
    files.forEach(function (f, i) { filelistEl.appendChild(renderRow(f, i)); });

    card.classList.toggle('compact', files.length > 0);

    if (files.length === 0) {
      statusLine.textContent = 'No files yet';
      mergeBtn.textContent = 'Choose at least 2 PDFs';
      mergeBtn.disabled = true;
    } else if (files.length === 1) {
      statusLine.textContent = '1 file · ' + formatSize(totalSize());
      mergeBtn.textContent = 'Add 1 more PDF';
      mergeBtn.disabled = true;
    } else {
      statusLine.textContent = files.length + ' files · ' + formatSize(totalSize()) + ' total';
      mergeBtn.textContent = 'Merge ' + files.length + ' PDFs';
      mergeBtn.disabled = false;
    }
  }

  function clearNotice() {
    if (noticeSlot) noticeSlot.innerHTML = '';
  }

  function showErrorNotice(message) {
    noticeSlot.innerHTML =
      '<div class="notice warn" role="alert">' + ICON_WARN +
      '<div class="notice-body"><strong>Couldn’t merge these files</strong>' +
      escapeHtml(message || 'Something interrupted the merge. Your files are still selected below — try again.') +
      '</div></div>';
  }

  function bindIdleRefs() {
    dropzone = document.getElementById('dropzone');
    fileInput = document.getElementById('file-input');
    filelistEl = document.getElementById('filelist');
    statusLine = document.getElementById('status-line');
    mergeBtn = document.getElementById('merge-btn');
    noticeSlot = document.getElementById('notice-slot');
    liveRegion = document.getElementById('live-region');

    dropzone.addEventListener('click', function () { fileInput.click(); });
    dropzone.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click(); }
    });
    dropzone.addEventListener('dragover', function (e) { e.preventDefault(); dropzone.classList.add('drag-over'); });
    dropzone.addEventListener('dragleave', function () { dropzone.classList.remove('drag-over'); });
    dropzone.addEventListener('drop', function (e) {
      e.preventDefault();
      dropzone.classList.remove('drag-over');
      if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
    });
    fileInput.addEventListener('change', function () {
      if (fileInput.files.length) addFiles(fileInput.files);
      fileInput.value = '';
    });
    mergeBtn.addEventListener('click', submitMerge);
  }

  function setBodyState(nextState, opts) {
    state = nextState;

    if (nextState === 'idle') {
      card.innerHTML =
        '<div id="notice-slot"></div>' +
        '<div class="dropzone" id="dropzone" tabindex="0" role="button" aria-label="Add PDF files">' +
          '<svg class="dz-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 3.5h7l4 4V19a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19V5A1.5 1.5 0 0 1 7 3.5Z"/><path d="M14 3.5V8h4.2"/><path d="M9 13.2h6M9 16.4h4.2"/></svg>' +
          '<div class="dz-title">Drop PDFs here, or <span class="accent-word">browse files</span></div>' +
          '<div class="dz-hint">You can add more at any point before merging</div>' +
          '<input type="file" id="file-input" accept="application/pdf" multiple aria-hidden="true" tabindex="-1">' +
        '</div>' +
        '<ul class="filelist" id="filelist"></ul>' +
        '<div class="card-footer">' +
          '<span class="status-line" id="status-line">No files yet</span>' +
          '<button class="btn btn-primary" id="merge-btn" disabled>Choose at least 2 PDFs</button>' +
        '</div>' +
        '<div id="live-region" class="sr-only" role="status" aria-live="polite"></div>';
      card.className = 'card';
      bindIdleRefs();
      if (opts && opts.showError) showErrorNotice(opts.message);
      render();
      return;
    }

    if (nextState === 'processing') {
      card.className = 'card';
      card.innerHTML =
        '<div class="state-panel">' +
          '<div class="spinner" aria-hidden="true"></div>' +
          '<div class="state-title">Merging ' + files.length + ' files…</div>' +
          '<div class="progress-track"><div class="progress-fill"></div></div>' +
          '<div class="state-sub">Combining your PDFs…</div>' +
        '</div>' +
        '<div id="live-region" class="sr-only" role="status" aria-live="polite">Merging ' + files.length + ' files</div>';
      return;
    }

    if (nextState === 'success') {
      var mergedCount = opts && opts.count != null ? opts.count : files.length;
      var resultSize = opts && opts.size != null ? formatSize(opts.size) : '';
      card.className = 'card';
      card.innerHTML =
        '<div class="state-panel">' +
          '<div class="result-icon">' + ICON_CHECK + '</div>' +
          '<div class="state-title">Merged ' + mergedCount + ' PDFs into one file</div>' +
          '<div class="result-file">' + ICON_DOC + '<span>combined.pdf' + (resultSize ? ' · ' + resultSize : '') + '</span></div>' +
          '<div class="result-actions">' +
            '<a class="btn btn-primary" id="download-btn" href="/download">Download merged PDF</a>' +
            '<button class="btn btn-ghost" id="again-btn">Merge different files</button>' +
          '</div>' +
        '</div>' +
        '<div id="live-region" class="sr-only" role="status" aria-live="polite">Merge complete. combined.pdf is ready to download.</div>';
      document.getElementById('again-btn').addEventListener('click', function () {
        files = [];
        setBodyState('idle');
      });
      return;
    }
  }

  function submitMerge() {
    if (files.length < 2) return;

    var mergedCount = files.length;
    var formData = new FormData();
    files.forEach(function (f) { formData.append('pdfs', f.file, f.name); });

    setBodyState('processing');

    fetch('/fileupload', { method: 'POST', body: formData })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (data) {
          if (!res.ok || !data.ok) {
            throw new Error(data.message || 'Something interrupted the merge.');
          }
          return data;
        });
      })
      .then(function (data) {
        setBodyState('success', { count: mergedCount, size: data.size });
      })
      .catch(function (err) {
        setBodyState('idle', { showError: true, message: err.message });
      });
  }

  bindIdleRefs();
  render();
})();
