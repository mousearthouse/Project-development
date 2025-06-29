import React, { useState, useEffect } from 'react'
import type { FormEvent, ChangeEvent } from 'react'
import { Link } from 'react-router-dom'
import './EditProfilePage.css'
import vectorIcon from '../../assets/vector.svg'
import { getUserProfile } from '@/utils/api/requests/getUserProfile'
import { updateUserProfile } from '@/utils/api/requests/updateUserProfile'

const isEmail = (value: string): boolean => /\S+@\S+\.\S+/.test(value)
const isPhone = (value: string): boolean => /^8\d{10}$/.test(value);

const EditProfilePage: React.FC = () => {
  const [username, setUsername] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getUserProfile()
        const data = response.data

        setUsername(data.username || '')
        setEmail(data.email || data.proneNumber || '')
      } catch (err) {
        console.error('Ошибка при загрузке профиля:', err)
        setError('Ошибка при загрузке профиля')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    if (!username.trim()) {
      setError('Введите имя пользователя')
      return
    }

    if (!isEmail(email) && !isPhone(email)) {
     setError('Введите корректную почту или номер телефона. Формат почты: testuser@example.com. Формат телефона: 89999999999')
      return
    }

    const payload = {
      username,
      email: isEmail(email) ? email : undefined,
      phoneNumber: isPhone(email) ? email : undefined,
    }

    try {
      const response = await updateUserProfile(payload)
      console.log('Профиль обновлён:', response.data)

    } catch (error) {
      console.error('Ошибка при обновлении профиля:', error)
      setError('Не удалось сохранить профиль')
    }
  }

  const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setUsername(e.target.value)
    setError('')
  }

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setEmail(e.target.value)
    setError('')
  }

  return (
    <div className="edit-profile-container">
      <div className="edit-profile-content">
        <div className="edit-profile-header">
          <Link to="/profile" className="back-button">
            <img src={vectorIcon} alt="Back" style={{ width: 24, height: 24, transform: 'rotate(90deg)' }} />
          </Link>
          <h1 className="edit-profile-title">Изменить профиль</h1>
        </div>

        <div className="photo-section">
          <div className="photo-placeholder">
            <div className="user-icon"></div>
          </div>
          <button className="upload-photo-btn">Загрузить фото</button>
        </div>

        {loading ? (
          <div>Загрузка...</div>
        ) : (
          <form onSubmit={handleSubmit} className="edit-profile-form">
            <div className="input-group">
              <label htmlFor="username" className="edit-profile-label">Имя пользователя</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={handleUsernameChange}
                className="edit-profile-input"
              />
            </div>

            <div className="input-group">
              <label htmlFor="emailOrPhone" className="edit-profile-label">Почта или номер телефона</label>
              <input
                id="emailOrPhone"
                type="text"
                value={email}
                onChange={handleEmailChange}
                className="edit-profile-input"
              />
            </div>

            {error && (


                        <div className="forgot-password">
            <a href="#" className="forgot-link">
             {error}
            </a>
          </div>
            )}

            <button type="submit" className="edit-profile-button">Сохранить</button>
          </form>
        )}
      </div>
    </div>
  )
}

export default EditProfilePage
