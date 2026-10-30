(function () {
  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('nav');
  if (btn && nav) {
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open);
    });
  }

  // Prefill quote form from URL (?material=...&location=...)
  var params = new URLSearchParams(location.search);
  var mat = document.getElementById('material');
  if (mat && params.get('material')) {
    for (var i = 0; i < mat.options.length; i++) {
      if (mat.options[i].text === params.get('material')) { mat.selectedIndex = i; break; }
    }
  }
  var loc = document.getElementById('location');
  if (loc && params.get('location')) loc.value = params.get('location');

  // Quantity calculator
  var l = document.getElementById('c-l'), w = document.getElementById('c-w'), d = document.getElementById('c-d');
  var dens = document.getElementById('c-density'), out = document.getElementById('calc-out'), use = document.getElementById('calc-use');
  var last = null;
  function calc() {
    var L = parseFloat(l.value), W = parseFloat(w.value), D = parseFloat(d.value);
    if (!(L > 0 && W > 0 && D > 0)) { out.textContent = 'Enter dimensions to estimate.'; last = null; return; }
    var yd = (L * W * (D / 12)) / 27;
    var tons = yd * parseFloat(dens.value);
    last = { yd: yd, tons: tons };
    out.textContent = '≈ ' + yd.toFixed(1) + ' cubic yards  ·  ≈ ' + tons.toFixed(1) + ' tons';
  }
  if (l) {
    [l, w, d, dens].forEach(function (el) { el.addEventListener('input', calc); });
    use.addEventListener('click', function () {
      if (!last) return;
      var q = document.querySelector('#quote-form [name=quantity]');
      var u = document.querySelector('#quote-form [name=unit]');
      var soft = dens.value === '0.4' || dens.value === '1.1';
      q.value = (soft ? last.yd : last.tons).toFixed(1);
      u.value = soft ? 'Cubic yards' : 'Tons';
      document.getElementById('quote-form').scrollIntoView({ behavior: 'smooth' });
    });
  }
})();

// Forms: work on any static host (Vercel, Netlify, Cloudflare).
// If <meta name="form-endpoint"> is set (Formspree, Web3Forms, etc.) the form is POSTed there as JSON.
// Otherwise it opens a pre-filled email to the business so no request is lost.
(function () {
  var meta = function (n) { var m = document.querySelector('meta[name="' + n + '"]'); return m ? m.content : ''; };
  var endpoint = meta('form-endpoint'), email = meta('form-email');
  document.querySelectorAll('form[name]').forEach(function (form) {
    if (form.id === 'calc') return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = {}; new FormData(form).forEach(function (v, k) { data[k] = v; });
      if (data['bot-field']) return; // honeypot
      delete data['bot-field']; delete data['form-name'];
      var btn = form.querySelector('button[type=submit]'); if (btn) { btn.disabled = true; btn.textContent = 'Sending...'; }
      var done = function () { location.href = '/thank-you/'; };
      if (endpoint) {
        data._subject = 'Website ' + form.getAttribute('name') + ' request';
        fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) })
          .then(function (r) { if (!r.ok) throw new Error(r.status); done(); })
          .catch(function () { if (btn) { btn.disabled = false; btn.textContent = 'Try again'; } alert('Sorry, that did not send. Please call 817-454-5779.'); });
      } else {
        var body = Object.keys(data).filter(function (k) { return data[k]; }).map(function (k) { return k + ': ' + data[k]; }).join('\n');
        location.href = 'mailto:' + email + '?subject=' + encodeURIComponent('Website ' + form.getAttribute('name') + ' request') + '&body=' + encodeURIComponent(body);
        setTimeout(done, 800);
      }
    });
  });
})();
