import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import './MapPage.css'
import vectorIcon from '../../assets/vector.svg'
import dotIcon from '../../assets/dot.svg'
import spotIcon from '../../assets/spot.svg'
import badRoadIcon from '../../assets/bad_road.svg'
import stairsIcon from '../../assets/stares.svg'
import ShutterComponent from '../../components/ShutterComponent/ShutterComponent'
import PlacemarkCard from '../../components/PlacemarkCard/PlacemarkCard'
import AddButton from '../../components/AddButton/AddButton'
import OrangeButton, { PointType } from '../../components/OrangeButton/OrangeButton'
import type { PointType as PointTypeType } from '../../components/OrangeButton/OrangeButton'
import { createSpot } from '../../utils/api/requests/spots/createSpot'
import { getSpots } from '../../utils/api/requests/spots/getSpots'
import { createRoad, type CreateRoadPointDto } from '../../utils/api/requests/createRoad'
import { getRoads, type Road, type RoadPoint } from '../../utils/api/requests/getRoads'
import SpotCreationForm, { type SpotFormData } from '../../components/SpotCreationForm/SpotCreationForm'
import RoadCreationForm, { type RoadFormData } from '../../components/RoadCreationForm/RoadCreationForm'
import SpotPlacemarkCard from '../../components/SpotPlacemarkCard/SpotPlacemarkCard'
import ErrorToast from '../../components/ErrorToast/ErrorToast'
import type { Spot } from '../../utils/api/requests/spots/getSpots'

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
  const pathPointTypesRef = useRef<PointTypeType[]>([])
  const savedPathsRef = useRef<{coords: number[][], polyline: any, placemarks: any[], isCollapsed: boolean, firstPlacemark?: any}[]>([])
  const [selectedPlace, setSelectedPlace] = useState<{title: string, address: string, spotId?: string, roadId?: string, description?: string, fileId?: string} | null>(null)
  const [isSpotMode, setIsSpotMode] = useState<boolean>(false)
  const [isPathMode, setIsPathMode] = useState<boolean>(false)
  const [spotPlaced, setSpotPlaced] = useState<boolean>(false)
  const [mapError, setMapError] = useState<string | null>(null)
  const [currentPointType, setCurrentPointType] = useState<PointTypeType>(PointType.NORMAL)
  const [showSpotForm, setShowSpotForm] = useState<boolean>(false)
  const [pendingSpotCoords, setPendingSpotCoords] = useState<number[] | null>(null)
  const [showRoadForm, setShowRoadForm] = useState<boolean>(false)
  const [pendingRoadData, setPendingRoadData] = useState<CreateRoadPointDto[] | null>(null)
  const [showError, setShowError] = useState<boolean>(false)

  useEffect(() => {
    // Listen for WebSocket connection errors
    const handleWebSocketError = () => {
      setShowError(true)
    }

    const handleOnlineStatus = () => {
      if (!navigator.onLine) {
        setShowError(true)
      }
    }

    window.addEventListener('offline', handleOnlineStatus)
    window.addEventListener('online', () => setShowError(false))

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason?.message?.includes('fetch') || 
          event.reason?.message?.includes('network') ||
          event.reason?.message?.includes('ERR_CONNECTION') ||
          event.reason?.code === 'NETWORK_ERROR') {
        setShowError(true)
      }
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    // Check initial connection status
    if (!navigator.onLine) {
      setShowError(true)
    }

    return () => {
      window.removeEventListener('offline', handleOnlineStatus)
      window.removeEventListener('online', () => setShowError(false))
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, []);

    useEffect(() => {
        try {
            if (window.ymaps) {
                initMap();
            } else {
                const script = document.createElement('script');
                script.src =
                    'https://api-maps.yandex.ru/2.1/?apikey=d1c140db-5f78-41f9-8617-158a231781a9&lang=ru_RU';
                script.async = true;
                script.onload = initMap;
                script.onerror = () => setMapError('Не удалось загрузить Яндекс.Карты');
                document.head.appendChild(script);
            }
        } catch (error) {
            console.error('Ошибка при загрузке карты:', error);
            setMapError('Ошибка при загрузке карты');
        }

        function initMap(): void {
            try {
                window.ymaps.ready(() => {
                    if (mapRef.current && !mapInstanceRef.current) {
                        const map = new window.ymaps.Map(
                            mapRef.current,
                            {
                                center: [56.484649, 84.947649],
                                zoom: 15,
                                controls: [
                                    'zoomControl',
                                    'fullscreenControl',
                                    'geolocationControl',
                                ],
                                behaviors: ['default', 'scrollZoom'],
                            },
                            {
                                searchControlProvider: 'yandex#search',
                            },
                        );

                        mapInstanceRef.current = map;

                        loadExistingSpots();
                        loadExistingRoads();
                    }
                });
            } catch (error) {
                console.error('Ошибка при инициализации карты:', error);
                setMapError('Ошибка при инициализации карты');
            }
        }
    }, []);

    useEffect(() => {
        try {
            if (mapInstanceRef.current) {
                if (clickHandlerRef.current) {
                    mapInstanceRef.current.events.remove('click', clickHandlerRef.current);
                }

                const clickHandler = async function (e: any) {
                    try {
                        console.log(
                            'Карта нажата, isSpotMode:',
                            isSpotMode,
                            'isPathMode:',
                            isPathMode,
                            'spotPlaced:',
                            spotPlaced,
                        );

                        if (isSpotMode && !spotPlaced) {
                            const coords = e.get('coords');
                            console.log('Установка спота по координатам:', coords);

                            if (isSpotTooClose(coords)) {
                                console.log('Спот слишком близко к существующему споту, установка отменена');
                                return;
                            }

                            // Показать форму вместо немедленного создания спота
                            setPendingSpotCoords(coords);
                            setShowSpotForm(true);
                        }

                        if (isPathMode) {
                            const coords = e.get('coords');
                            console.log('Добавление точки в путь по координатам:', coords);

                            pathCoordsRef.current.push(coords);
                            pathPointTypesRef.current.push(currentPointType);

                            const newPlacemark = new window.ymaps.Placemark(
                                coords,
                                {
                                    balloonContent: `Точка пути`,
                                    hintContent: 'Точка маршрута',
                                },
                                {
                                    iconLayout: 'default#image',
                                    iconImageHref: createPointIcon(currentPointType),
                                    iconImageSize: [40, 40],
                                    iconImageOffset: [-20, -40],
                                },
                            );

                            newPlacemark.events.add('click', function () {
                                console.log('Точка пути нажата, но не в режиме пути - действие не выполнено');
                            });

                            pathPlacemarksRef.current.push(newPlacemark);
                            mapInstanceRef.current.geoObjects.add(newPlacemark);

                            if (pathCoordsRef.current.length > 1) {
                                if (currentPolylineRef.current) {
                                    if (Array.isArray(currentPolylineRef.current)) {
                                        currentPolylineRef.current.forEach((segment) => {
                                            mapInstanceRef.current.geoObjects.remove(segment);
                                        });
                                    } else {
                                        mapInstanceRef.current.geoObjects.remove(
                                            currentPolylineRef.current,
                                        );
                                    }
                                }

                                const segments = [];
                                for (let i = 0; i < pathCoordsRef.current.length - 1; i++) {
                                    const startType = pathPointTypesRef.current[i];
                                    const endType = pathPointTypesRef.current[i + 1];
                                    const segmentCoords = [
                                        pathCoordsRef.current[i],
                                        pathCoordsRef.current[i + 1],
                                    ];

                                    const color =
                                        startType === PointType.BAD_ROAD &&
                                        endType === PointType.BAD_ROAD
                                            ? '#FF9500'
                                            : startType === PointType.STAIRS &&
                                                endType === PointType.STAIRS
                                              ? '#555555'
                                              : '#0080FF';

                                    const segment = new window.ymaps.Polyline(
                                        segmentCoords,
                                        {
                                            hintContent: 'Маршрут',
                                        },
                                        {
                                            strokeColor: color,
                                            strokeWidth: 3,
                                            strokeOpacity: 0.8,
                                            zIndex: 100,
                                        },
                                    );

                                    segments.push(segment);
                                    mapInstanceRef.current.geoObjects.add(segment);
                                }

                                currentPolylineRef.current = segments;
                            }
                        }
                    } catch (error) {
                        console.error('Ошибка в обработчике клика:', error);
                    }
                };

                clickHandlerRef.current = clickHandler;
                mapInstanceRef.current.events.add('click', clickHandler);
            }
        } catch (error) {
            console.error('Ошибка при настройке событий карты:', error);
        }
    }, [isSpotMode, isPathMode, spotPlaced, currentPointType]);

  const loadExistingSpots = async () => {
    try {
      const response = await getSpots()
      const spots = response.data
      
      spots.forEach((spot: Spot) => {
        if (spot.latitude !== 0 && spot.longitude !== 0) {
          const placemark = new window.ymaps.Placemark([spot.latitude, spot.longitude], {
            balloonContent: `Спот (рейтинг: ${spot.rating})`
          }, {
            iconLayout: 'default#image',
            iconImageHref: spotIcon,
            iconImageSize: [50, 50],
            iconImageOffset: [-25, -50]
          })
          
          placemark.events.add('click', function() {
            setSelectedPlace({
              title: spot.name || 'Спот',
              address: `Координаты: ${spot.latitude.toFixed(6)}, ${spot.longitude.toFixed(6)}`,
              spotId: spot.id,
              description: spot.description || 'Описание отсутствует',
              fileId: spot.fileId
            })
          })
          
          mapInstanceRef.current.geoObjects.add(placemark)
        }
      })
    } catch (error) {
      console.error('Error loading spots:', error)
      setShowError(true)
    }
  }

  const loadExistingRoads = async () => {
    try {
      const response = await getRoads()
      const roads = response.data
      
      roads.forEach((road: Road) => {
        if (road.points.length > 1) {
          const sortedPoints = sortRoadPoints(road.points)
          const coordinates = sortedPoints.map(point => [point.latitude, point.longitude])
          
          const segments: any[] = []
          for (let i = 0; i < coordinates.length - 1; i++) {
            const startType = sortedPoints[i].type
            const endType = sortedPoints[i + 1].type
            const segmentCoords = [coordinates[i], coordinates[i + 1]]
            
            const color = (startType === 'Bad' && endType === 'Bad') 
              ? '#FF9500' 
              : (startType === 'Stairs' && endType === 'Stairs')
              ? '#555555'
              : '#0080FF'
            
            const segment = new window.ymaps.Polyline(segmentCoords, {
              hintContent: `Дорога (рейтинг: ${road.rating})`
            }, {
              strokeColor: color,
              strokeWidth: 3,
              strokeOpacity: 0.8,
              zIndex: 100
            })
            
            segments.push(segment)
          }
          
          const placemarks: any[] = sortedPoints.map((point: RoadPoint) => {
            const iconType = point.type === 'Bad' ? PointType.BAD_ROAD : 
                           point.type === 'Stairs' ? PointType.STAIRS : PointType.NORMAL
            
            return new window.ymaps.Placemark([point.latitude, point.longitude], {
              balloonContent: `Точка дороги (${point.type})`
            }, {
              iconLayout: 'default#image',
              iconImageHref: createPointIcon(iconType),
              iconImageSize: [40, 40],
              iconImageOffset: [-20, -40]
            })
          })
          
          const middleIndex = Math.floor(placemarks.length / 2)
          const middlePlacemark = placemarks[middleIndex]
          
          if (middlePlacemark) {
            mapInstanceRef.current.geoObjects.add(middlePlacemark)
            
            const expandHandler = function() {
              console.log('Expanding collapsed road')
              
              // Show PlacemarkCard with road information
              setSelectedPlace({
                title: road.name || 'Дорога',
                address: `Рейтинг: ${road.rating}/5 • ${road.points.length} точек`,
                roadId: road.id,
                description: road.description || 'Описание отсутствует',
                fileId: road.fileId
              })
              
              placemarks.forEach(placemark => {
                mapInstanceRef.current.geoObjects.add(placemark)
              })
              
              segments.forEach(segment => {
                mapInstanceRef.current.geoObjects.add(segment)
              })
              
              placemarks.forEach(placemark => {
                placemark.events.remove('click')
                const collapseHandler = function() {
                  console.log('Collapsing expanded road')
                  
                  // Close PlacemarkCard when collapsing
                  setSelectedPlace(null)
                  
                  placemarks.forEach((pm, index) => {
                    if (index !== middleIndex) {
                      mapInstanceRef.current.geoObjects.remove(pm)
                    }
                  })
                  
                  segments.forEach(segment => {
                    mapInstanceRef.current.geoObjects.remove(segment)
                  })
                  
                  if (middlePlacemark) {
                    middlePlacemark.events.remove('click')
                    middlePlacemark.events.add('click', expandHandler)
                  }
                }
                placemark.events.add('click', collapseHandler)
              })
            }
            
            middlePlacemark.events.add('click', expandHandler)
          }
        }
      })
    } catch (error) {
      console.error('Error loading roads:', error)
      setShowError(true)
    }
  }

    const sortRoadPoints = (points: RoadPoint[]): RoadPoint[] => {
        const startPoint = points.find((p) => p.parentPointId === null);
        if (!startPoint) return points;

        const sortedPoints = [startPoint];
        let currentPointId = startPoint.id;

        while (sortedPoints.length < points.length) {
            const nextPoint = points.find((p) => p.parentPointId === currentPointId);
            if (!nextPoint) break;

            sortedPoints.push(nextPoint);
            currentPointId = nextPoint.id;
        }

        return sortedPoints;
    };

    const handleCloseCard = (): void => {
        setSelectedPlace(null);
    };

    const handleAddPlace = (): void => {
        console.log('Add new place clicked');
    };

    const handleAddSpot = (): void => {
        console.log('Add spot clicked - setting spot mode to true');
        setIsSpotMode(true);
        setIsPathMode(false);
        setSpotPlaced(false);
    };

    const handleAddPath = (): void => {
        console.log('Add path clicked - setting path mode to true');
        setIsPathMode(true);
        setIsSpotMode(false);
        pathCoordsRef.current = [];
        pathPointTypesRef.current = [];
        if (currentPolylineRef.current) {
            if (Array.isArray(currentPolylineRef.current)) {
                currentPolylineRef.current.forEach((segment) => {
                    mapInstanceRef.current.geoObjects.remove(segment);
                });
            } else {
                mapInstanceRef.current.geoObjects.remove(currentPolylineRef.current);
            }
            currentPolylineRef.current = null;
        }
    };

    const handleExitPathMode = async (): Promise<void> => {
        console.log('Exiting path mode');

        if (currentPolylineRef.current && pathCoordsRef.current.length > 1) {
            // Convert point types to API format
            const points: CreateRoadPointDto[] = pathCoordsRef.current.map((coords, index) => ({
                latitude: coords[0],
                longitude: coords[1],
                type:
                    pathPointTypesRef.current[index] === PointType.BAD_ROAD
                        ? 'Bad'
                        : pathPointTypesRef.current[index] === PointType.STAIRS
                          ? 'Stairs'
                          : 'Normal',
            }));

            // Show form instead of immediately creating road
            setPendingRoadData(points);
            setShowRoadForm(true);

            // Don't continue with the rest of the function yet
            return;
        }

        setIsPathMode(false);
        pathCoordsRef.current = [];
        pathPlacemarksRef.current = [];
        pathPointTypesRef.current = [];
        currentPolylineRef.current = null;
    };

    const handleExitMode = (): void => {
        console.log('Exiting current mode');
        if (isSpotMode) {
            setIsSpotMode(false);
            setSpotPlaced(false);
        }
        if (isPathMode) {
            handleExitPathMode();
        }
    };

  const handleSpotFormSubmit = async (formData: SpotFormData) => {
    if (!pendingSpotCoords) return
    
    try {
      await createSpot({
        latitude: pendingSpotCoords[0],
        longitude: pendingSpotCoords[1],
        ...formData
      })
      console.log('Spot created successfully')
      
      const newPlacemark = new window.ymaps.Placemark(pendingSpotCoords, {
        balloonContent: `${formData.name || 'Спот'} (рейтинг: ${formData.rating})`
      }, {
        iconLayout: 'default#image',
        iconImageHref: spotIcon,
        iconImageSize: [50, 50],
        iconImageOffset: [-25, -50]
      })
      
      newPlacemark.events.add('click', function() {
        setSelectedPlace({
          title: formData.name || 'Спот',
          address: `Координаты: ${pendingSpotCoords[0].toFixed(6)}, ${pendingSpotCoords[1].toFixed(6)}`
        })
      })
      
      mapInstanceRef.current.geoObjects.add(newPlacemark)
    } catch (error) {
      console.error('Error creating spot:', error)
      setShowError(true)
    } finally {
      setShowSpotForm(false)
      setPendingSpotCoords(null)
      setSpotPlaced(true)
      setIsSpotMode(false)
    }
  }

    const handleSpotFormCancel = () => {
        setShowSpotForm(false);
        setPendingSpotCoords(null);
    };

  const handleRoadFormSubmit = async (formData: RoadFormData) => {
    if (!pendingRoadData) return
    
    try {
      await createRoad({
        points: pendingRoadData,
        ...formData
      })
      console.log('Road created successfully')
      
      // Continue with the original exit path mode logic
      const middleIndex = Math.floor(pathPlacemarksRef.current.length / 2)
      
      pathPlacemarksRef.current.forEach((placemark, index) => {
        if (index !== middleIndex) {
          mapInstanceRef.current.geoObjects.remove(placemark)
        }
      })
      
      if (Array.isArray(currentPolylineRef.current)) {
        currentPolylineRef.current.forEach(segment => {
          mapInstanceRef.current.geoObjects.remove(segment)
        })
      } else {
        mapInstanceRef.current.geoObjects.remove(currentPolylineRef.current)
      }
      
      const middlePlacemark = pathPlacemarksRef.current[middleIndex]
      if (middlePlacemark) {
        middlePlacemark.events.remove('click')
        
        const expandHandler = function() {
          console.log('Expanding collapsed path')
          
          // Show PlacemarkCard with road information
          setSelectedPlace({
            title: formData.name || 'Дорога',
            address: `Рейтинг: ${formData.rating}/5 • ${pendingRoadData.length} точек`,
            description: formData.description || 'Описание отсутствует',
            fileId: formData.fileId
          })
          
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
                if (Array.isArray(savedPath.polyline)) {
                  savedPath.polyline.forEach(segment => {
                    mapInstanceRef.current.geoObjects.add(segment)
                  })
                } else {
                  mapInstanceRef.current.geoObjects.add(savedPath.polyline)
                }
              }
              
              savedPath.isCollapsed = false
              
              savedPath.placemarks.forEach(placemark => {
                placemark.events.remove('click')
                const collapseHandler = function() {
                  console.log('Collapsing expanded path')
                  
                  // Close PlacemarkCard when collapsing
                  setSelectedPlace(null)
                  
                  savedPath.placemarks.forEach((pm, index) => {
                    if (index !== middleIndex) {
                      mapInstanceRef.current.geoObjects.remove(pm)
                    }
                  })
                  
                  if (savedPath.polyline) {
                    if (Array.isArray(savedPath.polyline)) {
                      savedPath.polyline.forEach(segment => {
                        mapInstanceRef.current.geoObjects.remove(segment)
                      })
                    } else {
                      mapInstanceRef.current.geoObjects.remove(savedPath.polyline)
                    }
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
      
    } catch (error) {
      console.error('Error creating road:', error)
      setShowError(true)
    } finally {
      setShowRoadForm(false)
      setPendingRoadData(null)
      setIsPathMode(false)
      pathCoordsRef.current = []
      pathPlacemarksRef.current = []
      pathPointTypesRef.current = []
      currentPolylineRef.current = null
    }
  }

    const handleRoadFormCancel = () => {
        setShowRoadForm(false);
        setPendingRoadData(null);

        pathPlacemarksRef.current.forEach(placemark => {
            mapInstanceRef.current.geoObjects.remove(placemark);
        });

        if (currentPolylineRef.current) {
            if (Array.isArray(currentPolylineRef.current)) {
                currentPolylineRef.current.forEach(segment => {
                    mapInstanceRef.current.geoObjects.remove(segment);
                });
            } else {
                mapInstanceRef.current.geoObjects.remove(currentPolylineRef.current);
            }
        }

        setIsPathMode(false);
        pathCoordsRef.current = [];
        pathPlacemarksRef.current = [];
        pathPointTypesRef.current = [];
        currentPolylineRef.current = null;
    };

    const createPointIcon = (pointType: PointTypeType): string => {
        if (pointType === PointType.BAD_ROAD) {
            return badRoadIcon;
        }

        if (pointType === PointType.STAIRS) {
            return stairsIcon;
        }

        if (pointType === PointType.NORMAL) {
            return dotIcon;
        }

        return dotIcon;
    };

    const handleOrangeButtonClick = (pointType: PointTypeType): void => {
        console.log('Point type changed to:', pointType);
        setCurrentPointType(pointType);
    };

    const handlePlaceSpecialPoint = (): void => {
        if (!mapInstanceRef.current) return;

        console.log('Entering special point mode for:', currentPointType);

        const specialPointHandler = function (e: any) {
            const coords = e.get('coords');
            console.log('Placing special point at:', coords);

            const pointNames = {
                [PointType.BAD_ROAD]: 'Плохая дорога',
                [PointType.STAIRS]: 'Лестница',
                [PointType.NORMAL]: 'Обычная точка',
            };

            const newPlacemark = new window.ymaps.Placemark(
                coords,
                {
                    balloonContent: `${pointNames[currentPointType]}`,
                },
                {
                    iconLayout: 'default#image',
                    iconImageHref: createPointIcon(currentPointType),
                    iconImageSize: [40, 40],
                    iconImageOffset: [-20, -20],
                },
            );

            newPlacemark.events.add('click', function () {
                setSelectedPlace({
                    title: pointNames[currentPointType],
                    address: `Координаты: ${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}`,
                });
            });

            mapInstanceRef.current.geoObjects.add(newPlacemark);

            mapInstanceRef.current.events.remove('click', specialPointHandler);
        };

        mapInstanceRef.current.events.add('click', specialPointHandler);
    };

    const calculateDistance = (coord1: number[], coord2: number[]): number => {
        const lat1 = (coord1[0] * Math.PI) / 180;
        const lon1 = (coord1[1] * Math.PI) / 180;
        const lat2 = (coord2[0] * Math.PI) / 180;
        const lon2 = (coord2[1] * Math.PI) / 180;

        const dlat = lat2 - lat1;
        const dlon = lon2 - lon1;

        const a =
            Math.sin(dlat / 2) * Math.sin(dlat / 2) +
            Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon / 2) * Math.sin(dlon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const R = 6371000;

        return R * c;
    };

    const isSpotTooClose = (newCoords: number[]): boolean => {
        const minDistance = 50;
        const allSpots: any[] = [];

        mapInstanceRef.current.geoObjects.each((geoObject: any) => {
            if (geoObject.geometry && geoObject.geometry.getType() === 'Point') {
                const coords = geoObject.geometry.getCoordinates();
                const iconHref = geoObject.options.get('iconImageHref');

                if (iconHref === spotIcon) {
                    allSpots.push(coords);
                }
            }
        });

        for (const spotCoords of allSpots) {
            const distance = calculateDistance(newCoords, spotCoords);
            if (distance < minDistance) {
                return true;
            }
        }

        return false;
    };

    if (mapError) {
        return (
            <div className="map-container">
                <div className="map-header">
                    <Link to="/" className="back-button">
                        <img
                            src={vectorIcon}
                            alt="Back"
                            style={{ width: '24px', height: '24px', transform: 'rotate(90deg)' }}
                        />
                    </Link>
                    <h1 className="map-title">Карта</h1>
                </div>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '50vh',
                        color: 'red',
                    }}
                >
                    {mapError}
                </div>
            </div>
        );
    }

  return (
    <>
      {showError && (
        <ErrorToast
          message="В SkSpath произошёл сбой. Проверь подключение к сети и перезапусти приложение."
          onClose={() => setShowError(false)}
        />
      )}
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
        {selectedPlace && selectedPlace.spotId && (
          <SpotPlacemarkCard
            title={selectedPlace.title}
            address={selectedPlace.address}
            spotId={selectedPlace.spotId}
            description={selectedPlace.description}
            fileId={selectedPlace.fileId}
            onClose={handleCloseCard}
          />
        )}
        {selectedPlace && selectedPlace.roadId && (
          <PlacemarkCard
            title={selectedPlace.title}
            address={selectedPlace.address}
            roadId={selectedPlace.roadId}
            description={selectedPlace.description}
            fileId={selectedPlace.fileId}
            onClose={handleCloseCard}
          />
        )}
        {selectedPlace && !selectedPlace.spotId && !selectedPlace.roadId && (
          <PlacemarkCard
            title={selectedPlace.title}
            address={selectedPlace.address}
            description={selectedPlace.description}
            fileId={selectedPlace.fileId}
            onClose={handleCloseCard}
          />
        )}
        {showSpotForm && (
          <SpotCreationForm
            onSubmit={handleSpotFormSubmit}
            onCancel={handleSpotFormCancel}
          />
        )}
        {showRoadForm && (
          <RoadCreationForm
            onSubmit={handleRoadFormSubmit}
            onCancel={handleRoadFormCancel}
          />
        )}
      </div>
    </>
  )
}

export default MapPage;
