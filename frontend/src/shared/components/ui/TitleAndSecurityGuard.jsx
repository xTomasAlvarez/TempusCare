import { useEffect } from 'react';

const ROUTE_TITLES = {
  '/': 'TempusCare | Plataforma de Gestión de Turnos e Historia Clínica',
  '/login': 'TempusCare | Iniciar Sesión',
  '/register': 'TempusCare | Registro de Paciente',
  '/forgot-password': 'TempusCare | Recuperar Contraseña',
  '/reset-password': 'TempusCare | Restablecer Nueva Contraseña',
  '/patient/dashboard': 'TempusCare | Portal del Paciente',
  '/patient/search': 'TempusCare | Buscador de Profesionales y Turnos',
  '/patient/appointments': 'TempusCare | Mis Citas Médicas',
  '/patient/calendar': 'TempusCare | Calendario de Turnos',
  '/patient/mis-turnos-calendario': 'TempusCare | Calendario de Turnos',
  '/professional/dashboard': 'TempusCare | Agenda Médica y Consultorio',
  '/institution/reception': 'TempusCare | Mesa de Recepción y Flujo de Pacientes',
  '/institution/configuracion-medica': 'TempusCare | Configuración Médica y Coberturas',
  '/institution/parametrizacion': 'TempusCare | Configuración Médica y Coberturas',
  '/institution/coberturas': 'TempusCare | Configuración Médica y Coberturas',
  '/institution/admin': 'TempusCare | Administración de Institución Médica',
  '/institution/sede-admin': 'TempusCare | Administración de Sede y Consultorio',
  '/vitality/clients': 'VitalityOS | Gestión de Instituciones Médicas',
  '/vitality/specialties': 'VitalityOS | Catálogo de Especialidades y Estudios',
  '/vitality/insurance': 'VitalityOS | Catálogo de Obras Sociales y Prepagas',
  '/vitality/metrics': 'VitalityOS | Métricas de Plataforma',
  '/vitality/system': 'VitalityOS | Monitoreo y Estado del Sistema',
  '/vitality/admins': 'VitalityOS | Gestión de Administradores',
};

const TARGET_SELECTOR = [
  'button',
  'a',
  'input',
  'select',
  'textarea',
  'label',
  'h1',
  'h2',
  'h3',
  'th',
  'img',
  '[role="button"]',
  '[role="tab"]',
  '[role="switch"]',
  '[role="menuitem"]',
  '[role="dialog"]',
].join(',');

const computeDescriptiveTitle = (el) => {
  const ariaLabel = el.getAttribute('aria-label')?.trim();
  if (ariaLabel) return ariaLabel;

  const tag = el.tagName.toLowerCase();

  if (tag === 'input' || tag === 'select' || tag === 'textarea') {
    const id = el.getAttribute('id');
    if (id) {
      const labelEl = document.querySelector(`label[for="${CSS.escape(id)}"]`);
      if (labelEl) {
        const labelText = labelEl.textContent?.replace(/\*/g, '').replace(/\s+/g, ' ').trim();
        if (labelText) return labelText;
      }
    }
    const parentLabel = el.closest('label');
    if (parentLabel) {
      const labelText = parentLabel.textContent?.replace(/\*/g, '').replace(/\s+/g, ' ').trim();
      if (labelText) return labelText;
    }
    const placeholder = el.getAttribute('placeholder')?.trim();
    if (placeholder) return placeholder;

    if (tag === 'select') {
      const selectedOption = el.options?.[el.selectedIndex];
      if (selectedOption?.text) return `Selector: ${selectedOption.text.trim()}`;
      return 'Selector desplegable de opciones';
    }

    const inputType = (el.getAttribute('type') || 'text').toLowerCase();
    if (inputType === 'date') return 'Seleccionar fecha';
    if (inputType === 'time') return 'Seleccionar horario';
    if (inputType === 'checkbox') return 'Casilla de verificación';
    if (inputType === 'radio') return 'Opción de selección';
    if (inputType === 'search') return 'Campo de búsqueda';
    if (inputType === 'password') return 'Campo de contraseña segura';
    if (inputType === 'email') return 'Campo de correo electrónico';
    if (inputType === 'number') return 'Campo numérico';
    return 'Campo de entrada de datos';
  }

  if (tag === 'img') {
    const alt = el.getAttribute('alt')?.trim();
    return alt || 'Imagen ilustrativa de TempusCare';
  }

  const text = (el.textContent || '')
    .replace(/\s+/g, ' ')
    .replace(/[*⚠]/g, '')
    .trim();

  if (text && text.length <= 140) {
    return text;
  }
  if (text && text.length > 140) {
    return `${text.slice(0, 137)}...`;
  }

  if (tag === 'button' || el.getAttribute('role') === 'button') {
    return 'Botón de acción';
  }
  if (tag === 'a') {
    return 'Enlace de navegación';
  }
  if (el.getAttribute('role') === 'dialog') {
    return 'Ventana de diálogo';
  }

  return 'Elemento del sistema TempusCare';
};

const hardenAndLabelElement = (el) => {
  if (!(el instanceof HTMLElement)) return;

  // 1. Garantizar atributo title descriptivo en cada elemento interactivo o semántico
  const currentTitle = el.getAttribute('title');
  if (!currentTitle || !currentTitle.trim()) {
    const computed = computeDescriptiveTitle(el);
    if (computed) {
      el.setAttribute('title', computed);
    }
  }

  // 2. Garantizar límites seguros de longitud (maxLength) en todos los inputs y textareas
  const tag = el.tagName.toLowerCase();
  if (tag === 'input') {
    const type = (el.getAttribute('type') || 'text').toLowerCase();
    if (['text', 'search', 'email', 'password', 'tel', 'url'].includes(type) && !el.hasAttribute('maxlength')) {
      const defaultMax =
        type === 'password' ? '128' : type === 'email' ? '120' : type === 'tel' ? '25' : '200';
      el.setAttribute('maxlength', defaultMax);
    }
  } else if (tag === 'textarea' && !el.hasAttribute('maxlength')) {
    el.setAttribute('maxlength', '2000');
  }
};

const scanSubtree = (root = document.body) => {
  if (!root) return;
  if (root instanceof HTMLElement && root.matches?.(TARGET_SELECTOR)) {
    hardenAndLabelElement(root);
  }
  const elements = root.querySelectorAll?.(TARGET_SELECTOR);
  if (elements) {
    elements.forEach(hardenAndLabelElement);
  }
};

export const TitleAndSecurityGuard = () => {
  useEffect(() => {
    const syncDocumentTitle = () => {
      const path = window.location.pathname;
      const matchedTitle =
        ROUTE_TITLES[path] ||
        (path.startsWith('/vitality')
          ? 'VitalityOS | Consola de Administración Global'
          : 'TempusCare | Salud Inclusiva');
      if (document.title !== matchedTitle) {
        document.title = matchedTitle;
      }
    };

    syncDocumentTitle();
    scanSubtree(document.body);

    const observer = new MutationObserver((mutations) => {
      syncDocumentTitle();
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              scanSubtree(node);
            }
          });
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    window.addEventListener('popstate', syncDocumentTitle);
    return () => {
      observer.disconnect();
      window.removeEventListener('popstate', syncDocumentTitle);
    };
  }, []);

  return null;
};

export default TitleAndSecurityGuard;
