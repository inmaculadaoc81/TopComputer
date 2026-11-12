(function () {
  const lista = document.getElementById('equipos-lista');
  const buscador = document.getElementById('equipos-buscador');
  const marcas = document.getElementById('equipos-marca');
  if (!lista) return;
  let equipos = [];
  const normalizar = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  function nodo(tag, clase, texto) {
    const el = document.createElement(tag); el.className = clase;
    if (texto) el.textContent = texto; return el;
  }
  function aviso(texto) {
    const p = nodo('p', 'equipos-vacio', texto);
    p.append(document.createElement('br'));
    const a = nodo('a', 'equipo-consultar', 'Consultar'); a.href = '#contacto'; p.append(a);
    lista.replaceChildren(p);
  }
  function tarjeta(e) {
    const nombre = [e.marca, e.modelo].filter(Boolean).join(' ') || 'Ordenador';
    const card = nodo('article', 'equipo-card');
    let url;
    try { const u = new URL(e.imagen_url, location.origin); if (e.imagen_url && ['https:', 'http:'].includes(u.protocol)) url = u.href; } catch (_) {}
    if (url) {
      const img = nodo('img', 'equipo-img'); img.src = url; img.alt = nombre; img.loading = 'lazy';
      img.addEventListener('error', () => img.replaceWith(nodo('div', 'equipo-img-placeholder', 'Top Computer')), {once:true});
      card.append(img);
    } else card.append(nodo('div', 'equipo-img-placeholder', 'Top Computer'));
    const body = nodo('div', 'equipo-body');
    const tipos = {Portatil:'Portátil', Normal:'PC de sobremesa'};
    const tipo = tipos[e.tipo] || e.tipo || '';
    if (tipo) body.append(nodo('div', 'equipo-tipo', tipo));
    body.append(nodo('h3', 'equipo-nombre', nombre));
    const datos = [e.procesador && 'Procesador: '+e.procesador, e.ram && 'RAM: '+e.ram, e.almacenamiento && 'Almacenamiento: '+e.almacenamiento].filter(Boolean);
    if (datos.length || e.caracteristicas) body.append(nodo('div', 'equipo-caracteristicas', datos.length ? datos.join('\n') : String(e.caracteristicas).split(',').map(x => x.trim()).join('\n')));
    const precio = Number(e.precio_venta);
    const textoPrecio = precio > 0 ? precio.toLocaleString('es-ES', {minimumFractionDigits: 0, maximumFractionDigits: 2}) + ' €' : '';
    if (textoPrecio) {
      const venta = nodo('div', 'equipo-venta');
      venta.append(nodo('div', 'equipo-precio', textoPrecio), nodo('div', 'equipo-estado', 'Disponible'));
      body.append(venta);
    }
    const a = nodo('a', 'equipo-consultar', 'Consultar');
    const referencia = e.referencia || e.id_equipo;
    a.href = '/tienda?'+new URLSearchParams({equipo:nombre+(referencia ? ' ('+referencia+')' : ''), tipo})+'#contacto';
    a.addEventListener('click', event => {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const form = document.getElementById('contact-form');
      const contacto = document.getElementById('contacto');
      if (!form || !contacto) return;
      event.preventDefault();
      const seleccionado = nombre+(referencia ? ' ('+referencia+')' : '');
      form.elements.mensaje.value = 'Hola, deseo comprar el equipo '+seleccionado.slice(0,300)+(textoPrecio ? ' ('+textoPrecio+')' : '')+' y quisiera saber si está disponible.';
      form.elements.equipo.value = seleccionado.slice(0,180);
      history.replaceState(null, '', a.href);
      contacto.scrollIntoView({behavior:'smooth', block:'start'});
      form.elements.nombre.focus({preventScroll:true});
    });
    a.setAttribute('aria-label', 'Consultar '+nombre); body.append(a); card.append(body); return card;
  }
  function render() {
    const q = normalizar(buscador.value);
    const filtrados = equipos.filter(e => (!marcas.value || normalizar(e.marca) === marcas.value) && normalizar([e.marca,e.modelo,e.tipo,e.caracteristicas,e.procesador,e.ram,e.almacenamiento].filter(Boolean).join(' ')).includes(q));
    if (!filtrados.length) return aviso(equipos.length ? 'No encontramos equipos que coincidan con tu búsqueda.' : 'Ahora mismo no hay equipos disponibles con precio publicado. Consulta qué equipo buscas y te confirmaremos las opciones disponibles.');
    lista.replaceChildren(...filtrados.map(tarjeta));
  }
  buscador.addEventListener('input', render); marcas.addEventListener('change', render);
  const ENDPOINT = 'https://db.affirmatechnology.com/kelatos-api/publico/equipos-venta';
  const esMayus = t => t === t.toLocaleUpperCase('es') && t !== t.toLocaleLowerCase('es');
  let huella = null, cargando = false, ultimaCarga = 0, cargas = 0;
  // Los equipos salen del dashboard: solo los DISPONIBLES con precio de venta. Se vuelve a leer cada minuto y al volver a la pestaña, para que un equipo
  // que se alquila desaparezca y uno que vuelve a estar disponible aparezca sin recargar. Si una actualización falla, se deja lo que ya se veía.
  function cargar(primera) {
    if (cargando) return; cargando = true;
    fetch(ENDPOINT, {cache:'no-store'}).then(r => {
      if (!r.ok) throw new Error('Catálogo no disponible'); return r.json();
    }).then(data => {
      if (!data || !data.ok || !Array.isArray(data.equipos)) throw new Error('Formato incorrecto');
      ultimaCarga = Date.now(); cargas += 1; lista.setAttribute('data-cargas', String(cargas));
      const nuevos = data.equipos.filter(e => e && typeof e === 'object' && e.activo !== false && Number(e.precio_venta) > 0);
      const h = JSON.stringify(nuevos);
      if (h === huella) return; huella = h; equipos = nuevos;
      const elegida = marcas.value;
      const opciones = new Map(); equipos.forEach(e => {
        const k = normalizar(e.marca), t = String(e.marca || '').trim();
        if (k && (!opciones.has(k) || (esMayus(opciones.get(k)) && !esMayus(t)))) opciones.set(k, t);
      });
      marcas.replaceChildren(Object.assign(document.createElement('option'), {value:'', textContent:'Todas las marcas'}));
      [...opciones].sort((a,b)=>a[1].localeCompare(b[1],'es')).forEach(([valor,texto])=> {const o = document.createElement('option');o.value=valor;o.textContent=texto;marcas.append(o);});
      marcas.value = opciones.has(elegida) ? elegida : '';
      render();
    }).catch(() => { if (primera) aviso('No hemos podido cargar el catálogo. Consulta desde el formulario y te confirmaremos la disponibilidad.'); })
      .then(() => { cargando = false; });
  }
  const CADA_MS = window.__TIENDA_REFRESCO_MS || 60000;
  cargar(true);
  setInterval(() => cargar(false), CADA_MS);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && Date.now() - ultimaCarga > 15000) cargar(false); });
})();
