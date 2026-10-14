import { useState, useEffect, useRef, useCallback } from 'react'
import L from 'leaflet'
import './App.css'

// ─── Types ───────────────────────────────────────────────────────────────────
interface LayerItem {
  id: string
  icon: string
  name: string
  desc: string
  source: string
  active: boolean
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
      { id: 'satellites', icon: '🛰️', name: 'Satélites', desc: 'CelesTrak', source: 'Rastreo orbital', active: true },
      { id: 'flights', icon: '✈️', name: 'Vuelos en Vivo', desc: 'OpenSky Network', source: 'ADS-B', active: true },
      { id: 'military', icon: '🎖️', name: 'Vuelos Militares', desc: 'Aeronaves militares', source: 'MLAT', active: true },
      { id: 'adsb', icon: '📡', name: 'ADS-B Local', desc: 'RTL-SDR · WebUSB', source: 'Receptor local', active: true },
      { id: 'vessels', icon: '◭', name: 'Embarcaciones', desc: 'MarineTraffic', source: 'AIS', active: true },
      { id: 'traffic', icon: '🚗', name: 'Tráfico Urbano', desc: 'OpenStreetMap / TomTom', source: 'Sensores', active: true },
      { id: 'transit', icon: '🚌', name: 'Transporte Público', desc: 'GTFS-RT', source: 'Operadores', active: true },
      { id: 'bikes', icon: '🚲', name: 'Bicicletas', desc: 'GBFS', source: 'Estaciones', active: true },
    ]
  },
  {
    title: 'Cámaras',
    icon: '📹',
    layers: [
      { id: 'cameras', icon: '📹', name: 'Cámaras CCTV', desc: 'CCTV + Street View', source: 'Mapeo comunitario', active: true },
      { id: 'imagery', icon: '🛰️', name: 'Imágenes Recientes', desc: 'NASA GIBS · HLS + VIIRS', source: 'Satélite', active: true },
    ]
  },
  {
    title: 'Infraestructura',
    icon: '📷',
    layers: [
      { id: 'alpr', icon: '📷', name: 'Cámaras ALPR', desc: 'OpenStreetMap', source: 'Mapeo comunitario', active: true },
      { id: 'installations', icon: '⌖', name: 'Instalaciones', desc: 'OSM + Google Places', source: 'Puntos de interés', active: true },
      { id: 'datacenters', icon: '▣', name: 'Centros de Datos', desc: 'Base de datos local', source: 'Infraestructura', active: true },
      { id: 'cables', icon: '≋', name: 'Cables Submarinos', desc: 'TeleGeography', source: 'Red global', active: true },
      { id: 'dams', icon: '▰', name: 'Presas', desc: 'USACE', source: 'Infraestructura hídrica', active: true },
    ]
  },
  {
    title: 'Eventos',
    icon: '🚀',
    layers: [
      { id: 'space', icon: '🚀', name: 'Misiones Espaciales', desc: 'Launch Library 2', source: '30 días', active: true },
      { id: 'earthquakes', icon: '🌋', name: 'Terremotos', desc: 'USGS', source: '24 horas', active: true },
      { id: 'fires', icon: '▲', name: 'Incendios Activos', desc: 'NASA FIRMS', source: 'EN VIVO', active: true },
      { id: 'firePerim', icon: '🔥', name: 'Perímetros de Fuego', desc: 'NIFC WFIGS', source: 'Agencias', active: true },
    ]
  },
  {
    title: 'Clima',
    icon: '🌬',
    layers: [
      { id: 'wind', icon: '🌬', name: 'Viento', desc: 'GFS / ECMWF IFS', source: 'Pronóstico', active: true },
      { id: 'rain', icon: '◉', name: 'Radar de Lluvia', desc: 'NOAA nowCOAST', source: 'Observado', active: true },
      { id: 'clouds', icon: '☁', name: 'Nubes Satélite', desc: 'NOAA nowCOAST', source: 'Observado', active: true },
      { id: 'lightning', icon: 'ϟ', name: 'Densidad Rayos', desc: 'NOAA nowCOAST', source: 'Observado', active: true },
      { id: 'cyclones', icon: '◉', name: 'Ciclones', desc: 'NOAA NHC / CPHC', source: 'Avisos', active: true },
    ]
  },
  {
    title: 'Utilidades',
    icon: '🧭',
    layers: [
      { id: 'directions', icon: '🧭', name: 'Direcciones', desc: 'OSM Routing', source: 'Rutas', active: true },
      { id: 'radio', icon: '◉', name: 'Radio', desc: 'Radio Browser', source: 'Emisoras', active: true },
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
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.CircleMarker | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)

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

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchRef.current) {
        e.preventDefault()
        searchRef.current?.focus()
      }
      if (e.key === 'Escape') {
        setSearchFocused(false)
        searchRef.current?.blur()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Search logic
  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSearchResults([])
      return
    }
    const query = searchQuery.toLowerCase()
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
      { name: 'Don Benito', lat: 38.9500, lng: -5.6833, type: 'Ciudad' },
      { name: 'Villanueva de la Serena', lat: 39.0167, lng: -5.7833, type: 'Ciudad' },
      { name: 'Almendralejo', lat: 38.6833, lng: -6.6667, type: 'Ciudad' },
      { name: 'Navalmoral de la Mata', lat: 39.9000, lng: -5.5500, type: 'Ciudad' },
      { name: 'Aeródromo de Talavera', lat: 39.9667, lng: -4.8500, type: 'Aeródromo' },
      { name: 'Aeropuerto de Badajoz', lat: 38.8914, lng: -6.8211, type: 'Aeropuerto' },
      { name: 'Base Aérea de Talavera', lat: 39.9500, lng: -4.8500, type: 'Base Militar' },
      { name: 'Central Nuclear Almaraz', lat: 39.8108, lng: -6.2097, type: 'Central Nuclear' },
      { name: 'Presa de Valdecañas', lat: 39.8333, lng: -5.8833, type: 'Presa' },
      { name: 'Río Tajo', lat: 39.5000, lng: -5.8000, type: 'Río' },
      { name: 'Río Guadiana', lat: 38.5000, lng: -6.5000, type: 'Río' },
    ]
    const results = allPlaces.filter(p => p.name.toLowerCase().includes(query))
    setSearchResults(results.slice(0, 8))
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

    // Add Extremadura region outline (approximate)
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

    mapInstanceRef.current = map
    markerRef.current = marker

    return () => { map.remove() }
  }, [])

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
              <span className="hud-label">ALT</span>
              <span className="hud-value">{altitude.toLocaleString()} FT</span>
            </div>
            <div className="hud-divider" />
            <div className="hud-stat">
              <span className="hud-label">VEL</span>
              <span className="hud-value">{speed} KTS</span>
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
                        <span className="layer-name">{layer.name}</span>
                        <span className="layer-desc">{layer.desc}</span>
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
              {activeLayers.map(l => (
                <span key={l.id} className="active-layer-chip">
                  {l.icon} {l.name}
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

          {/* Scenes */}
          <div className="right-section">
            <div className="section-header">
              <h3><i className="fa-solid fa-film" /> ESCENAS</h3>
              <button className="section-btn" onClick={() => setScenesOpen(!scenesOpen)}>
                <i className={`fa-solid fa-${scenesOpen ? 'minus' : 'plus'}`} />
              </button>
            </div>
            {scenesOpen && (
              <div className="scenes-list">
                <div className="scene-item">
                  <span className="scene-icon">🌊</span>
                  <div className="scene-info">
                    <span className="scene-name">Inundación en Extremadura</span>
                    <span className="scene-meta">NORMAL · 4.0s + 0.9s</span>
                  </div>
                  <button className="scene-btn">CARGAR</button>
                </div>
                <div className="scene-item">
                  <span className="scene-icon">✈️</span>
                  <div className="scene-info">
                    <span className="scene-name">Radar de Vuelos Global</span>
                    <span className="scene-meta">NORMAL · 4.0s + 0.9s</span>
                  </div>
                  <button className="scene-btn">CARGAR</button>
                </div>
                <div className="scene-item">
                  <span className="scene-icon">🛰️</span>
                  <div className="scene-info">
                    <span className="scene-name">Vigilancia Orbital</span>
                    <span className="scene-meta">NORMAL · 4.0s + 0.9s</span>
                  </div>
                  <button className="scene-btn">CARGAR</button>
                </div>
                <div className="scene-item">
                  <span className="scene-icon">🔥</span>
                  <div className="scene-info">
                    <span className="scene-name">Panel de Amenazas Térmicas</span>
                    <span className="scene-meta">NORMAL · 4.0s + 0.9s</span>
                  </div>
                  <button className="scene-btn">CARGAR</button>
                </div>
                <div className="scene-item">
                  <span className="scene-icon">🏙️</span>
                  <div className="scene-info">
                    <span className="scene-name">Sobrecarga Urbana</span>
                    <span className="scene-meta">NORMAL · 4.0s + 0.9s</span>
                  </div>
                  <button className="scene-btn">CARGAR</button>
                </div>
                <div className="scene-item new">
                  <span className="scene-icon">👁️</span>
                  <div className="scene-info">
                    <span className="scene-name">Omnisciencia Total</span>
                    <span className="scene-meta">NORMAL · 4.0s + 0.9s</span>
                  </div>
                  <button className="scene-btn">NUEVO</button>
                </div>
              </div>
            )}
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
            MGRS: 30T UK 2090 4906 · GSD: 9.37m · NIIRS: 1.7
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
