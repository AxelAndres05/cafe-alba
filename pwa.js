/* PWA - registro del service worker, botón "Instalar app" y avisos de conexión */
(function () {
  'use strict';

  /* ---------- Aviso (usa el mismo elemento .toast de la página) ---------- */
  var toastTimer;
  function aviso(texto, ms) {
    var toast = document.querySelector('.toast');
    if (!toast) return;
    toast.textContent = texto;
    toast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('visible'); }, ms || 3000);
  }

  /* ---------- Service Worker ---------- */
  // Solo funciona en HTTPS o en localhost (no abriendo el archivo directo con file://)
  var seguro = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  if ('serviceWorker' in navigator && seguro) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').then(function (reg) {
        reg.addEventListener('updatefound', function () {
          var nuevo = reg.installing;
          if (!nuevo) return;
          nuevo.addEventListener('statechange', function () {
            // Ya había un SW activo: significa que hay una versión nueva del sitio
            if (nuevo.state === 'installed' && navigator.serviceWorker.controller) {
              aviso('✨ Hay una versión nueva. Recarga para verla.', 6000);
            }
          });
        });
      }).catch(function (err) { console.warn('No se pudo registrar el service worker:', err); });
    });
  }

  /* ---------- Botón "Instalar app" ---------- */
  var botones = document.querySelectorAll('.btn-instalar');
  var eventoInstalar = null;
  var instalada = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  var esIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;

  function mostrarBotones(si) {
    botones.forEach(function (b) { b.hidden = !si; });
  }

  // Chrome, Edge, Android, etc.
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    eventoInstalar = e;
    if (!instalada) mostrarBotones(true);
  });

  // Safari en iPhone/iPad no tiene el evento: se muestran instrucciones
  if (esIOS && !instalada) mostrarBotones(true);

  botones.forEach(function (b) {
    b.addEventListener('click', function () {
      if (eventoInstalar) {
        eventoInstalar.prompt();
        eventoInstalar.userChoice.then(function (r) {
          if (r.outcome === 'accepted') aviso('☕ ¡Instalando Café Alba!');
          eventoInstalar = null;
          mostrarBotones(false);
        });
      } else if (esIOS) {
        aviso('En Safari toca Compartir y luego "Añadir a pantalla de inicio".', 6000);
      }
    });
  });

  window.addEventListener('appinstalled', function () {
    eventoInstalar = null;
    mostrarBotones(false);
    aviso('🎉 ¡Café Alba instalada!');
  });

  /* ---------- Estado de la conexión ---------- */
  window.addEventListener('offline', function () { aviso('📡 Sin conexión. Verás las páginas guardadas.', 4000); });
  window.addEventListener('online', function () { aviso('✅ Conexión recuperada.'); });
})();
