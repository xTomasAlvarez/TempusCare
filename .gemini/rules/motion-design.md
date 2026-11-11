# Motion Design & High-Craft Animation System (Linear / Raycast / Stripe Inspired)

Este proyecto aplica una filosofía estricta de **"High-Craft / Utility-First"** para todas las interacciones, animaciones y transiciones de interfaz en el frontend.

---

### 1. Filosofía de Movimiento ("Snappy, Tactile & Subdued")
- **Duraciones ultrarrápidas:** Ninguna interacción o transición debe superar los 200ms–250ms. La interfaz debe sentirse instantánea, profesional y utilitaria.
- **Física de Resortes Amortiguados (Spring Physics):** Prohibido usar `ease-in-out` lentos de 500ms o rebotes gomosos. Usar las curvas de resorte amortiguadas importadas de `shared/motion`:
  ```ts
  export const snappySpring = { type: 'spring', stiffness: 420, damping: 30, mass: 0.8 };
  export const subduedSpring = { type: 'spring', stiffness: 400, damping: 28 };
  ```

---

### 2. Patrones Específicos
- **Micro-interacciones táctiles:**
  - Botones, tarjetas clickeables, filas de tablas interactivas e items de dropdowns deben incluir:
    ```html
    className="active:scale-[0.98] transition-transform duration-75 select-none cursor-pointer"
    ```
- **Entradas en cascada (Staggered Children):**
  - Contenedor padre: `staggerContainerVariants` (`staggerChildren: 0.05`).
  - Hijos: `staggerItemVariants` (`opacity: 0, y: 10` a `opacity: 1, y: 0`).
- **Modales y Diálogos (`AnimatePresence`):**
  - Backdrop: `bg-black/75 backdrop-blur-sm`, transición de opacidad de `duration: 0.18`.
  - Caja de diálogo: `scale: 0.96, y: 12` a `scale: 1, y: 0` con `snappySpring`. Salida simétrica limpia sin saltos.
- **Notificaciones / Toasts / Dropdowns:**
  - Entrada vertical compacta (`y: -8` a `y: 0`, `opacity: 0` a `1`) con cierre suave y `layout` prop en `motion.div` para evitar layout shifts.
- **Skeletons de Carga:**
  - Pulsos sobrios y monocromáticos (`animate-pulse bg-slate-200/60 dark:bg-slate-700/40`), sin gradientes iridiscentes ni efectos de brillo excesivos.

---

### 3. Prohibiciones Estrictas (Evitar el "Look IA")
- PROHIBIDO usar giros 3D, rotaciones al hacer hover o transiciones de escala exageradas (`scale-110`).
- PROHIBIDO animaciones que bloqueen la interacción del usuario o retrasen la visualización de datos.
- Priorizar siempre `opacity` y `transform` (`scale`, `translate`) para garantizar renderizado a 60/120 FPS sin repaints costosos.
