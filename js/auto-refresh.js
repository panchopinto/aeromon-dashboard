
(function () {
  function ready(fn){ if(document.readyState !== 'loading'){ fn(); } else { document.addEventListener('DOMContentLoaded', fn); } }
  ready(function () {
    var toggle = document.getElementById('autoRefreshToggle');
    var statusEl = document.getElementById('autoRefreshStatus');
    if(!toggle || !statusEl){ return; }

    var TOGGLE_KEY = 'autoRefresh:on';
    var timer = null;

    function setBadge(on){
      statusEl.textContent = on ? 'ON (cada 1 min)' : 'OFF';
      statusEl.classList.toggle('on', on);
      statusEl.classList.toggle('off', !on);
    }

    function start(){
      stop();
      timer = setInterval(function(){
        // Recarga toda la página para rehacer las lecturas desde Google Sheets
        location.reload();
      }, 60000);
    }

    function stop(){
      if(timer){ clearInterval(timer); timer = null; }
    }

    // Cargar estado persistido
    var saved = localStorage.getItem(TOGGLE_KEY);
    if(saved !== null){
      toggle.checked = saved === '1';
    }
    setBadge(toggle.checked);
    if(toggle.checked){ start(); }

    toggle.addEventListener('change', function(){
      var on = toggle.checked;
      localStorage.setItem(TOGGLE_KEY, on ? '1' : '0');
      setBadge(on);
      if(on){ start(); } else { stop(); }
    });
  });
})();
