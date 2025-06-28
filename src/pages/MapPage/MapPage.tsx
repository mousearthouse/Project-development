import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import './MapPage.css'
import vectorIcon from '../../assets/vector.svg'
import dotIcon from '../../assets/dot.svg'
import ShutterComponent from '../../components/ShutterComponent/ShutterComponent'
import PlacemarkCard from '../../components/PlacemarkCard/PlacemarkCard'
import AddButton from '../../components/AddButton/AddButton'
import OrangeButton, { PointType } from '../../components/OrangeButton/OrangeButton'
import type { PointType as PointTypeType } from '../../components/OrangeButton/OrangeButton'

declare global {
  interface Window {
    ymaps: any;
  }
}

const MapPage: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const clickHandlerRef = useRef<any>(null)
  const pathCoordsRef = useRef<number[][]>([])
  const currentPolylineRef = useRef<any>(null)
  const pathPlacemarksRef = useRef<any[]>([])
  const savedPathsRef = useRef<{coords: number[][], polyline: any, placemarks: any[], isCollapsed: boolean, firstPlacemark?: any}[]>([])
  const [selectedPlace, setSelectedPlace] = useState<{title: string, address: string} | null>(null)
  const [isSpotMode, setIsSpotMode] = useState<boolean>(false)
  const [isPathMode, setIsPathMode] = useState<boolean>(false)
  const [spotPlaced, setSpotPlaced] = useState<boolean>(false)
  const [mapError, setMapError] = useState<string | null>(null)
  const [currentPointType, setCurrentPointType] = useState<PointTypeType>(PointType.NORMAL)

  useEffect(() => {
    try {
      if (!window.ymaps) {
        const script = document.createElement('script')
        script.src = 'https://api-maps.yandex.ru/2.1/?apikey=d1c140db-5f78-41f9-8617-158a231781a9&lang=ru_RU'
        script.async = true
        script.onload = initMap
        script.onerror = () => setMapError('Failed to load Yandex Maps')
        document.head.appendChild(script)
      } else {
        initMap()
      }
    } catch (error) {
      console.error('Error loading map:', error)
      setMapError('Error loading map')
    }

    function initMap(): void {
      try {
        window.ymaps.ready(() => {
          if (mapRef.current && !mapInstanceRef.current) {
            const map = new window.ymaps.Map(mapRef.current, {
              center: [56.484649, 84.947649],
              zoom: 15,
              controls: ['zoomControl', 'fullscreenControl', 'geolocationControl'],
              behaviors: ['default', 'scrollZoom']
            }, {
              searchControlProvider: 'yandex#search'
            })

            mapInstanceRef.current = map

          }
        })
      } catch (error) {
        console.error('Error initializing map:', error)
        setMapError('Error initializing map')
      }
    }
  }, [])

  useEffect(() => {
    try {
      if (mapInstanceRef.current) {
        if (clickHandlerRef.current) {
          mapInstanceRef.current.events.remove('click', clickHandlerRef.current)
        }
        
        const clickHandler = function (e: any) {
          try {
            console.log('Map clicked, isSpotMode:', isSpotMode, 'isPathMode:', isPathMode, 'spotPlaced:', spotPlaced)
            
            if (isSpotMode && !spotPlaced) {
              const coords = e.get('coords')
              console.log('Placing spot at coordinates:', coords)
              
              if (isSpotTooClose(coords)) {
                console.log('Spot too close to existing spot, not placing')
                return
              }
              
              const newPlacemark = new window.ymaps.Placemark(coords, {
                balloonContent: `Координаты: ${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}`
              }, {
                iconLayout: 'default#image',
                iconImageHref: dotIcon,
                iconImageSize: [30, 30],
                iconImageOffset: [-15, -20]
              })
              
              newPlacemark.events.add('click', function() {
                setSelectedPlace({
                  title: 'Новая точка',
                  address: `Координаты: ${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}`
                })
              })
              
              mapInstanceRef.current.geoObjects.add(newPlacemark)
              setSpotPlaced(true)
              setIsSpotMode(false)
              console.log('Spot placed, exiting spot mode')
            }
            

            if (isPathMode) {
              const coords = e.get('coords')
              console.log('Adding point to path at coordinates:', coords)
              
              pathCoordsRef.current.push(coords)
              
              const newPlacemark = new window.ymaps.Placemark(coords, {
                balloonContent: `Точка пути`,
                hintContent: 'Точка маршрута'
              }, {
                iconLayout: 'default#image',
                iconImageHref: createPointIcon(currentPointType),
                iconImageSize: [32, 32],
                iconImageOffset: [-16, -16]
              })
              
              newPlacemark.events.add('click', function() {
                console.log('Path point clicked')
                
                if (isPathMode) {
                  const confirmDelete = window.confirm('Удалить эту точку пути?')
                  
                  if (confirmDelete) {
                    mapInstanceRef.current.geoObjects.remove(newPlacemark)
                    
                    const coordIndex = pathCoordsRef.current.findIndex(coord => 
                      Math.abs(coord[0] - coords[0]) < 0.0001 && Math.abs(coord[1] - coords[1]) < 0.0001
                    )
                    if (coordIndex !== -1) {
                      pathCoordsRef.current.splice(coordIndex, 1)
                    }
                    
                    const placemarkIndex = pathPlacemarksRef.current.indexOf(newPlacemark)
                    if (placemarkIndex !== -1) {
                      pathPlacemarksRef.current.splice(placemarkIndex, 1)
                    }
                    
                    if (currentPolylineRef.current) {
                      mapInstanceRef.current.geoObjects.remove(currentPolylineRef.current)
                      currentPolylineRef.current = null
                    }
                    
                    if (pathCoordsRef.current.length > 1) {
                      const polyline = new window.ymaps.Polyline(pathCoordsRef.current, {
                        hintContent: 'Маршрут'
                      }, {
                        strokeColor: '#FF0000',
                        strokeWidth: 3,
                        strokeOpacity: 0.8,
                        zIndex: 100
                      })
                      
                      currentPolylineRef.current = polyline
                      mapInstanceRef.current.geoObjects.add(polyline)
                    }
                    
                    console.log('Point deleted from path')
                  } else {
                    console.log('Point deletion cancelled')
                  }
                  return
                }
                
                console.log('Path point clicked but not in path mode - no action')
              })
              
              pathPlacemarksRef.current.push(newPlacemark)
              mapInstanceRef.current.geoObjects.add(newPlacemark)
              
              if (pathCoordsRef.current.length > 1) {
                if (currentPolylineRef.current) {
                  mapInstanceRef.current.geoObjects.remove(currentPolylineRef.current)
                }
                
                const polyline = new window.ymaps.Polyline(pathCoordsRef.current, {
                  hintContent: 'Маршрут'
                }, {
                  strokeColor: '#FF0000',
                  strokeWidth: 3,
                  strokeOpacity: 0.8,
                  zIndex: 100
                })
                
                currentPolylineRef.current = polyline
                mapInstanceRef.current.geoObjects.add(polyline)
              }
            }
          } catch (error) {
            console.error('Error in click handler:', error)
          }
        }
        
        clickHandlerRef.current = clickHandler
        mapInstanceRef.current.events.add('click', clickHandler)
      }
    } catch (error) {
      console.error('Error setting up map events:', error)
    }
  }, [isSpotMode, isPathMode, spotPlaced, currentPointType])

  const handleCloseCard = (): void => {
    setSelectedPlace(null)
  }

  const handleAddPlace = (): void => {
    console.log('Add new place clicked')
  }

  const handleAddSpot = (): void => {
    console.log('Add spot clicked - setting spot mode to true')
    setIsSpotMode(true)
    setIsPathMode(false)
    setSpotPlaced(false)
  }

  const handleAddPath = (): void => {
    console.log('Add path clicked - setting path mode to true')
    setIsPathMode(true)
    setIsSpotMode(false)
    pathCoordsRef.current = []
    if (currentPolylineRef.current) {
      mapInstanceRef.current.geoObjects.remove(currentPolylineRef.current)
      currentPolylineRef.current = null
    }
  }

  const handleExitPathMode = (): void => {
    console.log('Exiting path mode')
    
    if (currentPolylineRef.current && pathCoordsRef.current.length > 1) {
      const middleIndex = Math.floor(pathPlacemarksRef.current.length / 2)
      
      pathPlacemarksRef.current.forEach((placemark, index) => {
        if (index !== middleIndex) {
          mapInstanceRef.current.geoObjects.remove(placemark)
        }
      })
      
      mapInstanceRef.current.geoObjects.remove(currentPolylineRef.current)
      
      const middlePlacemark = pathPlacemarksRef.current[middleIndex]
      if (middlePlacemark) {
        middlePlacemark.events.remove('click')
        
        const expandHandler = function() {
          console.log('Expanding collapsed path')
          
          const pathIndex = savedPathsRef.current.findIndex(savedPath => 
            savedPath.firstPlacemark === middlePlacemark
          )
          
          if (pathIndex !== -1) {
            const savedPath = savedPathsRef.current[pathIndex]
            
            if (savedPath.isCollapsed) {
              savedPath.placemarks.forEach(placemark => {
                mapInstanceRef.current.geoObjects.add(placemark)
              })
              
              if (savedPath.polyline) {
                mapInstanceRef.current.geoObjects.add(savedPath.polyline)
              }
              
              savedPath.isCollapsed = false
              
              savedPath.placemarks.forEach(placemark => {
                placemark.events.remove('click')
                const collapseHandler = function() {
                  console.log('Collapsing expanded path')
                  
                  savedPath.placemarks.forEach((pm, index) => {
                    if (index !== middleIndex) {
                      mapInstanceRef.current.geoObjects.remove(pm)
                    }
                  })
                  
                  if (savedPath.polyline) {
                    mapInstanceRef.current.geoObjects.remove(savedPath.polyline)
                  }
                  
                  savedPath.isCollapsed = true
                  
                  if (savedPath.firstPlacemark) {
                    savedPath.firstPlacemark.events.remove('click')
                    savedPath.firstPlacemark.events.add('click', expandHandler)
                  }
                }
                placemark.events.add('click', collapseHandler)
              })
            }
          }
        }
        
        middlePlacemark.events.add('click', expandHandler)
      }
      
      savedPathsRef.current.push({
        coords: [...pathCoordsRef.current],
        polyline: currentPolylineRef.current,
        placemarks: [...pathPlacemarksRef.current],
        isCollapsed: true,
        firstPlacemark: middlePlacemark
      })
      
      console.log('Saved path with', pathCoordsRef.current.length, 'points (collapsed to middle point)')
    }
    
    setIsPathMode(false)
    pathCoordsRef.current = []
    pathPlacemarksRef.current = []
    currentPolylineRef.current = null
  }

  const handleExitMode = (): void => {
    console.log('Exiting current mode')
    if (isSpotMode) {
      setIsSpotMode(false)
      setSpotPlaced(false)
    }
    if (isPathMode) {
      handleExitPathMode()
    }
  }

  const createPointIcon = (pointType: PointTypeType): string => {
    const colors = {
      [PointType.BAD_ROAD]: '#FF3B30',
      [PointType.STAIRS]: '#007AFF',
      [PointType.NORMAL]: '#34C759'
    }
    
    const letters = {
      [PointType.BAD_ROAD]: 'B',
      [PointType.STAIRS]: 'S',
      [PointType.NORMAL]: 'N'
    }

    return 'data:image/svg+xml;base64,' + btoa(`
      <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="14" fill="${colors[pointType]}" stroke="#FFFFFF" stroke-width="2"/>
        <text x="16" y="22" text-anchor="middle" fill="white" font-size="16" font-weight="bold" font-family="Arial">${letters[pointType]}</text>
      </svg>
    `)
  }

  const handleOrangeButtonClick = (pointType: PointTypeType): void => {
    console.log('Point type changed to:', pointType)
    setCurrentPointType(pointType)
  }

  const handlePlaceSpecialPoint = (): void => {
    if (!mapInstanceRef.current) return
    
    console.log('Entering special point mode for:', currentPointType)
    
    const specialPointHandler = function(e: any) {
      const coords = e.get('coords')
      console.log('Placing special point at:', coords)
      
      const pointNames = {
        [PointType.BAD_ROAD]: 'Плохая дорога',
        [PointType.STAIRS]: 'Лестница',
        [PointType.NORMAL]: 'Обычная точка'
      }
      
      const newPlacemark = new window.ymaps.Placemark(coords, {
        balloonContent: `${pointNames[currentPointType]}`
      }, {
        iconLayout: 'default#image',
        iconImageHref: createPointIcon(currentPointType),
        iconImageSize: [32, 32],
        iconImageOffset: [-16, -16]
      })
      
      newPlacemark.events.add('click', function() {
        setSelectedPlace({
          title: pointNames[currentPointType],
          address: `Координаты: ${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}`
        })
      })
      
      mapInstanceRef.current.geoObjects.add(newPlacemark)
      
      mapInstanceRef.current.events.remove('click', specialPointHandler)
    }
    
    mapInstanceRef.current.events.add('click', specialPointHandler)
  }

  const calculateDistance = (coord1: number[], coord2: number[]): number => {
    const lat1 = coord1[0] * Math.PI / 180
    const lon1 = coord1[1] * Math.PI / 180
    const lat2 = coord2[0] * Math.PI / 180
    const lon2 = coord2[1] * Math.PI / 180

    const dlat = lat2 - lat1
    const dlon = lon2 - lon1

    const a = Math.sin(dlat/2) * Math.sin(dlat/2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dlon/2) * Math.sin(dlon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    const R = 6371000 

    return R * c
  }

  const isSpotTooClose = (newCoords: number[]): boolean => {
    const minDistance = 50 
    const allSpots: any[] = []
    
    mapInstanceRef.current.geoObjects.each((geoObject: any) => {
      if (geoObject.geometry && geoObject.geometry.getType() === 'Point') {
        const coords = geoObject.geometry.getCoordinates()
        const iconHref = geoObject.options.get('iconImageHref')
        
        if (iconHref === dotIcon) {
          allSpots.push(coords)
        }
      }
    })
    
    for (const spotCoords of allSpots) {
      const distance = calculateDistance(newCoords, spotCoords)
      if (distance < minDistance) {
        return true
      }
    }
    
    return false
  }

  if (mapError) {
    return (
      <div className="map-container">
        <div className="map-header">
          <Link to="/" className="back-button">
            <img src={vectorIcon} alt="Back" style={{ width: '24px', height: '24px', transform: 'rotate(90deg)' }} />
          </Link>
          <h1 className="map-title">Карта</h1>
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh',
          color: 'red' 
        }}>
          {mapError}
        </div>
      </div>
    )
  }

  return (
    <div className="map-container">
      <div className="map-header">
        <Link to="/" className="back-button">
          <img src={vectorIcon} alt="Back" style={{ width: '24px', height: '24px', transform: 'rotate(90deg)' }} />
        </Link>
        <h1 className="map-title">Карта</h1>
        {isSpotMode && (
          <div className="mode-indicator">
            Режим: Спот - кликните на карту
          </div>
        )}
        {isPathMode && (
          <div className="mode-indicator">
            Режим: Путь - кликайте для добавления точек
          </div>
        )}
      </div>
      <div ref={mapRef} className="yandex-map"></div>
      <ShutterComponent />
      {isPathMode && <OrangeButton onClick={handleOrangeButtonClick} />}
      <AddButton 
        onAddSpot={handleAddSpot} 
        onAddPath={handleAddPath} 
        onExitMode={handleExitMode}
        isSpotMode={isSpotMode}
        isPathMode={isPathMode}
      />
      {selectedPlace && (
        <PlacemarkCard
          title={selectedPlace.title}
          address={selectedPlace.address}
          onClose={handleCloseCard}
        />
      )}
    </div>
  )
}

export default MapPage
