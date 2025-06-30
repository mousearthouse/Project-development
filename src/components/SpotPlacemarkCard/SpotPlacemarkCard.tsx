import React, { useState, useEffect } from 'react'
import type { MouseEvent } from 'react'
import './SpotPlacemarkCard.css'
import { rateSpot } from "@/utils/api/requests/spots/rateSpot"
import { getSpots } from '../../utils/api/requests/spots/getSpots'
import { getFileUrl } from '../../utils/api/requests/getFile'
import filledFlagIcon from '../../assets/filled-flag-24.png'
import favoritesIcon from '../../assets/favorites.svg'
import { deleteSpot } from '../../utils/api/requests/deleteSpot'
import { addToFavorites } from '../../utils/api/requests/addToFavorites'
import { removeFromFavorites } from '../../utils/api/requests/removeFromFavorites'
import { getFavoriteSpots } from '../../utils/api/requests/getFavoriteSpots'
import { getSpotRating } from '../../utils/api/requests/getSpotRating'
import ErrorToast from '../ErrorToast/ErrorToast'

interface SpotPlacemarkCardProps {
  title: string;
  address: string;
  spotId: string;
  description?: string;
  fileId?: string;
  onClose?: () => void;
}

const SpotPlacemarkCard: React.FC<SpotPlacemarkCardProps> = ({ title, address, spotId, description, fileId, onClose }) => {
  const [rating, setRating] = useState<number>(0)
  const [currentRating, setCurrentRating] = useState<number>(0)
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isExpanded, setIsExpanded] = useState<boolean>(true)
  const [spotFileId, setSpotFileId] = useState<string | null>(fileId || null)
  const [showError, setShowError] = useState<boolean>(false)
  const [isFavorite, setIsFavorite] = useState<boolean>(false)

  const isAuthenticated = !!localStorage.getItem('token')

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 10)
    if (isAuthenticated) {
      fetchCurrentRating()
      checkIfFavorite()
    } else {
      fetchBasicSpotInfo()
    }
  }, [spotId])

  const fetchBasicSpotInfo = async () => {
    try {
      const spotsResponse = await getSpots()
      const spot = spotsResponse.data.find(s => s.id === spotId)
      if (spot) {
        setCurrentRating(spot.rating)
        setRating(spot.rating)
        if (spot.fileId) {
          setSpotFileId(spot.fileId)
        }
      }
    } catch (error) {
      console.error('Error fetching basic spot info:', error)
      setShowError(true)
    }
  }

  const fetchCurrentRating = async () => {
    try {
      const response = await getSpotRating(spotId)
      console.log('Spot rating response:', response.data)
      
      if (response.data && response.data.rating !== undefined) {
        const ratingValue = response.data.rating
        console.log('Setting rating to:', ratingValue)
        setCurrentRating(ratingValue)
        setRating(ratingValue)
      } else {
        console.log('No rating data received')
      }
      
      const spotsResponse = await getSpots()
      const spot = spotsResponse.data.find(s => s.id === spotId)
      if (spot && spot.fileId) {
        setSpotFileId(spot.fileId)
      }
    } catch (error) {
      console.error('Error fetching spot rating:', error)
      setShowError(true)
    }
  }

  const checkIfFavorite = async () => {
    try {
      const response = await getFavoriteSpots()
      const favoriteSpots = response.data
      setIsFavorite(favoriteSpots.some(spot => spot.id === spotId))
    } catch (error) {
      console.error('Error checking favorite status:', error)
    }
  }

  const handleStarClick = async (starIndex: number): Promise<void> => {
    if (!isAuthenticated) {
      console.log('User not authenticated, cannot rate')
      return
    }

    const newRating = starIndex + 1
    setRating(newRating)
    
    setIsSubmitting(true)
    try {
      await rateSpot({
        objectId: spotId,
        rating: newRating
      })
      console.log('Rating submitted successfully')
      setCurrentRating(newRating)
    } catch (error) {
      console.error('Error submitting rating:', error)
      setRating(0)
      setShowError(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleWriteReview = (e: MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault()
    console.log('Написать отзыв для:', title)
  }

  const handleCardClick = () => {
    setIsExpanded(!isExpanded)
  }

  const handleHeaderClick = () => {
    setIsExpanded(!isExpanded)
  }

  const handleFlagClick = async () => {
    try {
      await deleteSpot(spotId)
      console.log('Жалоба отправлена')
      if (onClose) {
        onClose()
      }
    } catch (error) {
      console.error('Error deleting spot:', error)
      setShowError(true)
    }
  }

  const handleFavoriteClick = async () => {
    try {
      if (isFavorite) {
        await removeFromFavorites(spotId)
        console.log('Убрано из избранного')
      } else {
        await addToFavorites(spotId)
        console.log('Добавлено в избранное')
      }
      setIsFavorite(!isFavorite)
    } catch (error) {
      console.error('Error updating favorites:', error)
      setShowError(true)
    }
  }

  const handleImageError = () => {
    console.error('Error loading image for spot:', spotId);
    setSpotFileId(null);
    setShowError(true);
  }

  return (
    <>
      {showError && (
        <ErrorToast
          message="В SkSpath произошёл сбой. Проверь подключение к сети и перезапусти приложение."
          onClose={() => setShowError(false)}
        />
      )}
      <div 
        className={`spot-placemark-card ${isVisible ? 'visible' : ''} ${isExpanded ? 'expanded' : ''}`}
      >
        <div className="card-header" onClick={handleHeaderClick}>
          <div className="place-image">
            {spotFileId ? (
              <img 
                src={getFileUrl(spotFileId)} 
                alt={title}
                className="spot-image"
                onError={handleImageError}
              />
            ) : (
              <div className="image-placeholder"></div>
            )}
          </div>
          <div className="header-buttons">
            <button className="flag-button" onClick={(e) => { e.stopPropagation(); handleFlagClick(); }}>
              <img src={filledFlagIcon} alt="Flag" className="flag-icon" />
            </button>
          </div>
          {isAuthenticated && (
            <button className="favorite-button" onClick={(e) => { e.stopPropagation(); handleFavoriteClick(); }}>
              <img 
                src={favoritesIcon} 
                alt="Favorites" 
                className={`favorite-icon ${isFavorite ? 'active' : ''}`} 
              />
            </button>
          )}
          {onClose && (
            <button className="close-button" onClick={(e) => { e.stopPropagation(); onClose(); }}>
            </button>
          )}
        </div>
        
        <div className="card-content">
          <div className="card-handle" onClick={handleCardClick}></div>
          <h3 className="place-title">{title}</h3>
          <p className="place-address">{address}</p>
          
          <div className="current-rating">
            <span>Текущий рейтинг: {currentRating}/5</span>
          </div>

          {isExpanded && description && (
            <div className="description-section">
              <h4>Описание</h4>
              <p className="place-description">{description}</p>
            </div>
          )}
          
          <div className="rating-section">
            <div className="stars">
              {[...Array(5)].map((_, index) => (
                <button
                  key={index}
                  className={`star ${index < rating ? 'filled' : ''} ${isSubmitting ? 'disabled' : ''} ${!isAuthenticated ? 'disabled' : ''}`}
                  onClick={() => handleStarClick(index)}
                  disabled={isSubmitting || !isAuthenticated}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path 
                      d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
                      fill={index < rating ? "#FFD700" : "#E5E5EA"}
                    />
                  </svg>
                </button>
              ))}
            </div>
            
            {isSubmitting && <div className="rating-status">Отправка оценки...</div>}
            {!isAuthenticated && <div className="rating-status">Войдите, чтобы оценить спот</div>}
            
            {isAuthenticated && (
              <button className="write-review-button" onClick={handleWriteReview}>
                Написать отзыв
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default SpotPlacemarkCard
