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
