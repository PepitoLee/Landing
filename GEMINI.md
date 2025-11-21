# Mente y Mercado - Experiencia Inmersiva

Este proyecto es una landing page de alto impacto visual desarrollada en React para el programa de certificación "Mente y Mercado". Se caracteriza por una estética futurista/cyberpunk ("High-Performance"), integración de elementos 3D y animaciones fluidas.

## Descripción General

El sitio web actúa como un embudo de ventas y presentación para un programa educativo exclusivo. Combina narrativa visual ("Diagnóstico del Sistema", "Teoría vs. Ejecución") con una interfaz de usuario inmersiva que simula una terminal o sistema operativo avanzado.

### Características Clave
- **Visualización 3D:** Un globo terráqueo interactivo con atmósfera y ciclo día/noche utilizando Three.js y Shaders personalizados.
- **Animaciones:** Transiciones suaves y efectos de scroll con Framer Motion.
- **Estética:** Diseño "Deep Space" con acentos en "Acid Green" y "Electric Indigo". Tipografía técnica (Syne, Monospace).
- **Componentes UI:** Cursor personalizado, barras de estado en movimiento (ticker), formularios estilo terminal.

## Pila Tecnológica

- **Core:** React 19 (Vite)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS (con configuración personalizada para colores como `deep-space`, `acid-green`).
- **3D:** Three.js, @react-three/fiber, @react-three/drei.
- **Animación:** Framer Motion.
- **Iconos:** Lucide React.

## Estructura del Proyecto

### Archivos Principales
- **`App.tsx`**: Contiene toda la lógica de la landing page. Está dividido internamente en:
    - **Shaders**: Definiciones GLSL para el planeta y la atmósfera.
    - **Componentes 3D**: `Earth` (planeta), `Scene` (estrellas, luces, controles).
    - **Secciones UI**: `Hero`, `StreamBar`, `Manifesto`, `ModuleList`, `Roadmap`, `AccessTerminal`.
- **`vite.config.ts`**: Configuración de Vite. Define el puerto 3000 y maneja la inyección de variables de entorno.
- **`.env.local`**: Almacena claves API (ej. `GEMINI_API_KEY`).

## Instalación y Ejecución

### Prerrequisitos
- Node.js (versión reciente compatible con Vite).

### Comandos
1.  **Instalar dependencias:**
    ```bash
    npm install
    ```
2.  **Configurar entorno:**
    Asegúrate de tener el archivo `.env.local` con las claves necesarias (si aplica).
3.  **Iniciar servidor de desarrollo:**
    ```bash
    npm run dev
    ```
    El sitio estará disponible en `http://localhost:3000`.
4.  **Construir para producción:**
    ```bash
    npm run build
    ```

## Convenciones de Desarrollo

- **Estilos:** Se prioriza Tailwind CSS. Las animaciones complejas se manejan con Framer Motion (`motion.div`, `useScroll`, `useTransform`).
- **Componentes:** Actualmente, la mayoría de los componentes residen en `App.tsx` para facilitar la prototipación rápida. En futuras iteraciones, se recomienda separarlos en archivos individuales dentro de una carpeta `src/components`.
- **3D:** Los elementos de Three.js (`Canvas`) están aislados en la sección `Hero` para optimizar el rendimiento.

## Notas de Diseño
- **Colores:** El proyecto depende fuertemente de clases de utilidad personalizadas que deben estar definidas en `tailwind.config.js` (aunque no visible en la raíz, se infiere su uso):
    - `bg-deep-space` (Fondo oscuro principal)
    - `text-acid-green` (Acento principal #ccff00)
    - `text-electric-indigo` (Acento secundario)
- **Tipografía:** Uso mixto de fuentes Sans-serif (Syne) para títulos y Monospace para datos técnicos/etiquetas.
