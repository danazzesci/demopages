/* Keep startup diagnostics independent of the application module. */
(function () {
  var finished = false;
  var timer;
  function fail(message) {
    if (finished) return;
    finished = true;
    clearTimeout(timer);
    var main = document.getElementById('main');
    if (!main) return;
    main.textContent = '';
    var title = document.createElement('h2');
    title.textContent = 'The exercise could not finish loading';
    var copy = document.createElement('p');
    copy.textContent = 'Reload this page to get the current version. Your saved notes and evidence will remain in this browser.';
    var detail = document.createElement('p');
    detail.className = 'mono';
    detail.textContent = String(message);
    var reload = document.createElement('button');
    reload.className = 'primary';
    reload.textContent = 'Reload exercise';
    reload.onclick = function () {
      var url = new URL(location.href);
      url.searchParams.set('reload', Date.now());
      location.replace(url.href);
    };
    main.append(title, copy, detail, reload);
  }
  window.addEventListener('exercise-ready', function () { finished = true; clearTimeout(timer); });
  window.addEventListener('error', function (event) { if (!finished && event.message) fail(event.message); });
  window.addEventListener('unhandledrejection', function (event) {
    if (!finished) fail(event.reason && event.reason.message || event.reason || 'Startup failed.');
  });
  timer = setTimeout(function () { fail('Loading timed out. Check that the local preview server is still running.'); }, 20000);
  import('./app.js?v=20261018-hannah1').catch(function (error) { fail(error.message || error); });
})();
