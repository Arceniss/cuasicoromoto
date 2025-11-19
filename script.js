document.addEventListener('DOMContentLoaded', () => {
    // --- Carruseles ---
    function inicializarCarrusel(config) {
        const contenedor = document.querySelector(config.containerSelector);
        const btnPrev = document.getElementById(config.prevBtnId);
        const btnNext = document.getElementById(config.nextBtnId);
        const indicadoresContenedor = document.querySelector(config.indicatorsSelector);
        if (!contenedor || !indicadoresContenedor) return;
        let numSlides = 0;
        let slideWidth = 0;
        let currentIndex = 0;
        const setupCarousel = () => {
            const esMovil = window.innerWidth <= 767;
            const primerItem = contenedor.querySelector(':first-child');
            if (!primerItem) return;
            const gap = 16;
            const containerWidth = contenedor.clientWidth;
            const totalItems = contenedor.children.length;
            if (esMovil) {
                slideWidth = primerItem.offsetWidth + gap;
                numSlides = totalItems;
            } else {
                slideWidth = containerWidth;
                const itemsPerPage = 2;
                numSlides = Math.ceil(totalItems / itemsPerPage);
            }
            const carruselContenedor = contenedor.closest('.carrusel-contenedor');
            if (carruselContenedor) {
                carruselContenedor.classList.toggle('no-scroll', numSlides <= 1);
            }
            indicadoresContenedor.innerHTML = '';
            if (numSlides > 1) {
                for (let i = 0; i < numSlides; i++) {
                    const dot = document.createElement('button');
                    dot.classList.add('carrusel-dot');
                    dot.setAttribute('aria-label', `Ir a la página ${i + 1}`);
                    dot.addEventListener('click', () => {
                        contenedor.scrollTo({ left: i * slideWidth, behavior: 'smooth' });
                    });
                    indicadoresContenedor.appendChild(dot);
                }
            }
            updateIndicators();
        };
        const updateIndicators = () => {
            const esMovil = window.innerWidth <= 767;
            const primerItem = contenedor.querySelector(':first-child');
            if (!primerItem) return;
            const scrollUnit = esMovil ? (primerItem.offsetWidth + 16) : contenedor.clientWidth;
            if (numSlides <= 1 || scrollUnit === 0) return;
            currentIndex = Math.round(contenedor.scrollLeft / scrollUnit);
            indicadoresContenedor.querySelectorAll('.carrusel-dot').forEach((dot, idx) => {
                dot.classList.toggle('activo', idx === currentIndex);
            });
        };
        btnPrev?.addEventListener('click', () => {
            if (currentIndex === 0) {
                contenedor.scrollTo({ left: contenedor.scrollWidth - contenedor.clientWidth, behavior: 'smooth' });
            } else {
                contenedor.scrollBy({ left: -slideWidth, behavior: 'smooth' });
            }
        });
        btnNext?.addEventListener('click', () => {
            if (currentIndex >= numSlides - 1) {
                contenedor.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                contenedor.scrollBy({ left: slideWidth, behavior: 'smooth' });
            }
        });
        let scrollTimer, resizeTimer;
        contenedor.addEventListener('scroll', () => {
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(updateIndicators, 150);
        });
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(setupCarousel, 250);
        });
        setupCarousel();
    }
    inicializarCarrusel({ containerSelector: '#inicio .contenedor-tarjetas', prevBtnId: 'carrusel-btn-prev', nextBtnId: 'carrusel-btn-next', indicatorsSelector: '.actividades-indicadores' });
    inicializarCarrusel({ containerSelector: '#horarios .contenedor-tarjetas', prevBtnId: 'horarios-btn-prev', nextBtnId: 'horarios-btn-next', indicatorsSelector: '.horarios-indicadores' });
    inicializarCarrusel({ containerSelector: '#sacramentos .contenedor-tarjetas', prevBtnId: 'sacramentos-btn-prev', nextBtnId: 'sacramentos-btn-next', indicatorsSelector: '.sacramentos-indicadores' });
    inicializarCarrusel({ containerSelector: '#apostolado .contenedor-tarjetas', prevBtnId: 'apostolado-btn-prev', nextBtnId: 'apostolado-btn-next', indicatorsSelector: '.apostolado-indicadores' });
    inicializarCarrusel({ containerSelector: '#contactos .subseccion .contenedor-tarjetas', prevBtnId: 'contactos-btn-prev', nextBtnId: 'contactos-btn-next', indicatorsSelector: '.contactos-indicadores' });
    inicializarCarrusel({ containerSelector: '#obras .contenedor-tarjetas', prevBtnId: 'obras-btn-prev', nextBtnId: 'obras-btn-next', indicatorsSelector: '.obras-indicadores' });

    // --- Botones flotantes de navegación ---
    const secciones = Array.from(document.querySelectorAll('main .seccion'));
    const btnSubir = document.getElementById('boton-subir-seccion');
    const btnBajar = document.getElementById('boton-bajar-seccion');
    let indiceSeccionActual = 0;
    const actualizarBotones = () => {
        btnSubir?.classList.toggle('oculto', indiceSeccionActual === 0);
        btnBajar?.classList.toggle('oculto', indiceSeccionActual === secciones.length - 1);
    };
    if (secciones.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    indiceSeccionActual = secciones.indexOf(entry.target);
                    actualizarBotones();
                }
            });
        }, { threshold: 0.4 });
        secciones.forEach(seccion => observer.observe(seccion));
    }
    btnSubir?.addEventListener('click', () => {
        if (indiceSeccionActual > 0) {
            secciones[indiceSeccionActual - 1].scrollIntoView({ behavior: 'smooth' });
        }
    });
    btnBajar?.addEventListener('click', () => {
        if (indiceSeccionActual < secciones.length - 1) {
            secciones[indiceSeccionActual + 1].scrollIntoView({ behavior: 'smooth' });
        }
    });

    // --- Menú hamburguesa ---
    const botonMenu = document.querySelector('.boton-hamburguesa');
    const navegacion = document.querySelector('.navegacion');
    const enlacesMenu = document.querySelectorAll('.navegacion a');
    const body = document.body;
    botonMenu?.addEventListener('click', () => {
        navegacion.classList.toggle('menu-abierto');
        botonMenu.classList.toggle('activo');
        body.classList.toggle('menu-abierto-body');
        botonMenu.setAttribute('aria-expanded', navegacion.classList.contains('menu-abierto'));
    });
    enlacesMenu.forEach(enlace => {
        enlace.addEventListener('click', () => {
            if (navegacion.classList.contains('menu-abierto')) {
                navegacion.classList.remove('menu-abierto');
                botonMenu.classList.remove('activo');
                body.classList.remove('menu-abierto-body');
                botonMenu.setAttribute('aria-expanded', 'false');
            }
        });
    });

    // --- Navegación activa (PC) ---
    if (window.innerWidth > 767) {
        const navLinks = document.querySelectorAll('.navegacion a');
        const linkInicio = document.querySelector('.navegacion a[href="#inicio"]');
        linkInicio?.classList.add('activo');
        const observerOptions = { root: null, rootMargin: '0px', threshold: 0.50 };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    navLinks.forEach(link => link.classList.remove('activo'));
                    const id = entry.target.getAttribute('id');
                    document.querySelector(`.navegacion a[href="#${id}"]`)?.classList.add('activo');
                }
            });
        }, observerOptions);
        secciones.forEach(seccion => observer.observe(seccion));
    }
});

// --- Service Worker ---
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}

// --- Botón instalar PWA ---
function esDispositivoMovil() {
    if (navigator.userAgentData?.mobile) return true;
    if ('ontouchstart' in window) return true;
    if (window.matchMedia("(max-width: 767px)").matches) return true;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}
let deferredPrompt;
const contenedorInstalar = document.getElementById('contenedor-instalar');
const botonInstalar = document.getElementById('boton-instalar');
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (esDispositivoMovil() && contenedorInstalar) {
        contenedorInstalar.classList.add('visible');
    }
});
botonInstalar?.addEventListener('click', () => {
    contenedorInstalar.classList.remove('visible');
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(() => { deferredPrompt = null; });
    }
});

// --- ESCUCHAR MENSAJE DEL SERVICE WORKER PARA ACTUALIZAR ---
navigator.serviceWorker.addEventListener('message', event => {
    if (event.data && event.data.type === 'NEW_VERSION_INSTALLED') {
        const notification = document.getElementById('update-notification');
        const reloadButton = document.getElementById('reload-button');

        notification.classList.remove('notification-hidden');

        reloadButton.addEventListener('click', () => {
            window.location.reload();
        });
    }
});

// --- Navegación por lista interactiva (Horarios, Sacramentos, Apostolado) ---
function inicializarNavegacionLista(idSeccion) {
    const contenedor = document.querySelector(`#${idSeccion} .contenedor-tarjetas`);
    if (!contenedor) return;

    const tarjetaLista = contenedor.querySelector('.tarjeta-base:first-child');
    if (!tarjetaLista) return;

    const items = Array.from(tarjetaLista.querySelectorAll('li'));

    items.forEach((li, i) => {
        li.style.cursor = 'pointer';

        li.addEventListener('click', () => {
            const tarjetaIndex = i + 1;
            const hijos = Array.from(contenedor.children);
            const target = hijos[tarjetaIndex];
            if (!target) return;

            if (window.innerWidth <= 767) {
                contenedor.scrollTo({ left: target.offsetLeft - contenedor.offsetLeft, behavior: 'smooth' });
            } else {
                const itemsPerPage = 2;
                const pageIndex = Math.floor((tarjetaIndex - 1) / itemsPerPage);
                contenedor.scrollTo({ left: pageIndex * contenedor.clientWidth, behavior: 'smooth' });
            }
        });

        li.tabIndex = 0;
        li.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                li.click();
            }
        });
    });
}

inicializarNavegacionLista('horarios');
inicializarNavegacionLista('sacramentos');
inicializarNavegacionLista('apostolado');
inicializarNavegacionLista('obras'); // <-- LÍNEA AÑADIDA

// --- Inyectar botón de "Volver" en tarjetas de carrusel ---
function inicializarBotonesVolver() {
    // Definimos los selectores de los contenedores de tarjetas que necesitan esta función
    const selectores = [
        '#horarios .contenedor-tarjetas',
        '#sacramentos .contenedor-tarjetas',
        '#apostolado .contenedor-tarjetas',
        '#obras .contenedor-tarjetas',
        //'#contactos .contenedor-tarjetas'
    ];

    selectores.forEach(selector => {
        const contenedor = document.querySelector(selector);
        if (!contenedor) return;

        // Seleccionamos todas las tarjetas excepto la primera
        const tarjetasDeDetalle = contenedor.querySelectorAll('.tarjeta-base:not(:first-child)');

        tarjetasDeDetalle.forEach(tarjeta => {
            // Creamos el botón
            const botonVolver = document.createElement('button');
            botonVolver.className = 'boton-volver-carrusel';
            botonVolver.innerHTML = '‹'; // Usamos el mismo ícono que los botones de navegación
            botonVolver.setAttribute('aria-label', 'Volver a la lista');

            // Añadimos el evento de click
            botonVolver.addEventListener('click', () => {
                // Hacemos scroll suave hasta el inicio del contenedor
                contenedor.scrollTo({
                    left: 0,
                    behavior: 'smooth'
                });
            });

            // Añadimos el botón al principio de la tarjeta
            tarjeta.prepend(botonVolver);
        });
    });
}

// Llamamos a la nueva función cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', inicializarBotonesVolver);