import { useState, useEffect, useRef, useCallback } from 'react'
import L from 'leaflet'
import './App.css'
import {
  fetchFlights,
  fetchEarthquakes,
  fetchNaturalEvents,
  fetchSatellites,
  fetchSpaceLaunches,
  fetchWeather,
  fetchRadioStations,
  geocode,
  type Flight,
  type Earthquake,
  type NaturalEvent,
  type Satellite,
  type SpaceLaunch,
  type WeatherData,
  type RadioStation,
} from './services/api'

// ─── Types ───────────────────────────────────────────────────────────────────
interface LayerItem {
  id: string
  icon: string
  name: string
  desc: string
  source: string
  active: boolean
  live: boolean
  dataCount: number
}

interface LayerCategory {
  title: string
  icon: string
  layers: LayerItem[]
}

// ─── Data ────────────────────────────────────────────────────────────────────
const LAYER_CATEGORIES: LayerCategory[] = [
  {
    title: 'Movimiento',
    icon: '🛰️',
    layers: [
      { id: 'satellites', icon: '🛰️', name: 'Satélites', desc: 'CelesTrak', source: 'Rastreo orbital', active: true, live: true, dataCount: 0 },
      { id: 'flights', icon: '✈️', name: 'Vuelos en Vivo', desc: 'OpenSky Network', source: 'ADS-B', active: true, live: true, dataCount: 0 },
      { id: 'military', icon: '🎖️', name: 'Vuelos Militares', desc: 'OpenSky filtrado', source: 'MLAT', active: true, live: true, dataCount: 0 },
      { id: 'adsb', icon: '📡', name: 'ADS-B Global', desc: 'OpenSky Network', source: 'Red global', active: true, live: true, dataCount: 0 },
      { id: 'vessels', icon: '◭', name: 'Embarcaciones', desc: 'MarineTraffic', source: 'AIS', active: true, live: false, dataCount: 0 },
      { id: 'traffic', icon: '🚗', name: 'Tráfico Urbano', desc: 'OpenStreetMap', source: 'Overpass API', active: true, live: false, dataCount: 0 },
      { id: 'transit', icon: '🚌', name: 'Transporte Público', desc: 'GTFS-RT', source: 'Operadores', active: true, live: false, dataCount: 0 },
      { id: 'bikes', icon: '🚲', name: 'Bicicletas', desc: 'GBFS', source: 'Estaciones', active: true, live: false, dataCount: 0 },
    ]
  },
  {
    title: 'Cámaras',
    icon: '📹',
    layers: [
      { id: 'cameras', icon: '📹', name: 'Cámaras CCTV', desc: 'OpenStreetMap', source: 'Mapeo comunitario', active: true, live: false, dataCount: 0 },
      { id: 'imagery', icon: '🛰️', name: 'Imágenes Recientes', desc: 'NASA GIBS', source: 'Satélite', active: true, live: true, dataCount: 0 },
    ]
  },
  {
    title: 'Infraestructura',
    icon: '📷',
    layers: [
      { id: 'alpr', icon: '📷', name: 'Cámaras ALPR', desc: 'OpenStreetMap', source: 'Mapeo comunitario', active: true, live: false, dataCount: 0 },
      { id: 'installations', icon: '⌖', name: 'Instalaciones', desc: 'Overpass API', source: 'Puntos de interés', active: true, live: false, dataCount: 0 },
      { id: 'datacenters', icon: '▣', name: 'Centros de Datos', desc: 'OpenStreetMap', source: 'Infraestructura', active: true, live: false, dataCount: 0 },
      { id: 'cables', icon: '≋', name: 'Cables Submarinos', desc: 'TeleGeography', source: 'Red global', active: true, live: false, dataCount: 0 },
      { id: 'dams', icon: '▰', name: 'Presas', desc: 'OpenStreetMap', source: 'Infraestructura hídrica', active: true, live: false, dataCount: 0 },
    ]
  },
  {
    title: 'Eventos',
    icon: '🚀',
    layers: [
      { id: 'space', icon: '🚀', name: 'Misiones Espaciales', desc: 'Launch Library 2', source: '30 días', active: true, live: true, dataCount: 0 },
      { id: 'earthquakes', icon: '🌋', name: 'Terremotos', desc: 'USGS', source: '24 horas', active: true, live: true, dataCount: 0 },
      { id: 'fires', icon: '▲', name: 'Incendios Activos', desc: 'NASA EONET', source: 'EN VIVO', active: true, live: true, dataCount: 0 },
      { id: 'firePerim', icon: '🔥', name: 'Perímetros de Fuego', desc: 'NASA EONET', source: 'Agencias', active: true, live: true, dataCount: 0 },
    ]
  },
  {
    title: 'Clima',
    icon: '🌬',
    layers: [
      { id: 'wind', icon: '🌬', name: 'Viento', desc: 'Open-Meteo', source: 'Pronóstico', active: true, live: true, dataCount: 0 },
      { id: 'rain', icon: '◉', name: 'Radar de Lluvia', desc: 'Open-Meteo', source: 'Observado', active: true, live: true, dataCount: 0 },
      { id: 'clouds', icon: '☁', name: 'Nubes Satélite', desc: 'Open-Meteo', source: 'Observado', active: true, live: true, dataCount: 0 },
      { id: 'lightning', icon: 'ϟ', name: 'Densidad Rayos', desc: 'Open-Meteo', source: 'Observado', active: true, live: true, dataCount: 0 },
      { id: 'cyclones', icon: '◉', name: 'Ciclones', desc: 'NASA EONET', source: 'Avisos', active: true, live: true, dataCount: 0 },
    ]
  },
  {
    title: 'Utilidades',
    icon: '🧭',
    layers: [
      { id: 'directions', icon: '🧭', name: 'Direcciones', desc: 'OSRM', source: 'Rutas', active: true, live: false, dataCount: 0 },
      { id: 'radio', icon: '◉', name: 'Radio', desc: 'Radio Browser', source: 'Emisoras', active: true, live: true, dataCount: 0 },
    ]
  },
]

const PRESETS = [
  { id: 'normal', icon: '◯', name: 'Normal', key: '1' },
  { id: 'crt', icon: '▦', name: 'CRT', key: '2' },
  { id: 'nvg', icon: '🌙', name: 'NVG', key: '3' },
  { id: 'flir', icon: '🌡️', name: 'FLIR', key: '4' },
  { id: 'anime', icon: '✦', name: 'Anime', key: '5' },
  { id: 'noir', icon: '◐', name: 'Noir', key: '6' },
  { id: 'snow', icon: '❄', name: 'Nieve', key: '7' },
]

const MAP_SOURCES = [
  { id: 'google3d', name: 'Google 3D' },
  { id: 'bing', name: 'Bing Aéreo' },
  { id: 'ion', name: 'ION' },
  { id: 'esri', name: 'Esri Satélite' },
  { id: 'osm', name: 'OSM' },
]

const CITIES = [
  { name: 'Mérida', lat: 38.9161, lng: -6.3444 },
  { name: 'Badajoz', lat: 38.8779, lng: -6.9706 },
  { name: 'Cáceres', lat: 39.4753, lng: -6.3724 },
  { name: 'Madrid', lat: 40.4168, lng: -3.7038 },
  { name: 'Lisboa', lat: 38.7223, lng: -9.1393 },
  { name: 'Sevilla', lat: 37.3891, lng: -5.9845 },
  { name: 'Salamanca', lat: 40.9688, lng: -5.6639 },
  { name: 'Toledo', lat: 39.8628, lng: -4.0273 },
  { name: 'Plasencia', lat: 40.0306, lng: -6.0937 },
]

// ─── Main App ────────────────────────────────────────────────────────────────
export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activePreset, setActivePreset] = useState('normal')
  const [activeMapSource, setActiveMapSource] = useState('osm')
  const [layers, setLayers] = useState<LayerCategory[]>(LAYER_CATEGORIES)
  const [clock, setClock] = useState(new Date())
  const [fps, setFps] = useState(60)
  const [location, setLocation] = useState({ lat: 39.4753, lng: -6.3724 })
  const [altitude] = useState(25000)
  const [speed] = useState(480)
  const [heading] = useState(45)
  const [dataPanelOpen, setDataPanelOpen] = useState(false)
  const [scenesOpen, setScenesOpen] = useState(false)
  const [cityPanelOpen, setCityPanelOpen] = useState(false)
  const [agentActive, setAgentActive] = useState(false)
  const [cleanView, setCleanView] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [searchResults, setSearchResults] = useState<{name: string, lat: number, lng: number, type: string}[]>([])
  
  // Live data states
  const [flights, setFlights] = useState<Flight[]>([])
  const [earthquakes, setEarthquakes] = useState<Earthquake[]>([])
  const [naturalEvents, setNaturalEvents] = useState<NaturalEvent[]>([])
  const [satellites, setSatellites] = useState<Satellite[]>([])
  const [spaceLaunches, setSpaceLaunches] = useState<SpaceLaunch[]>([])
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [radioStations, setRadioStations] = useState<RadioStation[]>([])
  const [apiStatus, setApiStatus] = useState<Record<string, boolean>>({})
  
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.CircleMarker | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const flightsLayerRef = useRef<L.LayerGroup | null>(null)
  const earthquakesLayerRef = useRef<L.LayerGroup | null>(null)
  const eventsLayerRef = useRef<L.LayerGroup | null>(null)
  const satellitesLayerRef = useRef<L.LayerGroup | null>(null)

  // Clock
  useEffect(() => {
    const interval = setInterval(() => setClock(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  // FPS counter
  useEffect(() => {
    let frameCount = 0
    let lastTime = performance.now()
    const animate = () => {
      frameCount++
      const now = performance.now()
      if (now - lastTime >= 1000) {
        setFps(frameCount)
        frameCount = 0
        lastTime = now
      }
      requestAnimationFrame(animate)
    }
    const id = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(id)
  }, [])

  // Fetch live data
  useEffect(() => {
    const loadLiveData = async () => {
      // Fetch flights (OpenSky)
      const flightsData = await fetchFlights(35, 44, -10, -3) // Extremadura region
      setFlights(flightsData)
      setLayers(prev => prev.map((cat, i) => {
        if (i !== 0) return cat
        return {
          ...cat,
          layers: cat.layers.map(l => 
            l.id === 'flights' || l.id === 'adsb' ? { ...l, dataCount: flightsData.length } : l
          )
        }
      }))

      // Fetch earthquakes (USGS)
      const earthquakesData = await fetchEarthquakes(24)
      setEarthquakes(earthquakesData)
      setLayers(prev => prev.map((cat, i) => {
        if (i !== 3) return cat
        return {
          ...cat,
          layers: cat.layers.map(l => 
            l.id === 'earthquakes' ? { ...l, dataCount: earthquakesData.length } : l
          )
        }
      }))

      // Fetch natural events (NASA EONET)
      const eventsData = await fetchNaturalEvents(30)
      setNaturalEvents(eventsData)
      setLayers(prev => prev.map((cat, i) => {
        if (i !== 3) return cat
        return {
          ...cat,
          layers: cat.layers.map(l => 
            l.id === 'fires' || l.id === 'firePerim' ? { ...l, dataCount: eventsData.filter(e => e.category.includes('Fuego') || e.category.includes('Volcán')).length } : l
          )
        }
      }))

      // Fetch satellites (CelesTrak)
      const satellitesData = await fetchSatellites('stations')
      setSatellites(satellitesData)
      setLayers(prev => prev.map((cat, i) => {
        if (i !== 0) return cat
        return {
          ...cat,
          layers: cat.layers.map(l => 
            l.id === 'satellites' ? { ...l, dataCount: satellitesData.length } : l
          )
        }
      }))

      // Fetch space launches (Launch Library 2)
      const launchesData = await fetchSpaceLaunches(10)
      setSpaceLaunches(launchesData)
      setLayers(prev => prev.map((cat, i) => {
        if (i !== 3) return cat
        return {
          ...cat,
          layers: cat.layers.map(l => 
            l.id === 'space' ? { ...l, dataCount: launchesData.length } : l
          )
        }
      }))

      // Fetch weather (Open-Meteo)
      const weatherData = await fetchWeather(location.lat, location.lng)
      setWeather(weatherData)

      // Fetch radio stations (Radio Browser)
      const radioData = await fetchRadioStations(20)
      setRadioStations(radioData)
      setLayers(prev => prev.map((cat, i) => {
        if (i !== 5) return cat
        return {
          ...cat,
          layers: cat.layers.map(l => 
            l.id === 'radio' ? { ...l, dataCount: radioData.length } : l
          )
        }
      }))
    }

    loadLiveData()
    const interval = setInterval(loadLiveData, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [location])

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const map = L.map(mapRef.current, {
      center: [location.lat, location.lng],
      zoom: 6,
      zoomControl: false,
      attributionControl: false,
    })

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(map)

    // Add center marker
    const marker = L.circleMarker([location.lat, location.lng], {
      radius: 8,
      fillColor: '#009640',
      color: '#ffffff',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.8,
    }).addTo(map)

    marker.bindPopup('<strong style="color:#009640">📍 Centro de Operaciones</strong><br/>Cáceres, Extremadura')

    // Add city markers
    CITIES.forEach(city => {
      const cityMarker = L.circleMarker([city.lat, city.lng], {
        radius: 5,
        fillColor: '#009640',
        color: '#ffffff',
        weight: 1,
        opacity: 0.7,
        fillOpacity: 0.5,
      }).addTo(map)
      cityMarker.bindPopup(`<strong style="color:#009640">${city.name}</strong>`)
    })

    // Add Extremadura region outline
    const extremaduraBounds = L.polygon([
      [40.45, -7.5],
      [40.45, -5.0],
      [39.0, -4.5],
      [38.0, -5.0],
      [37.9, -6.0],
      [38.0, -7.5],
      [39.0, -7.6],
    ], {
      color: '#009640',
      weight: 2,
      fillColor: '#009640',
      fillOpacity: 0.05,
      dashArray: '5, 10',
    }).addTo(map)
    extremaduraBounds.bindPopup('<strong style="color:#009640">EXTREMADURA</strong><br/>Zona de Operaciones Principal')

    // Create layer groups for live data
    flightsLayerRef.current = L.layerGroup().addTo(map)
    earthquakesLayerRef.current = L.layerGroup().addTo(map)
    eventsLayerRef.current = L.layerGroup().addTo(map)
    satellitesLayerRef.current = L.layerGroup().addTo(map)

    mapInstanceRef.current = map
    markerRef.current = marker

    return () => { map.remove() }
  }, [])

  // Update map with live data
  useEffect(() => {
    if (!mapInstanceRef.current) return

    // Update flights on map
    if (flightsLayerRef.current) {
      flightsLayerRef.current.clearLayers()
      flights.slice(0, 50).forEach(flight => {
        if (flight.latitude && flight.longitude) {
          const marker = L.circleMarker([flight.latitude, flight.longitude], {
            radius: 4,
            fillColor: '#00b34d',
            color: '#ffffff',
            weight: 1,
            opacity: 0.8,
            fillOpacity: 0.6,
          })
          marker.bindPopup(`
            <strong style="color:#009640">✈️ ${flight.callsign}</strong><br/>
            País: ${flight.origin_country}<br/>
            Altitud: ${Math.round(flight.baro_altitude)}m<br/>
            Velocidad: ${Math.round(flight.velocity)} m/s
          `)
          flightsLayerRef.current?.addLayer(marker)
        }
      })
    }

    // Update earthquakes on map
    if (earthquakesLayerRef.current) {
      earthquakesLayerRef.current.clearLayers()
      earthquakes.forEach(eq => {
        const [lng, lat] = eq.coordinates
        const marker = L.circleMarker([lat, lng], {
          radius: Math.min(eq.magnitude * 2, 20),
          fillColor: eq.magnitude > 5 ? '#ff4444' : eq.magnitude > 3 ? '#ffaa00' : '#ffff00',
          color: '#ffffff',
          weight: 2,
          opacity: 0.9,
          fillOpacity: 0.7,
        })
        marker.bindPopup(`
          <strong style="color:#009640">🌋 Terremoto M${eq.magnitude}</strong><br/>
          Lugar: ${eq.place}<br/>
          Profundidad: ${eq.coordinates[2]}km<br/>
          ${new Date(eq.time).toLocaleString('es-ES')}
        `)
        earthquakesLayerRef.current?.addLayer(marker)
      })
    }

    // Update natural events on map
    if (eventsLayerRef.current) {
      eventsLayerRef.current.clearLayers()
      naturalEvents.slice(0, 30).forEach(event => {
        if (event.geometry && event.geometry.length > 0) {
          const [lng, lat] = event.geometry[0].coordinates
          const marker = L.circleMarker([lat, lng], {
            radius: 6,
            fillColor: event.category.includes('Fuego') ? '#ff6600' : 
                      event.category.includes('Volcán') ? '#ff0000' : '#ffaa00',
            color: '#ffffff',
            weight: 2,
            opacity: 0.9,
            fillOpacity: 0.7,
          })
          marker.bindPopup(`
            <strong style="color:#009640">${event.title}</strong><br/>
            Categoría: ${event.category}<br/>
            ${event.description?.substring(0, 100) || ''}...
          `)
          eventsLayerRef.current?.addLayer(marker)
        }
      })
    }
  }, [flights, earthquakes, naturalEvents])

  // Search logic
  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSearchResults([])
      return
    }

    const searchTimeout = setTimeout(async () => {
      const query = searchQuery.toLowerCase()
      
      // Search in local data first
      const allPlaces = [
        ...CITIES.map(c => ({ ...c, type: 'Ciudad' })),
        { name: 'Parque Nacional de Monfragüe', lat: 39.8333, lng: -6.0833, type: 'Parque Nacional' },
        { name: 'Monasterio de Guadalupe', lat: 39.4494, lng: -5.3211, type: 'Monumento' },
        { name: 'Ciudad Romana de Mérida', lat: 38.9186, lng: -6.3269, type: 'Patrimonio UNESCO' },
        { name: 'Cáceres Casco Antiguo', lat: 39.4766, lng: -6.3723, type: 'Patrimonio UNESCO' },
        { name: 'Embalse de Alcántara', lat: 39.7222, lng: -6.8861, type: 'Infraestructura' },
        { name: 'Sierra de Gata', lat: 40.2500, lng: -6.5833, type: 'Comarca' },
        { name: 'La Vera', lat: 40.1333, lng: -5.6167, type: 'Comarca' },
        { name: 'Trujillo', lat: 39.4536, lng: -5.8839, type: 'Ciudad' },
        { name: 'Zafra', lat: 38.4236, lng: -6.4167, type: 'Ciudad' },
      ]
      
      const localResults = allPlaces.filter(p => p.name.toLowerCase().includes(query))
      
      // Also search using Nominatim API
      if (searchQuery.length > 2) {
        const geocodeResults = await geocode(searchQuery)
        const apiResults = geocodeResults.map(r => ({
          name: r.name,
          lat: r.lat,
          lng: r.lon,
          type: 'Ubicación'
        }))
        setSearchResults([...localResults, ...apiResults].slice(0, 10))
      } else {
        setSearchResults(localResults.slice(0, 10))
      }
    }, 300)

    return () => clearTimeout(searchTimeout)
  }, [searchQuery])

  const handleSearchSelect = (place: {name: string, lat: number, lng: number, type: string}) => {
    setLocation({ lat: place.lat, lng: place.lng })
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([place.lat, place.lng], 12, { duration: 2 })
      if (markerRef.current) {
        markerRef.current.setLatLng([place.lat, place.lng])
      }
    }
    setSearchQuery(place.name)
    setSearchFocused(false)
    setSearchResults([])
  }

  const toggleLayer = useCallback((categoryId: number, layerId: string) => {
    setLayers(prev => prev.map((cat, i) => {
      if (i !== categoryId) return cat
      return {
        ...cat,
        layers: cat.layers.map(l => l.id === layerId ? { ...l, active: !l.active } : l)
      }
    }))
  }, [])

  const activeLayerCount = layers.reduce((acc, cat) => acc + cat.layers.filter(l => l.active).length, 0)

  const formatTime = (d: Date) => {
    return d.toISOString().replace('T', ' · ').slice(0, 21) + 'Z'
  }

  const activeLayers = layers.flatMap((cat, ci) =>
    cat.layers.filter(l => l.active).map(l => ({ ...l, categoryIndex: ci }))
  )

  if (cleanView) {
    return (
      <div className="clean-view" onClick={() => setCleanView(false)}>
        <div ref={mapRef} className="map-container" />
        <div className="clean-exit">
          <span className="clean-exit-text">SALIR DE VISTA LIMPIA</span>
          <span className="clean-exit-hint">ESC · Clic para salir</span>
        </div>
      </div>
    )
  }

  return (
    <div className="app-container">
      {/* ─── Top Bar ─────────────────────────────────────────────── */}
      <header className="top-bar">
        <div className="top-bar-left">
          <div className="logo-section">
            <div className="logo-icon">
              <div className="eye-outer">
                <div className="eye-inner" />
              </div>
            </div>
            <div className="logo-text">
              <h1>OJO DE DIOS</h1>
              <span className="logo-sub">VISTA DE EXTREMADURA · PLANO ÓPTICO · 01</span>
            </div>
          </div>
        </div>

        <div className="top-bar-center">
          <div className="hud-stats">
            <div className="hud-stat">
              <span className="hud-label">NIVEL</span>
              <span className="hud-value">ACTIVO</span>
            </div>
            <div className="hud-divider" />
            <div className="hud-stat">
              <span className="hud-label">FPS</span>
              <span className="hud-value">{fps}</span>
            </div>
            <div className="hud-divider" />
            <div className="hud-stat">
              <span className="hud-label">CAPAS</span>
              <span className="hud-value">{activeLayerCount}</span>
            </div>
            <div className="hud-divider" />
            <div className="hud-stat">
              <span className="hud-label">VUELOS</span>
              <span className="hud-value">{flights.length}</span>
            </div>
            <div className="hud-divider" />
            <div className="hud-stat">
              <span className="hud-label">SISMOS</span>
              <span className="hud-value">{earthquakes.length}</span>
            </div>
            <div className="hud-divider" />
            <div className="hud-stat">
              <span className="hud-label">SATÉLITES</span>
              <span className="hud-value">{satellites.length}</span>
            </div>
          </div>
        </div>

        <div className="top-bar-right">
          <div className="clock-display">
            <span className="clock-time">{formatTime(clock)}</span>
          </div>
          <button className="top-btn" onClick={() => setCleanView(true)} title="Vista limpia">
            <i className="fa-solid fa-eye" />
          </button>
          <button className="top-btn" onClick={() => setSidebarOpen(!sidebarOpen)} title="Panel lateral">
            <i className={`fa-solid ${sidebarOpen ? 'fa-angles-right' : 'fa-angles-left'}`} />
          </button>
        </div>
      </header>

      {/* ─── Main Content ────────────────────────────────────────── */}
      <div className="main-content">
        {/* ─── Left Panel ──────────────────────────────────────────── */}
        <aside className={`left-panel ${sidebarOpen ? 'open' : 'closed'}`}>
          <div className="panel-header">
            <h2><i className="fa-solid fa-layer-group" /> CAPAS DE DATOS</h2>
            <span className="layer-count">{activeLayerCount} activas</span>
          </div>

          <div className="panel-scroll">
            {layers.map((category, ci) => (
              <div key={ci} className="layer-category">
                <div className="category-header">
                  <span className="category-icon">{category.icon}</span>
                  <span className="category-title">{category.title}</span>
                  <span className="category-count">
                    {category.layers.filter(l => l.active).length}/{category.layers.length}
                  </span>
                </div>
                <div className="category-layers">
                  {category.layers.map(layer => (
                    <button
                      key={layer.id}
                      className={`layer-item ${layer.active ? 'active' : ''}`}
                      onClick={() => toggleLayer(ci, layer.id)}
                    >
                      <span className="layer-icon">{layer.icon}</span>
                      <div className="layer-info">
                        <span className="layer-name">
                          {layer.name}
                          {layer.live && <span className="live-indicator">●</span>}
                        </span>
                        <span className="layer-desc">
                          {layer.desc}
                          {layer.dataCount > 0 && <span className="data-count"> · {layer.dataCount}</span>}
                        </span>
                      </div>
                      <div className={`layer-toggle ${layer.active ? 'on' : 'off'}`}>
                        <div className="toggle-knob" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* ─── Map Area ────────────────────────────────────────────── */}
        <div className="map-area">
          <div ref={mapRef} className="map-container" />

          {/* ─── Search Bar Destacada ─────────────────────────────────── */}
          <div className="search-container">
            <div className={`search-bar ${searchFocused ? 'focused' : ''}`}>
              <div className="search-icon-wrapper">
                <i className="fa-solid fa-magnifying-glass" />
              </div>
              <input
                ref={searchRef}
                type="text"
                className="search-input"
                placeholder="BUSCAR UBICACIÓN · CIUDAD · PUNTO DE INTERÉS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              />
              {searchQuery && (
                <button className="search-clear" onClick={() => { setSearchQuery(''); searchRef.current?.focus() }}>
                  <i className="fa-solid fa-xmark" />
                </button>
              )}
              <div className="search-shortcut">
                <kbd>/</kbd>
              </div>
            </div>

            {/* Search Results Dropdown */}
            {searchFocused && searchResults.length > 0 && (
              <div className="search-results">
                <div className="search-results-header">
                  <span>RESULTADOS</span>
                  <span className="search-results-count">{searchResults.length} encontrados</span>
                </div>
                {searchResults.map((result, i) => (
                  <button
                    key={i}
                    className="search-result-item"
                    onMouseDown={() => handleSearchSelect(result)}
                  >
                    <span className="result-icon">
                      {result.type === 'Ciudad' ? '🏙️' :
                       result.type === 'Aeropuerto' ? '✈️' :
                       result.type === 'Base Militar' ? '🎖️' :
                       result.type === 'Central Nuclear' ? '☢️' :
                       result.type === 'Presa' ? '▰' :
                       result.type === 'Río' ? '🌊' :
                       result.type === 'Parque Nacional' ? '🌳' :
                       result.type === 'Monumento' || result.type === 'Patrimonio UNESCO' ? '🏛️' :
                       '📍'}
                    </span>
                    <div className="result-info">
                      <span className="result-name">{result.name}</span>
                      <span className="result-type">{result.type} · {result.lat.toFixed(4)}°N, {Math.abs(result.lng).toFixed(4)}°W</span>
                    </div>
                    <span className="result-arrow">→</span>
                  </button>
                ))}
              </div>
            )}

            {/* Quick search suggestions */}
            {searchFocused && searchResults.length === 0 && searchQuery.length === 0 && (
              <div className="search-results">
                <div className="search-results-header">
                  <span>BÚSQUEDA RÁPIDA</span>
                </div>
                <div className="search-suggestions">
                  {['Mérida', 'Badajoz', 'Cáceres', 'Monfragüe', 'Almaraz', 'Trujillo', 'Guadalupe'].map(s => (
                    <button
                      key={s}
                      className="search-suggestion-chip"
                      onMouseDown={() => setSearchQuery(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Map overlay HUD */}
          <div className="map-hud-top">
            <div className="hud-badge">
              <span className="badge-dot" />
              <span>VISOR BLOQUEADO · ACTIVO</span>
            </div>
            <div className="hud-badge">
              <span>PLANO ÓPTICO · 01</span>
            </div>
          </div>

          {/* Compass */}
          <div className="compass">
            <div className="compass-ring">
              <div className="compass-needle" style={{ transform: `rotate(${-heading}deg)` }}>
                <div className="compass-n">N</div>
              </div>
              <div className="compass-deg">{heading}°</div>
            </div>
          </div>

          {/* Speed/Alt gauges */}
          <div className="gauges-left">
            <div className="gauge">
              <span className="gauge-label">VEL. SUELO</span>
              <span className="gauge-value">{speed}</span>
              <span className="gauge-unit">KTS</span>
            </div>
          </div>

          <div className="gauges-right">
            <div className="gauge">
              <span className="gauge-label">ALTITUD</span>
              <span className="gauge-value">{altitude.toLocaleString()}</span>
              <span className="gauge-unit">FT</span>
            </div>
          </div>

          {/* Weather widget */}
          {weather && (
            <div className="weather-widget">
              <div className="weather-temp">{weather.temperature}°C</div>
              <div className="weather-wind">💨 {weather.windspeed} km/h</div>
            </div>
          )}

          {/* Bottom HUD */}
          <div className="map-hud-bottom">
            <div className="hud-coords">
              <span>{location.lat.toFixed(4)}°N</span>
              <span>{Math.abs(location.lng).toFixed(4)}°W</span>
            </div>
            <div className="hud-dest">
              <span>DEST {heading}°</span>
            </div>
          </div>

          {/* Active layers indicators */}
          {activeLayers.length > 0 && (
            <div className="active-layers-bar">
              {activeLayers.slice(0, 8).map(l => (
                <span key={l.id} className="active-layer-chip">
                  {l.icon} {l.name} {l.dataCount > 0 && `(${l.dataCount})`}
                </span>
              ))}
            </div>
          )}

          {/* Scan line effect */}
          <div className="scanline" />
        </div>

        {/* ─── Right Panel ─────────────────────────────────────────── */}
        <aside className="right-panel">
          {/* Agent Section */}
          <div className="right-section">
            <div className="section-header">
              <h3><i className="fa-solid fa-robot" /> AGENTE IA</h3>
              <button
                className={`agent-toggle ${agentActive ? 'active' : ''}`}
                onClick={() => setAgentActive(!agentActive)}
              >
                {agentActive ? 'ACTIVO' : 'INACTIVO'}
              </button>
            </div>
            {agentActive && (
              <div className="agent-panel">
                <div className="agent-status">
                  <span className="status-dot active" />
                  <span>Agente en espera</span>
                </div>
                <p className="agent-hint">Mantén Espacio para hablar · Pulsa Espacio para controles</p>
              </div>
            )}
          </div>

          {/* Visual Presets */}
          <div className="right-section">
            <div className="section-header">
              <h3><i className="fa-solid fa-palette" /> PREAJUSTES VISUALES</h3>
            </div>
            <div className="presets-grid">
              {PRESETS.map(p => (
                <button
                  key={p.id}
                  className={`preset-btn ${activePreset === p.id ? 'active' : ''}`}
                  onClick={() => setActivePreset(p.id)}
                >
                  <span className="preset-icon">{p.icon}</span>
                  <span className="preset-name">{p.name}</span>
                  <span className="preset-key">{p.key}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Map Sources */}
          <div className="right-section">
            <div className="section-header">
              <h3><i className="fa-solid fa-globe" /> FUENTES DE MAPA</h3>
            </div>
            <div className="map-sources">
              {MAP_SOURCES.map(s => (
                <button
                  key={s.id}
                  className={`source-btn ${activeMapSource === s.id ? 'active' : ''}`}
                  onClick={() => setActiveMapSource(s.id)}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Cities */}
          <div className="right-section">
            <div className="section-header">
              <h3><i className="fa-solid fa-location-dot" /> UBICACIONES</h3>
              <button className="section-btn" onClick={() => setCityPanelOpen(!cityPanelOpen)}>
                <i className={`fa-solid fa-${cityPanelOpen ? 'minus' : 'plus'}`} />
              </button>
            </div>
            {cityPanelOpen && (
              <div className="cities-list">
                {CITIES.map(city => (
                  <button
                    key={city.name}
                    className="city-btn"
                    onClick={() => {
                      setLocation({ lat: city.lat, lng: city.lng })
                      if (mapInstanceRef.current) {
                        mapInstanceRef.current.flyTo([city.lat, city.lng], 10, { duration: 2 })
                        if (markerRef.current) {
                          markerRef.current.setLatLng([city.lat, city.lng])
                        }
                      }
                    }}
                  >
                    <span className="city-pin">📍</span>
                    <span className="city-name">{city.name}</span>
                    <span className="city-coords">{city.lat.toFixed(2)}°, {Math.abs(city.lng).toFixed(2)}°</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Live Stats */}
          <div className="right-section">
            <div className="section-header">
              <h3><i className="fa-solid fa-chart-line" /> ESTADÍSTICAS EN VIVO</h3>
            </div>
            <div className="live-stats">
              <div className="stat-item">
                <span className="stat-icon">✈️</span>
                <span className="stat-label">Vuelos</span>
                <span className="stat-value">{flights.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">🌋</span>
                <span className="stat-label">Terremotos</span>
                <span className="stat-value">{earthquakes.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">🛰️</span>
                <span className="stat-label">Satélites</span>
                <span className="stat-value">{satellites.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">🚀</span>
                <span className="stat-label">Lanzamientos</span>
                <span className="stat-value">{spaceLaunches.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">🔥</span>
                <span className="stat-label">Eventos</span>
                <span className="stat-value">{naturalEvents.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">◉</span>
                <span className="stat-label">Radios</span>
                <span className="stat-value">{radioStations.length}</span>
              </div>
            </div>
          </div>

          {/* Data Panel */}
          <div className="right-section">
            <div className="section-header">
              <h3><i className="fa-solid fa-database" /> PANEL DE DATOS</h3>
              <button className="section-btn" onClick={() => setDataPanelOpen(!dataPanelOpen)}>
                <i className={`fa-solid fa-${dataPanelOpen ? 'minus' : 'plus'}`} />
              </button>
            </div>
            {dataPanelOpen && (
              <div className="data-panel">
                <div className="data-row">
                  <span className="data-label">UBICACIÓN</span>
                  <span className="data-value">{location.lat.toFixed(4)}°N, {Math.abs(location.lng).toFixed(4)}°W</span>
                </div>
                <div className="data-row">
                  <span className="data-label">ALTITUD</span>
                  <span className="data-value">{altitude.toLocaleString()} FT</span>
                </div>
                <div className="data-row">
                  <span className="data-label">VELOCIDAD</span>
                  <span className="data-value">{speed} KTS</span>
                </div>
                <div className="data-row">
                  <span className="data-label">RUMBO</span>
                  <span className="data-value">{heading}°</span>
                </div>
                <div className="data-row">
                  <span className="data-label">CAPAS ACTIVAS</span>
                  <span className="data-value">{activeLayerCount}</span>
                </div>
                <div className="data-row">
                  <span className="data-label">ESTILO</span>
                  <span className="data-value">{activePreset.toUpperCase()}</span>
                </div>
                <div className="data-row">
                  <span className="data-label">MAPA</span>
                  <span className="data-value">{MAP_SOURCES.find(s => s.id === activeMapSource)?.name}</span>
                </div>
                {weather && (
                  <>
                    <div className="data-row">
                      <span className="data-label">TEMPERATURA</span>
                      <span className="data-value">{weather.temperature}°C</span>
                    </div>
                    <div className="data-row">
                      <span className="data-label">VIENTO</span>
                      <span className="data-value">{weather.windspeed} km/h</span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* ─── Bottom Bar ────────────────────────────────────────────── */}
      <footer className="bottom-bar">
        <div className="bottom-left">
          <span className="classification">SECRETO // EXTREMADURA // SIN EXTRANJEROS</span>
        </div>
        <div className="bottom-center">
          <span className="bottom-info">
            APIs ACTIVAS: OpenSky · USGS · NASA EONET · CelesTrak · Open-Meteo · Radio Browser
          </span>
        </div>
        <div className="bottom-right">
          <span className="bottom-info">
            DATOS: OpenStreetMap · CelesTrak · USGS · NASA
          </span>
        </div>
      </footer>

      {/* ─── Corner Decorations ────────────────────────────────────── */}
      <div className="corner-decor top-left-corner" />
      <div className="corner-decor top-right-corner" />
      <div className="corner-decor bottom-left-corner" />
      <div className="corner-decor bottom-right-corner" />
    </div>
  )
}
