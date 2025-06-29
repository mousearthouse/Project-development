import React, { useEffect, useState } from 'react'
import type { FormEvent, ChangeEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './LoginPage.css'
import vectorIcon from '../../assets/vector.svg'
import { postUserLogin } from '@/utils/api/requests/loginUser'

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<boolean>(false);

  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    loginUser();
  }

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setEmail(e.target.value)
    setLoginError(false);
  }

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setPassword(e.target.value)
    setLoginError(false);
  }

  const loginUser = async () => {
  try {
    const response = await postUserLogin({
      params: { username: email, password: password },
      config: {},
    });

    localStorage.setItem('token', response.data.accessToken);
    localStorage.setItem('refresh_token', response.data.refreshToken);
    navigate("/");
  } catch (error: any) {
    console.error('Login error:', error);
    if (error.response?.data?.message) {
      console.error('API message:', error.response.data.message);
    }

    setLoginError(true);
  }
};


  return (
    <div className="login-container">
      <div className="login-content">
        <div className="login-header">
          <Link to="/" className="back-button">
            <img src={vectorIcon} alt="Back" style={{ width: '24px', height: '24px', transform: 'rotate(90deg)' }} />
          </Link>
          <h1 className="login-title">Авторизация</h1>
        </div>

        <div className="welcome-section">
          <h2 className="welcome-text">С возвращением! :D</h2>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <input
              type="text"
              placeholder="Имя пользователя"
              value={email}
              onChange={handleEmailChange}
              className="login-input"
            />
          </div>

          <div className="input-group password-group">
            <input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={handlePasswordChange}
              className="login-input"
            />
          </div>

          {loginError && (
          <div className="forgot-password">
            <a href="#" className="forgot-link">
              Неверное имя пользователя или пароль
            </a>
          </div>
          )}

          <button type="submit" className="login-button">
            Войти
          </button>

          <div className="signup-section">
            <Link to="/register" className="signup-link">
              Создать аккаунт
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
