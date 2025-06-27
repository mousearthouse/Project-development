import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import './MapPage.css'
import vectorIcon from '../../assets/vector.svg'
import ShutterComponent from '../../components/ShutterComponent/ShutterComponent'

declare global {
  interface Window {
    ymaps: any;
  }
}

const MapPage: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!window.ymaps) {
      const script = document.createElement('script')
      script.src = 'https://api-maps.yandex.ru/2.1/?apikey=d1c140db-5f78-41f9-8617-158a231781a9&lang=ru_RU'
      script.async = true
      script.onload = initMap
      document.head.appendChild(script)
    } else {
      initMap()
    }

    function initMap(): void {
      window.ymaps.ready(() => {
        if (mapRef.current) {
          const map = new window.ymaps.Map(mapRef.current, {
            center: [56.484649, 84.947649], // Томск
            zoom: 15,
            controls: ['zoomControl', 'fullscreenControl', 'geolocationControl'],
            behaviors: ['default', 'scrollZoom']
          }, {
            searchControlProvider: 'yandex#search'
          })

          const placemark = new window.ymaps.Placemark([56.484649, 84.947649], {
            balloonContent: 'Томск, центр города'
          }, {
            iconLayout: 'default#image',
            iconImageHref: 'data:image/svg+xml;base64,' + btoa('<svg width="20" height="20" xmlns="http://www.w3.org/2000/svg"><rect width="20" height="20" fill="#007AFF"/></svg>'),
            iconImageSize: [20, 20],
            iconImageOffset: [-10, -10]
          })

          map.geoObjects.add(placemark)

          map.events.add('click', function (e: any) {
            const coords = e.get('coords')
            console.log('Координаты клика:', coords)
            
            const newPlacemark = new window.ymaps.Placemark(coords, {
              balloonContent: `Координаты: ${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}`
            }, {
              iconLayout: 'default#image',
              iconImageHref: 'data:image/svg+xml;base64,' + btoa('<svg width="20" height="20" xmlns="http://www.w3.org/2000/svg"><rect width="20" height="20" fill="#007AFF"/></svg>'),
              iconImageSize: [20, 20],
              iconImageOffset: [-10, -10]
            })
            
            map.geoObjects.add(newPlacemark)
          })

          const clickedCoords: number[][] = []

          map.events.add('click', function (e: any) {
            const coords = e.get('coords')
            console.log('Координаты клика:', coords)

            clickedCoords.push(coords)

            const newPlacemark = new window.ymaps.Placemark(
              coords,
              {
                balloonContent: `Координаты: ${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}`
              },
              {
                iconLayout: 'default#image',
                iconImageHref: 'data:image/svg+xml;base64,' + btoa('<svg width="20" height="20" xmlns="http://www.w3.org/2000/svg"><rect width="20" height="20" fill="#007AFF"/></svg>'),
                iconImageSize: [20, 20],
                iconImageOffset: [-10, -10]
              }
            )

            map.geoObjects.add(newPlacemark)

            if (clickedCoords.length > 1) {
              const polyline = new window.ymaps.Polyline(clickedCoords, {}, {
                strokeColor: '#FF0000',
                strokeWidth: 3
              })

              map.geoObjects.each((geoObj: any) => {
                if (geoObj.geometry && geoObj.geometry.getType() === 'LineString') {
                  map.geoObjects.remove(geoObj)
                }
              })

              map.geoObjects.add(polyline)
            }
          })
        }
      })
    }
  }, [])

  return (
    <div className="map-container">
      <div className="map-header">
        <Link to="/" className="back-button">
          <img src={vectorIcon} alt="Back" style={{ width: '24px', height: '24px', transform: 'rotate(90deg)' }} />
        </Link>
        <h1 className="map-title">Карта</h1>
      </div>
      <div ref={mapRef} className="yandex-map"></div>
      <ShutterComponent />
    </div>
  )
}

export default MapPage
