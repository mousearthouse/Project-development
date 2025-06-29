import React, { useState } from 'react'
import type { FormEvent} from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './RegisterPage.css'
import vectorIcon from '../../assets/vector.svg'
import { userRegister } from '@/utils/api/requests/userRegister'

const isEmail = (value: string): boolean => /\S+@\S+\.\S+/.test(value)
const isPhone = (value: string): boolean => /^8\d{10}$/.test(value)
const isStrongPassword = (value: string): boolean => {
  return /[a-z]/.test(value) && /\d/.test(value)
}
const isValidUsername = (value: string): boolean =>
  /^[a-zA-Z0-9_.-]+$/.test(value)

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [agreeToTerms, setAgreeToTerms] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  const navigate = useNavigate()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setError('')

    if (!username.trim()) {
      setError('Введите имя пользователя')
      return
    }
    if (!isValidUsername(username)) {
      setError('Имя пользователя может содержать только латинские буквы, цифры и символы ".", "_", "-"')
      return
    }
    if (!isEmail(email) && !isPhone(email)) {
      setError('Введите корректную почту или номер телефона. Почта должна быть в формате user@example.com, телефон — 8XXXXXXXXXX')
      return
    }

    if (password.length < 6 || !isStrongPassword(password)) {
      setError('Пароль должен быть не менее 6 символов и содержать хотя бы одну маленькую латинскую букву и одну цифру')
      return
    }

    if (!agreeToTerms) {
      setError('Необходимо принять условия пользовательского соглашения')
      return
    }

    try {
      const payload = {
        username,
        email: isEmail(email) ? email : undefined,
        phoneNumber: isPhone(email) ? email : undefined,
        password,
      }
      const response = await userRegister({ params: payload, config: {} })
      console.log('Регистрация успешна:', response.data)
      localStorage.setItem('token', response.data.accessToken)
      localStorage.setItem('refresh_token', response.data.refreshToken)
      navigate('/')
    } catch (err: any) {
      console.error('Ошибка регистрации:', err)
      setError(err.response?.data?.message || 'Ошибка регистрации, попробуйте позже')
    }
  }

  return (
    <div className="register-container">
      <div className="register-content">
        <div className="register-header">
          <Link to="/login" className="back-button">
            <img src={vectorIcon} alt="Back" style={{ width: 24, height: 24, transform: 'rotate(90deg)' }} />
          </Link>
          <h1 className="register-title">Регистрация</h1>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="input-group">
            <input
              type="text"
              placeholder="Имя пользователя"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError('') }}
              className="register-input"
            />
          </div>

          <div className="input-group">
            <input
              type="text"
              placeholder="Почта или номер телефона"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError('') }}
              className="register-input"
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError('') }}
              className="register-input"
            />
          </div>

          <div className="terms-section">
            <label className="terms-checkbox">
              <input
                type="checkbox"
                checked={agreeToTerms}
                onChange={(e) => { setAgreeToTerms(e.target.checked); setError('') }}
              />
              <span className="checkmark"></span>
              <span className="terms-text">
                Я принимаю условия <a href="#" className="terms-link">пользовательского соглашения</a> и даю согласие на <a href="#" className="terms-link">обработку персональных данных</a>
              </span>
            </label>
          </div>

          {error && (
            <div className="error-message" style={{ color: ' #FF9500', marginBottom: 12 }}>
              {error}
            </div>
          )}

          <button type="submit" className="register-button">Зарегистрироваться</button>
        </form>
      </div>
    </div>
  )
}

export default RegisterPage
