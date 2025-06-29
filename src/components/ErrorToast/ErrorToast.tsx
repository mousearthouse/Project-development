import React, { useEffect } from 'react'
import './ErrorToast.css'

interface ErrorToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

const ErrorToast: React.FC<ErrorToastProps> = ({ message, onClose, duration = 5000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [onClose, duration])

  return (
    <div className="error-toast">
      <div className="error-content">
        <div className="error-icon">
          <span>⚠️</span>
        </div>
        <div className="error-text">
          <h4>Ой!</h4>
          <p>{message}</p>
        </div>
        <button className="error-close" onClick={onClose}>
          ×
        </button>
      </div>
    </div>
  )
}

export default ErrorToast
