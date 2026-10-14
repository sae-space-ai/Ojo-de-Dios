/**
 * ═══════════════════════════════════════════════════════════════════════════
 * SERVICIO DE APIs PÚBLICAS - OJO DE DIOS
 * Todas las APIs integradas son de acceso público sin requerir autenticación
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ─── Types ───────────────────────────────────────────────────────────────────
export interface Flight {
  icao24: string
  callsign: string
  origin_country: string
  longitude: number
  latitude: number
  baro_altitude: number
  velocity: number
  true_track: number
  vertical_rate: number
  on_ground: boolean
}

export interface Earthquake {
  id: string
  magnitude: number
  place: string
  time: number
  coordinates: [number, number, number]
  type: string
  status: string
  tsunami: number
}

export interface Satellite {
  name: string
  id: string
  latitude?: number
  longitude?: number
  altitude?: number
}

export interface SpaceLaunch {
  id: string
  name: string
  net: string
  status: string
  pad?: {
    name: string
    location: {
      name: string
      latitude?: number
      longitude?: number
    }
  }
  rocket?: {
    configuration: {
      name: string
    }
  }
}

export interface WeatherData {
  temperature: number
  windspeed: number
  winddirection: number
  weathercode: number
  is_day: number
  time: string
}

export interface RadioStation {
  name: string
  url: string
  country: string
  tags: string
  favicon: string
  bitrate: number
}

export interface NaturalEvent {
  id: string
  title: string
  description: string
  link: string
  category: string
  geometry: {
    coordinates: [number, number]
    date: string
  }[]
}

// ─── API Endpoints Públicos ──────────────────────────────────────────────────

/**
 * OpenSky Network - Rastreo de vuelos en tiempo real
 * Endpoint público sin autenticación (limitado a 100 requests/día)
 */
export async function fetchFlights(
  minLat?: number,
  maxLat?: number,
  minLon?: number,
  maxLon?: number
): Promise<Flight[]> {
  try {
    let url = 'https://opensky-network.org/api/states/all'
    if (minLat !== undefined && maxLat !== undefined && minLon !== undefined && maxLon !== undefined) {
      url += `?lamin=${minLat}&lamax=${maxLat}&lomin=${minLon}&lomax=${maxLon}`
    }
    
    const response = await fetch(url)
    if (!response.ok) throw new Error('Error al obtener vuelos')
    
    const data = await response.json()
    
    return data.states?.map((state: any[]) => ({
      icao24: state[0],
      callsign: state[1]?.trim() || 'N/A',
      origin_country: state[2],
      longitude: state[5] || 0,
      latitude: state[6] || 0,
      baro_altitude: state[7] || 0,
      velocity: state[9] || 0,
      true_track: state[10] || 0,
      vertical_rate: state[11] || 0,
      on_ground: state[8] || false,
    })) || []
  } catch (error) {
    console.error('Error fetching flights:', error)
    return []
  }
}

/**
 * USGS Earthquake API - Terremotos en tiempo real
 * Completamente público sin autenticación
 */
export async function fetchEarthquakes(hours: number = 24): Promise<Earthquake[]> {
  try {
    const url = `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson`
    const response = await fetch(url)
    if (!response.ok) throw new Error('Error al obtener terremotos')
    
    const data = await response.json()
    
    return data.features?.map((feature: any) => ({
      id: feature.id,
      magnitude: feature.properties.mag,
      place: feature.properties.place,
      time: feature.properties.time,
      coordinates: feature.geometry.coordinates,
      type: feature.properties.type,
      status: feature.properties.status,
      tsunami: feature.properties.tsunami,
    })) || []
  } catch (error) {
    console.error('Error fetching earthquakes:', error)
    return []
  }
}

/**
 * NASA EONET - Eventos naturales (incendios, tormentas, volcanes)
 * Completamente público sin autenticación
 */
export async function fetchNaturalEvents(days: number = 30): Promise<NaturalEvent[]> {
  try {
    const url = `https://eonet.gsfc.nasa.gov/api/v3/events?limit=50&days=${days}`
    const response = await fetch(url)
    if (!response.ok) throw new Error('Error al obtener eventos naturales')
    
    const data = await response.json()
    
    return data.events?.map((event: any) => ({
      id: event.id,
      title: event.title,
      description: event.description || '',
      link: event.sources?.[0]?.url || event.link,
      category: event.categories?.[0]?.title || 'Desconocido',
      geometry: event.geometry?.map((geo: any) => ({
        coordinates: geo.coordinates,
        date: geo.date,
      })) || [],
    })) || []
  } catch (error) {
    console.error('Error fetching natural events:', error)
    return []
  }
}

/**
 * CelesTrak - Datos de satélites (TLE)
 * Completamente público sin autenticación
 */
export async function fetchSatellites(group: string = 'stations'): Promise<Satellite[]> {
  try {
    const url = `https://celestrak.org/NORAD/elements/gp.php?GROUP=${group}&FORMAT=json`
    const response = await fetch(url)
    if (!response.ok) throw new Error('Error al obtener satélites')
    
    const data = await response.json()
    
    return data.map((sat: any) => ({
      name: sat.OBJECT_NAME,
      id: sat.NORAD_CATNR?.toString() || '',
    }))
  } catch (error) {
    console.error('Error fetching satellites:', error)
    return []
  }
}

/**
 * Launch Library 2 - Lanzamientos espaciales
 * Completamente público sin autenticación
 */
export async function fetchSpaceLaunches(limit: number = 10): Promise<SpaceLaunch[]> {
  try {
    const url = `https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=${limit}`
    const response = await fetch(url)
    if (!response.ok) throw new Error('Error al obtener lanzamientos')
    
    const data = await response.json()
    
    return data.results?.map((launch: any) => ({
      id: launch.id,
      name: launch.name,
      net: launch.net,
      status: launch.status?.name || 'Desconocido',
      pad: launch.pad ? {
        name: launch.pad.name,
        location: {
          name: launch.pad.location?.name || '',
          latitude: launch.pad.location?.latitude,
          longitude: launch.pad.location?.longitude,
        }
      } : undefined,
      rocket: launch.rocket ? {
        configuration: {
          name: launch.rocket.configuration?.name || ''
        }
      } : undefined,
    })) || []
  } catch (error) {
    console.error('Error fetching space launches:', error)
    return []
  }
}

/**
 * Open-Meteo - Datos meteorológicos
 * Completamente gratuito sin autenticación
 */
export async function fetchWeather(lat: number, lon: number): Promise<WeatherData | null> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m,wind_direction_10m,weather_code,is_day&timezone=auto`
    const response = await fetch(url)
    if (!response.ok) throw new Error('Error al obtener clima')
    
    const data = await response.json()
    
    return {
      temperature: data.current?.temperature_2m || 0,
      windspeed: data.current?.wind_speed_10m || 0,
      winddirection: data.current?.wind_direction_10m || 0,
      weathercode: data.current?.weather_code || 0,
      is_day: data.current?.is_day || 0,
      time: data.current?.time || '',
    }
  } catch (error) {
    console.error('Error fetching weather:', error)
    return null
  }
}

/**
 * Radio Browser - Estaciones de radio
 * Completamente público sin autenticación
 */
export async function fetchRadioStations(limit: number = 50): Promise<RadioStation[]> {
  try {
    const url = `https://de1.api.radio-browser.info/json/stations/search?limit=${limit}&order=clickcount&reverse=true`
    const response = await fetch(url)
    if (!response.ok) throw new Error('Error al obtener estaciones de radio')
    
    const data = await response.json()
    
    return data.map((station: any) => ({
      name: station.name,
      url: station.url,
      country: station.country,
      tags: station.tags,
      favicon: station.favicon,
      bitrate: station.bitrate,
    }))
  } catch (error) {
    console.error('Error fetching radio stations:', error)
    return []
  }
}

/**
 * OpenStreetMap Overpass API - Datos de infraestructura
 * Completamente público sin autenticación
 */
export async function fetchOSMData(
  bbox: { south: number; west: number; north: number; east: number },
  type: string = 'amenity'
): Promise<any[]> {
  try {
    const query = `[out:json][timeout:25];(node["${type}"](${bbox.south},${bbox.west},${bbox.north},${bbox.east}););out body;`
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`
    const response = await fetch(url)
    if (!response.ok) throw new Error('Error al obtener datos OSM')
    
    const data = await response.json()
    return data.elements || []
  } catch (error) {
    console.error('Error fetching OSM data:', error)
    return []
  }
}

/**
 * NOAA - Datos climáticos históricos
 * Requiere token gratuito, pero hay endpoints públicos alternativos
 */
export async function fetchNOAAData(lat: number, lon: number): Promise<any> {
  try {
    // Usando Open-Meteo como alternativa a NOAA (mismos datos, sin key)
    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=2024-01-01&end_date=2024-12-31&daily=temperature_2m_max,temperature_2m_min,precipitation_sum`
    const response = await fetch(url)
    if (!response.ok) throw new Error('Error al obtener datos NOAA')
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching NOAA data:', error)
    return null
  }
}

/**
 * Geocoding con Nominatim (OpenStreetMap)
 * Completamente público sin autenticación
 */
export async function geocode(query: string): Promise<{ lat: number; lon: number; name: string }[]> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'OjoDeDios-Extremadura/1.0'
      }
    })
    if (!response.ok) throw new Error('Error al geocodificar')
    
    const data = await response.json()
    return data.map((item: any) => ({
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      name: item.display_name,
    }))
  } catch (error) {
    console.error('Error geocoding:', error)
    return []
  }
}

/**
 * Reverse Geocoding con Nominatim
 */
export async function reverseGeocode(lat: number, lon: number): Promise<string | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'OjoDeDios-Extremadura/1.0'
      }
    })
    if (!response.ok) throw new Error('Error al geocodificar inversamente')
    
    const data = await response.json()
    return data.display_name || null
  } catch (error) {
    console.error('Error reverse geocoding:', error)
    return null
  }
}

// ─── Utilidades ──────────────────────────────────────────────────────────────

/**
 * Verifica si una API está disponible
 */
export async function checkAPIStatus(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    return response.ok
  } catch {
    return false
  }
}

/**
 * Obtiene el estado de todas las APIs
 */
export async function getAllAPIsStatus(): Promise<Record<string, boolean>> {
  const apis = {
    openSky: 'https://opensky-network.org/api/states/all',
    usgs: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson',
    nasaEonet: 'https://eonet.gsfc.nasa.gov/api/v3/events',
    celestrak: 'https://celestrak.org/NORAD/elements/gp.php?GROUP=stations&FORMAT=json',
    launchLibrary: 'https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=1',
    openMeteo: 'https://api.open-meteo.com/v1/forecast?latitude=0&longitude=0',
    radioBrowser: 'https://de1.api.radio-browser.info/json/stations/search?limit=1',
    nominatim: 'https://nominatim.openstreetmap.org/search?format=json&q=Madrid',
  }

  const status: Record<string, boolean> = {}
  for (const [key, url] of Object.entries(apis)) {
    status[key] = await checkAPIStatus(url)
  }
  return status
}
