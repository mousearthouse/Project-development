import React from 'react'
import { Link } from 'react-router-dom'
import './UnderConstructionPage.css'
import vectorIcon from '../../assets/vector.svg'

const UnderConstructionPage: React.FC = () => {
  return (
    <div className="under-construction-wrapper">
      <Link to="/" className="back-button">
        <img
          src={vectorIcon}
          alt="Back"
          style={{
            width: '24px',
            height: '24px',
            transform: 'rotate(90deg)',
            filter: 'invert(90%) sepia(0%) saturate(0%) brightness(150%) contrast(100%)',
          }}
        />
      </Link>

      <div className="content-wrapper">
        <div className="decorative-bar">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>

        <div className="content-inner">
          <div className="speech-bubble">
            <h1>Тут пустовато...</h1>
            <p>Эта функция пока что ещё в процессе разработки. Заходи сюда после будущих обновлений!</p>
          </div>

          <button className="project-link">Подробнее о проекте...</button>
        </div>
      </div>

      <div className="button-group">
        <button className="action-button">
          Хочу поддержать Sk8path
          <img src={vectorIcon} alt="icon" className="button-icon" />
        </button>

        <button className="action-button">
          Хочу на бета-тест
          <img src={vectorIcon} alt="icon" className="button-icon" />
        </button>
      </div>
    </div>
  )
}

export default UnderConstructionPage
