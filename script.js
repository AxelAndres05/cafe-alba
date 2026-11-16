document.addEventListener('DOMContentLoaded', () => {

  /* ===== 1. Espacios de imagen: si falta el archivo, muestra un recuadro ===== */
  document.querySelectorAll('.img-box img').forEach(img => {
    const marcar = () => {
      const caja = img.parentElement;
      caja.classList.add('no-img');
      caja.setAttribute('data-label', img.getAttribute('src') || '');
    };
    if (img.complete && img.naturalWidth === 0) marcar();
    img.addEventListener('error', marcar);
  });

  /* ===== 2. Navbar: sombra al hacer scroll + botón subir ===== */
  const navbar = document.querySelector('.navbar');
  const btnSubir = document.querySelector('.btn-subir');
  const alScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
    if (btnSubir) btnSubir.classList.toggle('visible', window.scrollY > 500);
  };
  window.addEventListener('scroll', alScroll);
  alScroll();
  if (btnSubir) btnSubir.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ===== 3. Menú móvil ===== */
  const burger = document.querySelector('.hamburguesa');
  const links = document.querySelector('.nav-links');
  burger.addEventListener('click', () => {
    burger.classList.toggle('abierto');
    links.classList.toggle('abierto');
  });
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    burger.classList.remove('abierto');
    links.classList.remove('abierto');
  }));

  /* ===== 4. Animación al aparecer en pantalla ===== */
  const obs = new IntersectionObserver((entradas) => {
    entradas.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

  /* ===== 5. Filtros del menú ===== */
  const filtros = document.querySelectorAll('.filtro');
  const productos = document.querySelectorAll('.productos-grid .producto[data-cat]');
  filtros.forEach(btn => btn.addEventListener('click', () => {
    filtros.forEach(f => f.classList.remove('activo'));
    btn.classList.add('activo');
    const cat = btn.dataset.filtro;
    productos.forEach(p => {
      const mostrar = cat === 'todos' || p.dataset.cat === cat;
      p.classList.toggle('oculto', !mostrar);
      if (mostrar) { p.classList.remove('aparece'); void p.offsetWidth; p.classList.add('aparece'); }
    });
  }));

  /* ===== 6. Botón "+" (agregar al pedido) con aviso ===== */
  const toast = document.querySelector('.toast');
  let tiempo;
  const avisar = (texto) => {
    if (!toast) return;
    toast.textContent = texto;
    toast.classList.add('visible');
    clearTimeout(tiempo);
    tiempo = setTimeout(() => toast.classList.remove('visible'), 2200);
  };
  document.querySelectorAll('.btn-mas').forEach(b => b.addEventListener('click', () => {
    const nombre = b.closest('.producto').querySelector('h3').textContent;
    avisar('☕ ' + nombre + ' agregado a tu pedido');
  }));

  /* ===== 7. Formulario de contacto con validación ===== */
  const form = document.getElementById('formContacto');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let ok = true;
      form.querySelectorAll('[required]').forEach(input => {
        const campo = input.closest('.campo');
        let valido = input.value.trim() !== '';
        if (input.type === 'email') valido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
        campo.classList.toggle('error', !valido);
        if (!valido) ok = false;
      });
      if (ok) {
        form.reset();
        document.querySelector('.exito').classList.add('visible');
        setTimeout(() => document.querySelector('.exito').classList.remove('visible'), 5000);
      }
    });
  }

  /* ===== 8. Suscripción del footer ===== */
  const sus = document.getElementById('formSuscribir');
  if (sus) sus.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = sus.querySelector('input');
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      avisar('🎉 ¡Gracias por suscribirte!');
      sus.reset();
    } else {
      avisar('Escribe un correo válido');
    }
  });

  /* ===== 9. Año automático en el footer ===== */
  const anio = document.getElementById('anio');
  if (anio) anio.textContent = new Date().getFullYear();
});
