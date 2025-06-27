import React, { useState } from 'react'
import type { FormEvent, ChangeEvent } from 'react'
import { Link } from 'react-router-dom'
import './RegisterPage.css'
import vectorIcon from '../../assets/vector.svg'

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [agreeToTerms, setAgreeToTerms] = useState<boolean>(false)

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    console.log('Registration attempt:', { username, email, password, agreeToTerms })
  }

  const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setUsername(e.target.value)
  }

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setEmail(e.target.value)
  }

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setPassword(e.target.value)
  }

  const handleTermsChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setAgreeToTerms(e.target.checked)
  }

  return (
    <div className="register-container">
      <div className="register-content">
        <div className="register-header">
          <Link to="/login" className="back-button">
            <img src={vectorIcon} alt="Back" style={{ width: '24px', height: '24px', transform: 'rotate(90deg)' }} />
          </Link>
          <h1 className="register-title">
            Авторизация
          </h1>
        </div>

        <div className="photo-section">
          <div className="photo-placeholder">
            <div className="user-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="#007AFF">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
          </div>
          <button className="upload-photo-btn">
            Загрузить фото
          </button>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="input-group">
            <input
              type="text"
              placeholder="Имя пользователя"
              value={username}
              onChange={handleUsernameChange}
              className="register-input"
            />
          </div>

          <div className="input-group">
            <input
              type="email"
              placeholder="Почта или номер телефона"
              value={email}
              onChange={handleEmailChange}
              className="register-input"
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={handlePasswordChange}
              className="register-input"
            />
          </div>

          <div className="terms-section">
            <label className="terms-checkbox">
              <input
                type="checkbox"
                checked={agreeToTerms}
                onChange={handleTermsChange}
              />
              <span className="checkmark"></span>
              <span className="terms-text">
                Я принимаю условия <a href="#" className="terms-link">пользовательского соглашения</a> и даю свое согласие на <a href="#" className="terms-link">обработку персональных данных</a> на условиях, определенных <a href="#" className="terms-link">Политикой конфиденциальности</a>
              </span>
            </label>
          </div>

          <button type="submit" className="register-button">
            Зарегистрироваться
          </button>
        </form>
      </div>
    </div>
  )
}

export default RegisterPage
