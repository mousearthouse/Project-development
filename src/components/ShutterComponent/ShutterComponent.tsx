import React, { useState, useEffect } from 'react';
import type { MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import './ShutterComponent.css';
import vectorIcon from '../../assets/vector.svg';
import { getUserProfile } from '@/utils/api/requests/getUserProfile';
import { getFileUrl } from '@/utils/api/requests/getFile';

interface UserProfile {
    id: string;
    username?: string;
    email?: string;
    phoneNumber?: string;
    fileId?: string;
}

const ShutterComponent: React.FC = () => {
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    const isAuthenticated = !!localStorage.getItem('token');

    useEffect(() => {
        if (isAuthenticated) {
            const fetchProfile = async () => {
                try {
                    const response = await getUserProfile();
                    setUserProfile(response.data);
                } catch (err) {
                    console.log('Ошибка при получении профиля');
                }
            };

            fetchProfile();
        }
    }, [isAuthenticated]);

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
                                    {isAuthenticated && userProfile?.fileId ? (
                                        <img
                                            src={getFileUrl(userProfile.fileId)}
                                            alt="Аватар пользователя"
                                            className="avatar-image"
                                        />
                                    ) : (
                                        <div className="avatar-circle">
                                            <svg width="40" height="40" viewBox="0 0 24 24" fill="#007AFF">
                                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <div className="profile-name">
                                    {isAuthenticated ? (userProfile?.username || 'Пользователь') : 'incognito1234'}
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
