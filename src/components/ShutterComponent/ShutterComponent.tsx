import React, { useState } from 'react';
import type { MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import './ShutterComponent.css';
import vectorIcon from '../../assets/vector.svg';

const ShutterComponent: React.FC = () => {
    const [isExpanded, setIsExpanded] = useState<boolean>(false);

    const isAuthenticated = !!localStorage.getItem('token');

    const handleToggleSheet = (): void => {
        setIsExpanded(!isExpanded);
    };

    const handleOverlayClick = (): void => {
        if (isExpanded) {
            setIsExpanded(false);
        }
    };

    const handleSheetClick = (e: MouseEvent<HTMLDivElement>): void => {
        e.stopPropagation();
    };

    return (
        <>
            {!isExpanded && (
                <div className="collapsed-tab" onClick={handleToggleSheet}>
                    <div className="tab-handle"></div>
                    <div className="tab-content">
                        <span className="tab-title">
                            {isAuthenticated ? 'Профиль' : 'Гостевой режим'}
                        </span>
                    </div>
                </div>
            )}

            {isExpanded && (
                <div className="bottom-sheet-overlay" onClick={handleOverlayClick}>
                    <div className="bottom-sheet expanded" onClick={handleSheetClick}>
                        <div className="sheet-handle" onClick={handleToggleSheet}></div>

                        <div className="sheet-header">
                            <Link to="/" className="back-button">
                                <img
                                    src={vectorIcon}
                                    alt="Back"
                                    style={{
                                        width: '24px',
                                        height: '24px',
                                        transform: 'rotate(90deg)',
                                    }}
                                />
                            </Link>
                            <span className="sheet-title">
                                {isAuthenticated ? 'Профиль' : 'Гостевой режим'}
                            </span>
                        </div>

                        <div className="sheet-content">
                            <div className="profile-section">
                                <div className="avatar-container">
                                    <div className="avatar-circle">
                                        <span className="avatar-text">
                                            {isAuthenticated ? 'US' : 'CC'}
                                        </span>
                                    </div>
                                </div>
                                <div className="profile-name">
                                    {isAuthenticated ? 'Пользователь' : 'incognito1234'}
                                </div>
                            </div>

                            <div className="action-buttons">
                                {isAuthenticated ? (
                                    <Link to="/profile" className="create-account-btn">
                                        Профиль
                                    </Link>
                                ) : (
                                    <>
                                        <Link to="/register" className="create-account-btn">
                                            Создать аккаунт
                                        </Link>
                                        <Link to="/login" className="login-btn">
                                            Войти
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ShutterComponent;
