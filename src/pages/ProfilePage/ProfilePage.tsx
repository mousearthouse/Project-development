import React from 'react'
import './ProfilePage.css'
import { Link } from 'react-router-dom'
import vectorIcon from '../../assets/vector.svg'
import routesIcon from '../../assets/routs.svg'
import spotsIcon from '../../assets/spot_without_dot.svg'
import favoritesIcon from '../../assets/favorites.svg'

const ProfilePage: React.FC = () => {
  return (
    <div className="profile-wrapper">
           <Link to="/" className="back-button">
            <img src={vectorIcon} alt="Back" style={{ width: '24px', height: '24px', transform: 'rotate(90deg)' }} />
          </Link>
      <div className="profile-header">
          <div className="photo-placeholder">
            <div className="user-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="#007AFF">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
          </div>
        <div className="profile-username">Username</div>
      </div>

<div className="profile-buttons">
  <div className="profile-button-wrapper">
    <button className="profile-button orangey">
      <img src={routesIcon} alt="Маршруты" className="profile-button-icon" />
    </button>
    <div className="profile-button-label">Маршруты</div>
  </div>

  <div className="profile-button-wrapper">
    <button className="profile-button orangey">
      <img src={spotsIcon} alt="Споты" className="profile-button-icon" />
    </button>
    <div className="profile-button-label">Споты</div>
  </div>

  <div className="profile-button-wrapper">
    <button className="profile-button">
      <img src={favoritesIcon} alt="Избранное" className="profile-button-icon" />
    </button>
    <div className="profile-button-label">Избранное</div>
  </div>
</div>


    </div>
  )
}

export default ProfilePage
