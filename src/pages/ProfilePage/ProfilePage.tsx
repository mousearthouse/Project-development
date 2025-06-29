import React, { useEffect, useState } from 'react'
import './ProfilePage.css'
import { Link } from 'react-router-dom'
import vectorIcon from '../../assets/vector.svg'
import routesIcon from '../../assets/routs.svg'
import spotsIcon from '../../assets/spot_without_dot.svg'
import favoritesIcon from '../../assets/favorites.svg'
import editIcon from '../../assets/edit.svg'
import { getUserProfile } from '@/utils/api/requests/getUserProfile'
import { useNavigate } from 'react-router-dom';
import { getFileUrl } from '@/utils/api/requests/getFile';

interface UserProfile {
  id: string;
  username?: string;
  email?: string;
  phoneNumber?: string;
    fileId?: string;
}

const ProfilePage: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const navigate = useNavigate();

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
  }, [])

  const goToEditProfile = () => {
    navigate('/profile/edit');
  };

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  }
  return (
    <div className="profile-wrapper">
      <Link to="/" className="back-button">
      <img src={vectorIcon} alt="Back" style={{ width: '24px', height: '24px', transform: 'rotate(90deg)' }} />
      </Link>
    <div className="profile-header">
    <div className="photo-placeholder">
    {userProfile?.fileId ? (
      <img
        src={getFileUrl(userProfile.fileId)}
        alt="Аватар пользователя"
        className="profile-avatar"
        style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }}
      />
    ) : (
      <div className="user-icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="#007AFF">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      </div>
    )}
  </div>
  <div className="profile-username">
    {loading ? 'Загрузка...' : userProfile?.username || 'Username'}

    {userProfile && (
      <div className="profile-info">
        {userProfile.email && <div className="profile-email">{userProfile.email}</div>}
        {userProfile.phoneNumber && <div className="profile-phone">{userProfile.phoneNumber}</div>}
      </div>
    )}
  </div>

  </div>

  <div className="profile-buttons">
    <div className="profile-button-wrapper">
      <button className="profile-button orangey">
        <img src={routesIcon} alt="Маршруты" className="profile-button-icon" />
      </button>
      <div className="profile-button-label">Маршруты</div>
    </div>
    <div className="profile-button-wrapper">
      <button className="profile-button">
        <img src={favoritesIcon} alt="Избранное" className="profile-button-icon" />
      </button>
      <div className="profile-button-label">Избранное</div>
    </div>
    <div className="profile-button-wrapper">
      <button className="profile-button orangey">
        <img src={spotsIcon} alt="Споты" className="profile-button-icon" />
      </button>
      <div className="profile-button-label">Споты</div>
    </div>
    <div className="profile-button-wrapper"  onClick={goToEditProfile}>
      <button className="profile-button">
        <img src={editIcon} alt="Редактировать" className="profile-button-icon" style={{ width: '30px', height: '30px', transform: 'rotate(90deg)'}}/>
      </button>
      <div className="profile-button-label">
        <span>Изменить</span><br/><span>профиль</span>
      </div>
    </div>

    <div className="profile-button-wrapper">
      <button className="profile-button orangey" onClick={logout}>
        <img src={spotsIcon} alt="Выйти" className="profile-button-icon" />
      </button>
      <div className="profile-button-label">Выйти</div>
    </div>

  </div>

  <div className="bottom-highlight"></div>
    </div>
  )
}

export default ProfilePage;
