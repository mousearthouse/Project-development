import React, { useState, useEffect } from 'react'
import type { MouseEvent } from 'react'
import './PlacemarkCard.css'
import { rateSpot } from "@/utils/api/requests/spots/rateSpot"
import { getSpots } from '../../utils/api/requests/spots/getSpots'
import { getFileUrl } from '../../utils/api/requests/getFile'
import filledFlagIcon from '../../assets/filled-flag-24.png'
import { deleteRoad } from '../../utils/api/requests/deleteRoad'
import { deleteSpot } from '../../utils/api/requests/deleteSpot'

interface PlacemarkCardProps {
    title: string;
    address: string;
    spotId?: string;
    roadId?: string;
    description?: string;
    fileId?: string;
    onClose?: () => void;
}

const PlacemarkCard: React.FC<PlacemarkCardProps> = ({ title, address, spotId, roadId, description, fileId, onClose }) => {
  const [rating, setRating] = useState<number>(0)
  const [currentRating, setCurrentRating] = useState<number>(0)
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isExpanded, setIsExpanded] = useState<boolean>(true)
  const [spotFileId, setSpotFileId] = useState<string | null>(fileId || null)

    useEffect(() => {
        setTimeout(() => setIsVisible(true), 10);

        if (spotId) {
            fetchCurrentRating();
        }
    }, [spotId]);

    const fetchCurrentRating = async () => {
        try {
            const response = await getSpots();
            const spot = response.data.find((s) => s.id === spotId);
            if (spot) {
                setCurrentRating(spot.rating);
                if (spot.fileId) {
                    setSpotFileId(spot.fileId);
                }
            }
        } catch (error) {
            console.error('Error fetching spot rating:', error);
        }
    };

    const handleStarClick = async (starIndex: number): Promise<void> => {
        const newRating = starIndex + 1;
        setRating(newRating);

        if (spotId) {
            setIsSubmitting(true);
            try {
                await rateSpot({
                    objectId: spotId,
                    rating: newRating,
                });
                console.log('Rating submitted successfully');
            } catch (error) {
                console.error('Error submitting rating:', error);
                setRating(0);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleWriteReview = (e: MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        console.log('Написать отзыв для:', title);
    };

    const handleCardClick = () => {
        setIsExpanded(!isExpanded);
    };

    const handleContentClick = (e: MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
    };

    const handleHeaderClick = () => {
        setIsExpanded(!isExpanded);
    };

  const handleFlagClick = async () => {
    if (roadId) {
      try {
        await deleteRoad(roadId)
        console.log('Жалоба отправлена')
        if (onClose) {
          onClose()
        }
      } catch (error) {
        console.error('Error deleting road:', error)
      }
    } else if (spotId) {
      try {
        await deleteSpot(spotId)
        console.log('Жалоба отправлена')
        if (onClose) {
          onClose()
        }
      } catch (error) {
        console.error('Error deleting spot:', error)
      }
    } else {
      console.log('Flag clicked - no ID available')
    }
  }

  return (
    <div 
      className={`placemark-card ${isVisible ? 'visible' : ''} ${isExpanded ? 'expanded' : ''}`}
    >
      <div className="card-header" onClick={handleHeaderClick}>
        <div className="place-image">
          {spotFileId ? (
            <img 
              src={getFileUrl(spotFileId)} 
              alt={title}
              className="spot-image"
              onError={(e) => {
                console.error('Error loading image');
                setSpotFileId(null);
              }}
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
        {onClose && (
          <button className="close-button" onClick={(e) => { e.stopPropagation(); onClose(); }}>
          </button>
        )}
      </div>
      
      <div className="card-content">
        <div className="card-handle" onClick={handleCardClick}></div>
        <h3 className="place-title">{title}</h3>
        <p className="place-address">{address}</p>
        
        {spotId && (
          <div className="current-rating">
            <span>Текущий рейтинг: {currentRating}/5</span>
          </div>
        )}

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

export default PlacemarkCard;
