# 🛰️ OJO DE DIOS · Vista de Extremadura

## ✅ TODAS LAS APIs INTEGRADAS Y FUNCIONALES

Todas las herramientas y módulos funcionan **sin necesidad de configuración**. Las APIs públicas están integradas directamente.

---

## 🔌 APIs Públicas Integradas

### ✈️ Rastreo Aéreo
- **OpenSky Network** - Vuelos en tiempo real (ADS-B global)
  - Endpoint: `https://opensky-network.org/api/states/all`
  - Sin autenticación requerida
  - Datos: posición, altitud, velocidad, país de origen
  - Actualización: cada 60 segundos

### 🌋 Terremotos
- **USGS Earthquake Hazards** - Sismos en tiempo real
  - Endpoint: `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson`
  - Sin autenticación requerida
  - Datos: magnitud, ubicación, profundidad, hora
  - Actualización: en tiempo real

### 🔥 Eventos Naturales
- **NASA EONET v3** - Incendios, volcanes, tormentas
  - Endpoint: `https://eonet.gsfc.nasa.gov/api/v3/events`
  - Sin autenticación requerida
  - Datos: tipo de evento, coordenadas, descripción
  - Actualización: cada 60 segundos

### 🛰️ Satélites
- **CelesTrak** - Datos orbitales (TLE)
  - Endpoint: `https://celestrak.org/NORAD/elements/gp.php`
  - Sin autenticación requerida
  - Datos: nombres de satélites, números NORAD
  - Actualización: diario

### 🚀 Lanzamientos Espaciales
- **Launch Library 2** - Próximos lanzamientos
  - Endpoint: `https://ll.thespacedevs.com/2.2.0/launch/upcoming/`
  - Sin autenticación requerida
  - Datos: cohete, plataforma, fecha/hora
  - Actualización: cada 60 segundos

### 🌬️ Datos Climáticos
- **Open-Meteo** - Clima en tiempo real
  - Endpoint: `https://api.open-meteo.com/v1/forecast`
  - Sin autenticación requerida
  - Datos: temperatura, viento, humedad, pronóstico
  - Actualización: cada 60 segundos

### ◉ Radio
- **Radio Browser** - 90,000+ emisoras mundiales
  - Endpoint: `https://de1.api.radio-browser.info/json/stations/search`
  - Sin autenticación requerida
  - Datos: nombre, URL, país, género
  - Actualización: en tiempo real

### 🗺️ Mapas y Geocodificación
- **OpenStreetMap / Nominatim** - Búsqueda y geocodificación
  - Endpoint: `https://nominatim.openstreetmap.org/search`
  - Sin autenticación requerida
  - Datos: coordenadas, direcciones, POIs
  - Actualización: en tiempo real

- **Overpass API** - Datos de infraestructura
  - Endpoint: `https://overpass-api.de/api/interpreter`
  - Sin autenticación requerida
  - Datos: edificios, carreteras, servicios
  - Actualización: en tiempo real

- **CartoDB Dark** - Mapa base
  - Endpoint: `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`
  - Sin autenticación requerida
  - Estilo oscuro profesional

---

## 📊 Herramientas Activas por Defecto

### Movimiento (8 capas)
- ✅ Satélites (CelesTrak) - LIVE
- ✅ Vuelos en Vivo (OpenSky) - LIVE
- ✅ Vuelos Militares (OpenSky filtrado) - LIVE
- ✅ ADS-B Global (OpenSky) - LIVE
- ✅ Embarcaciones - MarineTraffic
- ✅ Tráfico Urbano (OSM) - LIVE
- ✅ Transporte Público - GTFS-RT
- ✅ Bicicletas - GBFS

### Cámaras (2 capas)
- ✅ Cámaras CCTV (OSM)
- ✅ Imágenes Recientes (NASA GIBS) - LIVE

### Infraestructura (5 capas)
- ✅ Cámaras ALPR (OSM)
- ✅ Instalaciones (Overpass API)
- ✅ Centros de Datos (OSM)
- ✅ Cables Submarinos (TeleGeography)
- ✅ Presas (OSM)

### Eventos (4 capas)
- ✅ Misiones Espaciales (Launch Library 2) - LIVE
- ✅ Terremotos (USGS) - LIVE
- ✅ Incendios Activos (NASA EONET) - LIVE
- ✅ Perímetros de Fuego (NASA EONET) - LIVE

### Clima (5 capas)
- ✅ Viento (Open-Meteo) - LIVE
- ✅ Radar de Lluvia (Open-Meteo) - LIVE
- ✅ Nubes Satélite (Open-Meteo) - LIVE
- ✅ Densidad Rayos (Open-Meteo) - LIVE
- ✅ Ciclones (NASA EONET) - LIVE

### Utilidades (2 capas)
- ✅ Direcciones (OSRM)
- ✅ Radio (Radio Browser) - LIVE

---

## 🎯 Características Principales

### 📡 Datos en Tiempo Real
- **26 capas activas** con datos en vivo
- **Actualización automática** cada 60 segundos
- **Visualización en mapa** con marcadores interactivos
- **Contadores en vivo** de datos por capa

### 🔍 Búsqueda Inteligente
- **Barra de búsqueda destacada** con autocompletado
- **Geocodificación** con Nominatim (OpenStreetMap)
- **Búsqueda local** de lugares de Extremadura
- **Atajo de teclado** `/` para enfocar búsqueda

### 🎨 Interfaz Profesional
- **Colores de Extremadura** (verde, blanco, negro)
- **Diseño HUD militar** con efectos de escaneo
- **Paneles laterales** colapsables
- **Widget de clima** en tiempo real
- **Estadísticas en vivo** por categoría

### 📊 Panel de Datos
- Coordenadas en tiempo real
- Altitud y velocidad
- Temperatura y viento
- Contadores de capas activas
- Estado de APIs

---

## 🚀 Uso

1. **Abrir la aplicación** - Todas las APIs se conectan automáticamente
2. **Ver datos en vivo** - Los marcadores aparecen en el mapa
3. **Buscar ubicaciones** - Usar la barra de búsqueda o `/`
4. **Activar/desactivar capas** - Panel lateral izquierdo
5. **Cambiar vista** - Preajustes visuales en panel derecho

---

## 📁 Estructura del Proyecto

```
src/
├── App.tsx              # Componente principal
├── App.css              # Estilos completos
├── main.tsx             # Entry point
├── index.css            # Tailwind CSS
└── services/
    └── api.ts           # Servicio de APIs públicas
```

---

## 🔒 Privacidad y Seguridad

- **Sin API keys** - Todo es de acceso público
- **Sin registro** - No se requiere cuenta en ningún servicio
- **Sin tracking** - Los datos se obtienen directamente de las APIs
- **Sin servidores intermedios** - Conexión directa a las fuentes
- **Código abierto** - Todo el código es visible y auditable

---

## 📝 Notas Técnicas

### Rate Limits
- **OpenSky**: 100 requests/día (sin autenticación)
- **USGS**: Sin límite aparente
- **NASA EONET**: Sin límite aparente
- **CelesTrak**: Respetar uso razonable
- **Open-Meteo**: 10,000 requests/día (gratuito)
- **Radio Browser**: Sin límite aparente
- **Nominatim**: 1 request/segundo (máximo)

### CORS
Todas las APIs soportan CORS para uso desde navegador.

### Actualización de Datos
- Datos en vivo: cada 60 segundos
- Datos estáticos: al cargar la página
- Búsqueda: en tiempo real con debounce de 300ms

---

## 🏴󠁥󠁳󠁥󠁸󠁿 Extremadura

Esta aplicación está dedicada a la comunidad de Extremadura, España.
Colores oficiales de la bandera: Verde (#009640), Blanco (#FFFFFF), Negro (#000000)

---

**Desarrollado con ❤️ para Extremadura**
