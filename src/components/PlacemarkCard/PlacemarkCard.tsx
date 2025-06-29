import React, { useState, useEffect } from 'react'
import type { MouseEvent } from 'react'
import './PlacemarkCard.css'
import { rateSpot } from '../../utils/api/requests/rateSpot'
import { getSpots } from '../../utils/api/requests/getSpots'

interface PlacemarkCardProps {
  title: string;
  address: string;
  spotId?: string;
  onClose?: () => void;
}

const PlacemarkCard: React.FC<PlacemarkCardProps> = ({ title, address, spotId, onClose }) => {
  const [rating, setRating] = useState<number>(0)
  const [currentRating, setCurrentRating] = useState<number>(0)
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 10)
    
    if (spotId) {
      fetchCurrentRating()
    }
  }, [spotId])

  const fetchCurrentRating = async () => {
    try {
      const response = await getSpots()
      const spot = response.data.find(s => s.id === spotId)
      if (spot) {
        setCurrentRating(spot.rating)
      }
    } catch (error) {
      console.error('Error fetching spot rating:', error)
    }
  }

  const handleStarClick = async (starIndex: number): Promise<void> => {
    const newRating = starIndex + 1
    setRating(newRating)
    
    if (spotId) {
      setIsSubmitting(true)
      try {
        await rateSpot({
          objectId: spotId,
          rating: newRating
        })
        console.log('Rating submitted successfully')
      } catch (error) {
        console.error('Error submitting rating:', error)
        setRating(0)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleWriteReview = (e: MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault()
    console.log('Написать отзыв для:', title)
  }

  return (
    <div className={`placemark-card ${isVisible ? 'visible' : ''}`}>
      <div className="card-header">
        <div className="place-image">
          <div className="image-placeholder"></div>
        </div>
        {onClose && (
          <button className="close-button" onClick={onClose}>
          </button>
        )}
      </div>
      
      <div className="card-content">
        <h3 className="place-title">{title}</h3>
        <p className="place-address">{address}</p>
        
        {spotId && (
          <div className="current-rating">
            <span>Текущий рейтинг: {currentRating}/5</span>
          </div>
        )}
        
        <div className="rating-section">
          <div className="stars">
            {[...Array(5)].map((_, index) => (
              <button
                key={index}
                className={`star ${index < rating ? 'filled' : ''} ${isSubmitting ? 'disabled' : ''}`}
                onClick={() => handleStarClick(index)}
                disabled={isSubmitting}
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
          
          <button className="write-review-button" onClick={handleWriteReview}>
            Написать отзыв
          </button>
        </div>
      </div>
    </div>
  )
}



export default PlacemarkCard
