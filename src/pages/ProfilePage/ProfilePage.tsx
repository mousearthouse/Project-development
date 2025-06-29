import React, { useEffect, useState } from 'react';
import './ProfilePage.css';
import { Link } from 'react-router-dom';
import vectorIcon from '../../assets/vector.svg';
import routesIcon from '../../assets/routs.svg';
import spotsIcon from '../../assets/spot_without_dot.svg';
import favoritesIcon from '../../assets/favorites.svg';
import editIcon from '../../assets/edit.svg';
import { getUserProfile } from '@/utils/api/requests/getUserProfile';
import { useNavigate } from 'react-router-dom';
import { getFileUrl } from '@/utils/api/requests/getFile';
import { getMySpots } from '@/utils/api/requests/spots/getMySpot';
import { rateSpot } from '@/utils/api/requests/spots/rateSpot';
import { getMyRoads, type MyRoad } from '@/utils/api/requests/getMyRoads';
import { getFavoriteSpots } from '@/utils/api/requests/getFavoriteSpots';
import { getSpots, type Spot } from '@/utils/api/requests/spots/getSpots';
import { removeFromFavorites } from '@/utils/api/requests/removeFromFavorites';


interface UserProfile {
    id: string;
    username?: string;
    email?: string;
    phoneNumber?: string;
    fileId?: string;
}


const ProfilePage: React.FC = () => {
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();
    const [spots, setSpots] = useState<Spot[]>([]);
    const [showSpots, setShowSpots] = useState<boolean>(false);
    const [roads, setRoads] = useState<MyRoad[]>([]);
    const [showRoads, setShowRoads] = useState<boolean>(false);
    const [favoriteSpots, setFavoriteSpots] = useState<Spot[]>([]);
    const [showFavorites, setShowFavorites] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [rating, setRating] = useState<number>(0);
    const [ratingMap, setRatingMap] = useState<{ [spotId: string]: number }>({});
    const [expandedSpots, setExpandedSpots] = useState<{ [spotId: string]: boolean }>({});
    const [expandedRoads, setExpandedRoads] = useState<{ [roadId: string]: boolean }>({});

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await getUserProfile();
                console.log(response.data);
                setUserProfile(response.data);
            } catch (err) {
                console.log('Ошибка при получении профиля');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
        loadFavorites(); 
    }, []);
    const loadSpots = async () => {
      try {
        const response = await getMySpots();
        setSpots(response.data);
        setShowSpots(true);
        setShowRoads(false); 
        setShowFavorites(false); 
      } catch (err) {
        console.error('Ошибка загрузки спотов:', err);
      }
    };

    const loadRoads = async () => {
      try {
        const response = await getMyRoads();
        setRoads(response.data);
        setShowRoads(true);
        setShowSpots(false); 
        setShowFavorites(false);
      } catch (err) {
        console.error('Ошибка загрузки дорог:', err);
      }
    };

    const loadFavorites = async () => {
      try {
        const favoriteResponse = await getFavoriteSpots();
        const favoriteSpotsList = favoriteResponse.data;
        
        setFavoriteSpots(favoriteSpotsList);
        setShowFavorites(true);
        setShowSpots(false); 
        setShowRoads(false); 
      } catch (err) {
        console.error('Ошибка загрузки избранного:', err);
      }
    };

    const handleStarClick = async (spotId: string, starIndex: number): Promise<void> => {
  const newRating = starIndex + 1;

  setRatingMap((prev) => ({
    ...prev,
    [spotId]: newRating,
  }));

  setIsSubmitting(true);
  try {
    await rateSpot({
      objectId: spotId,
      rating: newRating,
    });
    console.log('Рейтинг отправлен');
  } catch (error) {
    console.error('Ошибка при отправке рейтинга:', error);
    setRatingMap((prev) => ({
      ...prev,
      [spotId]: 0,
    }));
  } finally {
    setIsSubmitting(false);
  }
};
const toggleExpand = (spotId: string) => {
  setExpandedSpots(prev => ({
    ...prev,
    [spotId]: !prev[spotId],
  }));
};
const toggleExpandRoad = (roadId: string) => {
  setExpandedRoads(prev => ({
    ...prev,
    [roadId]: !prev[roadId],
  }));
};

    const goToEditProfile = () => {
        navigate('/profile/edit');
    };

    const logout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const handleRemoveFromFavorites = async (spotId: string) => {
      try {
        await removeFromFavorites(spotId);
        console.log('Убрано из избранного');
        
        setFavoriteSpots(prevFavorites => 
          prevFavorites.filter(spot => spot.id !== spotId)
        );
      } catch (error) {
        console.error('Ошибка при удалении из избранного:', error);
      }
    };

    return (
        <div className="profile-wrapper">
            <Link to="/" className="back-button">
                <img
                    src={vectorIcon}
                    alt="Back"
                    style={{ width: '24px', height: '24px', transform: 'rotate(90deg)' }}
                />
            </Link>
            <div className="profile-header">
                <div className="photo-placeholder">
                    {userProfile?.fileId ? (
                        <img
                            src={getFileUrl(userProfile.fileId)}
                            alt="Аватар пользователя"
                            className="profile-avatar"
                            style={{
                                width: 80,
                                height: 80,
                                borderRadius: '50%',
                                objectFit: 'cover',
                            }}
                        />
                    ) : (
                        <div className="user-icon">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="#007AFF">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                            </svg>
                        </div>
                    )}
                </div>
                <div className="profile-username">
                    {loading ? 'Загрузка...' : userProfile?.username || 'Username'}

                    {userProfile && (
                        <div className="profile-info">
                            {userProfile.email && (
                                <div className="profile-email">{userProfile.email}</div>
                            )}
                            {userProfile.phoneNumber && (
                                <div className="profile-phone">{userProfile.phoneNumber}</div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="profile-buttons">
                <div className="profile-button-wrapper">
                    <button className="profile-button orangey" onClick={loadRoads}>
                        <img src={routesIcon} alt="Маршруты" className="profile-button-icon" />
                    </button>
                    <div className="profile-button-label">Маршруты</div>
                </div>
                <div className="profile-button-wrapper">
                    <button className="profile-button" onClick={loadFavorites}>
                        <img src={favoritesIcon} alt="Избранное" className="profile-button-icon" />
                    </button>
                    <div className="profile-button-label">Избранное</div>
                </div>
                <div className="profile-button-wrapper">
                    <button className="profile-button orangey" onClick={loadSpots}>
                        <img src={spotsIcon} alt="Споты" className="profile-button-icon" />
                    </button>
                    <div className="profile-button-label">Споты</div>
                </div>
                <div className="profile-button-wrapper" onClick={goToEditProfile}>
                    <button className="profile-button">
                        <img
                            src={editIcon}
                            alt="Редактировать"
                            className="profile-button-icon"
                            style={{ width: '30px', height: '30px', transform: 'rotate(90deg)' }}
                        />
                    </button>
                    <div className="profile-button-label">
                        <span>Изменить</span>
                        <br />
                        <span>профиль</span>
                    </div>
                </div>

                <div className="profile-button-wrapper">
                    <button className="profile-button orangey" onClick={logout}>
                        <img src={spotsIcon} alt="Выйти" className="profile-button-icon" />
                    </button>
                    <div className="profile-button-label">Выйти</div>
                </div>
            </div>

            <div className="bottom-highlight">
                {showSpots && (
                  <div className="spot-list">
                    {spots.map((spot) => (
                      <div key={spot.id} className="spot-card">
                        <div className="spot-image-wrapper" style={{ position: 'relative' }}>
                          {spot.fileId ? (
                            <>
                              <img
                                src={getFileUrl(spot.fileId)}
                                alt={spot.name}
                                className="spot-image"
                              />
                              <img
                                src={favoritesIcon}
                                alt="Избранное"
                                className="favorite-icon"
                              />
                            </>
                          ) : (
                            <>
                              <img
                                src={favoritesIcon}
                                alt="Избранное"
                                className="favorite-icon no-photo-favorite"
                              />
                            </>
                          )}
                        </div>
        
                        <div className="spot-info">
                          <h3 className="spot-name">{spot.name}</h3>
                          <p className="spot-coordinates">Координаты: {spot.latitude}, {spot.longitude}</p>
                          <p className="spot-rating">Рейтинг: {spot.rating}</p>
                          <p className="spot-description">
                            {spot.description
                              ? expandedSpots[spot.id]
                                ? spot.description
                                : `${spot.description.slice(0, 10)}${spot.description.length > 100 ? '...' : ''}`
                              : 'Описание отсутствует'}
                            {spot.description && spot.description.length > 100 && (
                              <button className="read-more" onClick={() => toggleExpand(spot.id)}>
                                {expandedSpots[spot.id] ? 'Свернуть' : 'Читать больше'}
                              </button>
                            )}
                          </p>

                          <div className="rating-label">Оцените этот спот:</div>
                          <div className="stars">
                            {[...Array(5)].map((_, index) => {
                              const currentRating = ratingMap[spot.id] ?? spot.rating;
                              return (
                                <button
                                  key={index}
                                  className={`star ${index < currentRating ? 'filled' : ''} ${isSubmitting ? 'disabled' : ''}`}
                                  onClick={() => handleStarClick(spot.id, index)}
                                  disabled={isSubmitting}
                                >
                                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                                    <path
                                      d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                                      fill={index < currentRating ? '#FFD700' : '#E5E5EA'}
                                    />
                                  </svg>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {showFavorites && (
                  <div className="spot-list">
                    {favoriteSpots.length > 0 ? (
                      favoriteSpots.map((spot) => (
                        <div key={spot.id} className="spot-card">
                          <div className="spot-image-wrapper" style={{ position: 'relative' }}>
                            {spot.fileId ? (
                              <>
                                <img
                                  src={getFileUrl(spot.fileId)}
                                  alt={spot.name}
                                  className="spot-image"
                                />
                                <img
                                  src={favoritesIcon}
                                  alt="Избранное"
                                  className="favorite-icon clickable"
                                  onClick={() => handleRemoveFromFavorites(spot.id)}
                                />
                              </>
                            ) : (
                              <>
                                <img
                                  src={favoritesIcon}
                                  alt="Избранное"
                                  className="favorite-icon no-photo-favorite clickable"
                                  onClick={() => handleRemoveFromFavorites(spot.id)}
                                />
                              </>
                            )}
                          </div>
          
                          <div className="spot-info">
                            <h3 className="spot-name">{spot.name}</h3>
                            <p className="spot-coordinates">Координаты: {spot.latitude}, {spot.longitude}</p>
                            <p className="spot-rating">Рейтинг: {spot.rating}</p>
                            <p className="spot-description">
                              {spot.description
                                ? expandedSpots[spot.id]
                                  ? spot.description
                                  : `${spot.description.slice(0, 100)}${spot.description.length > 100 ? '...' : ''}`
                                : 'Описание отсутствует'}
                              {spot.description && spot.description.length > 100 && (
                                <button className="read-more" onClick={() => toggleExpand(spot.id)}>
                                  {expandedSpots[spot.id] ? 'Свернуть' : 'Читать больше'}
                                </button>
                              )}
                            </p>

                            <div className="rating-label">Оцените этот спот:</div>
                            <div className="stars">
                              {[...Array(5)].map((_, index) => {
                                const currentRating = ratingMap[spot.id] ?? spot.rating;
                                return (
                                  <button
                                    key={index}
                                    className={`star ${index < currentRating ? 'filled' : ''} ${isSubmitting ? 'disabled' : ''}`}
                                    onClick={() => handleStarClick(spot.id, index)}
                                    disabled={isSubmitting}
                                  >
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                                      <path
                                        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                                        fill={index < currentRating ? '#FFD700' : '#E5E5EA'}
                                      />
                                    </svg>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="empty-state">
                        <p>У вас пока нет избранных спотов</p>
                      </div>
                    )}
                  </div>
                )}

                {showRoads && (
                  <div className="road-list">
                    {roads.map((road) => (
                      <div key={road.id} className="road-card">
                        <div className="road-image-wrapper" style={{ position: 'relative' }}>
                          {road.fileId ? (
                            <>
                              <img
                                src={getFileUrl(road.fileId)}
                                alt={road.name || 'Дорога'}
                                className="road-image"
                              />
                              <img
                                src={favoritesIcon}
                                alt="Избранное"
                                className="favorite-icon"
                              />
                            </>
                          ) : (
                            <>
                              <img
                                src={favoritesIcon}
                                alt="Избранное"
                                className="favorite-icon no-photo-favorite"
                              />
                            </>
                          )}
                        </div>
                        
                        <div className="road-info">
                          <h3 className="road-name">{road.name || 'Дорога без названия'}</h3>
                          <p className="road-points">Точек: {road.points.length}</p>
                          <p className="road-rating">Рейтинг: {road.rating}</p>
                          <p className="road-description">
                            {road.description
                              ? expandedRoads[road.id]
                                ? road.description
                                : `${road.description.slice(0, 100)}${road.description.length > 100 ? '...' : ''}`
                              : 'Описание отсутствует'}
                            {road.description && road.description.length > 100 && (
                              <button className="read-more" onClick={() => toggleExpandRoad(road.id)}>
                                {expandedRoads[road.id] ? 'Свернуть' : 'Читать больше'}
                              </button>
                            )}
                          </p>

                          <div className="road-points-details">
                            <h4>Точки маршрута:</h4>
                            {road.points.slice(0, 3).map((point, index) => (
                              <p key={point.id} className="point-coordinates">
                                {index + 1}. {point.latitude.toFixed(6)}, {point.longitude.toFixed(6)} ({point.type})
                              </p>
                            ))}
                            {road.points.length > 3 && (
                              <p className="more-points">и еще {road.points.length - 3} точек...</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;
