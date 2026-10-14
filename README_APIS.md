# 🔑 Guía de Configuración de APIs - Ojo de Dios

## 📋 APIs Requeridas

Para activar todas las herramientas de rastreo en tiempo real, necesitas configurar las siguientes APIs:

---

## ✈️ Rastreo Aéreo

### OpenSky Network
- **URL**: https://opensky-network.org/apidoc/
- **Registro**: https://opensky-network.org/index.php?option=com_users&view=registration
- **Plan Gratuito**: 
  - 4000 llamadas API por día
  - Datos de vuelos en vivo globales
  - ADS-B, MLAT, FLARM
- **Uso en la app**: Vuelos en vivo, vuelos militares, ADS-B local

### FlightAware (Opcional)
- **URL**: https://flightaware.com/aeroapi/
- **Registro**: https://flightaware.com/commercial/aeroapi/
- **Plan Gratuito**: 
  - 500 llamadas API por mes
  - Datos detallados de vuelos comerciales
- **Uso en la app**: Información detallada de vuelos

---

## ◭ Rastreo Marítimo

### MarineTraffic
- **URL**: https://www.marinetraffic.com/en/developer-center
- **Registro**: https://www.marinetraffic.com/en/users/create
- **Plan Gratuito**: 
  - Limitado pero funcional
  - Datos de embarcaciones en tiempo real
- **Uso en la app**: Embarcaciones y tráfico portuario

---

## 🛰️ Datos Espaciales

### NASA Earthdata
- **URL**: https://earthdata.nasa.gov/
- **Registro**: https://urs.earthdata.nasa.gov/users/new
- **Plan Gratuito**: 
  - Completamente gratuito
  - Imágenes satelitales (VIIRS, MODIS, HLS)
  - Datos de incendios (FIRMS)
  - Datos de terremotos
- **Uso en la app**: Imágenes recientes, incendios activos, misiones espaciales, terremotos

---

## 🌬️ Datos Climáticos

### NOAA (National Oceanic and Atmospheric Administration)
- **URL**: https://www.ncdc.noaa.gov/cdo-web/token
- **Registro**: https://www.ncdc.noaa.gov/cdo-web/token
- **Plan Gratuito**: 
  - Completamente gratuito
  - Radar meteorológico
  - Datos de ciclones
  - NowCOAST
- **Uso en la app**: Radar de lluvia, nubes satélite, densidad de rayos, ciclones

### OpenWeatherMap (Opcional)
- **URL**: https://openweathermap.org/api
- **Registro**: https://home.openweathermap.org/users/sign_up
- **Plan Gratuito**: 
  - 1000 llamadas API por día
  - Pronósticos y datos actuales
- **Uso en la app**: Viento, pronósticos climáticos

---

## 🗺️ Mapas y Ubicación

### Google Maps Platform
- **URL**: https://developers.google.com/maps
- **Registro**: https://console.cloud.google.com/
- **Plan Gratuito**: 
  - $200 USD de crédito mensual
  - Google 3D, Street View, Places
- **Uso en la app**: Google 3D, Street View, búsqueda de lugares

### Bing Maps
- **URL**: https://www.microsoft.com/en-us/maps/create-a-bing-maps-key
- **Registro**: https://www.bingmapsportal.com/
- **Plan Gratuito**: 
  - 125,000 transacciones por año
  - Imágenes aéreas de alta resolución
- **Uso en la app**: Bing Aéreo

---

## 🚀 Instalación Rápida

1. **Regístrate** en cada servicio usando los enlaces proporcionados
2. **Obtén tu API key** desde el panel de desarrollador de cada servicio
3. **Abre Ojo de Dios** y haz clic en el botón 🔑 (llave) en la barra superior
4. **Ingresa tus API keys** en los campos correspondientes
5. **Guarda y cierra** el panel de configuración

---

## 💡 Consejos

- **Prioridad**: Comienza con NASA Earthdata y NOAA (son gratuitas y completamente funcionales)
- **OpenSky**: Esencial para el rastreo aéreo en tiempo real
- **Google Maps**: Necesario para funciones avanzadas de búsqueda y Street View
- **MarineTraffic**: Solo si necesitas rastreo marítimo

---

## 🔒 Seguridad

- Las API keys se almacenan localmente en tu navegador
- No se envían a ningún servidor externo
- Puedes limpiar todas las keys en cualquier momento desde el panel de configuración
- Usa variables de entorno en producción

---

## 📞 Soporte

Si tienes problemas con alguna API, consulta la documentación oficial de cada servicio:
- OpenSky: https://opensky-network.org/apidoc/
- NASA: https://earthdata.nasa.gov/learn
- NOAA: https://www.ncdc.noaa.gov/cdo-web/
- Google Maps: https://developers.google.com/maps/documentation

---

**Nota**: Algunas APIs tienen límites de uso en sus planes gratuitos. Para uso intensivo, considera actualizar a planes de pago.
