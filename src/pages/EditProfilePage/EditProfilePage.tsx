import React, { useState, useEffect } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import './EditProfilePage.css';
import vectorIcon from '../../assets/vector.svg';
import { getUserProfile } from '@/utils/api/requests/getUserProfile';
import { updateUserProfile } from '@/utils/api/requests/updateUserProfile';
import { getFileUrl } from '@/utils/api/requests/getFile';
import { uploadFile } from '@/utils/api/requests/uploadFile';

const isEmail = (value: string): boolean => /\S+@\S+\.\S+/.test(value);
const isPhone = (value: string): boolean => /^8\d{10}$/.test(value);
const isValidUsername = (value: string): boolean => /^[a-zA-Z0-9_.-]+$/.test(value);

const EditProfilePage: React.FC = () => {
    const [username, setUsername] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [avatarFileId, setAvatarFileId] = useState<string | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState<boolean>(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await getUserProfile();
                const data = response.data;

                setUsername(data.username || '');
                setEmail(data.email || data.phoneNumber || '');
                if (data.fileId) {
                    setAvatarFileId(data.fileId);
                    setAvatarPreview(getFileUrl(data.fileId));
                }
            } catch (err) {
                console.error('Ошибка при загрузке профиля:', err);
                setError('Ошибка при загрузке профиля');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        setUploading(true);
        try {
            const response = await uploadFile(file);
            const newFileId = response.data;
            setAvatarFileId(newFileId);
            setAvatarPreview(URL.createObjectURL(file));
            setError('');
        } catch (err) {
            console.error('Ошибка загрузки файла:', err);
            setError('Ошибка загрузки файла');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');

        if (!username.trim()) {
            setError('Введите имя пользователя');
            return;
        }

        if (!isEmail(email) && !isPhone(email)) {
            setError(
                'Введите корректную почту или номер телефона. Формат почты: testuser@example.com. Формат телефона: 89999999999',
            );
            return;
        }

        if (!isValidUsername(username)) {
            setError(
                'Имя пользователя может содержать только латинские буквы, цифры и символы ".", "_", "-"',
            );
            return;
        }
        const payload = {
            username,
            email: isEmail(email) ? email : undefined,
            phoneNumber: isPhone(email) ? email : undefined,
            avatarId: avatarFileId || undefined,
        };

        try {
            const response = await updateUserProfile(payload);
            console.log('Профиль обновлён:', response.data);
        } catch (error) {
            console.error('Ошибка при обновлении профиля:', error);
            setError('Не удалось сохранить профиль');
        }
    };

    const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>): void => {
        setUsername(e.target.value);
        setError('');
    };

    const handleEmailChange = (e: ChangeEvent<HTMLInputElement>): void => {
        setEmail(e.target.value);
        setError('');
    };

    return (
        <div className="edit-profile-container">
            <div className="edit-profile-content">
                <div className="edit-profile-header">
                    <Link to="/profile" className="back-button">
                        <img
                            src={vectorIcon}
                            alt="Back"
                            style={{ width: 24, height: 24, transform: 'rotate(90deg)' }}
                        />
                    </Link>
                    <h1 className="edit-profile-title">Изменить профиль</h1>
                </div>

                <div className="photo-section">
                    <div className="photo-placeholder">
                        {avatarPreview ? (
                            <img
                                src={avatarPreview}
                                alt="Аватар"
                                style={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                }}
                            />
                        ) : (
                            <div className="user-icon">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="#007AFF">
                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                </svg>
                            </div>
                        )}
                    </div>
                    <label className="upload-photo-btn" htmlFor="avatarUpload">
                        {uploading ? 'Загрузка...' : 'Загрузить фото'}
                    </label>
                    <input
                        type="file"
                        id="avatarUpload"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                    />
                </div>

                {loading ? (
                    <div>Загрузка...</div>
                ) : (
                    <form onSubmit={handleSubmit} className="edit-profile-form">
                        <div className="input-group">
                            <label htmlFor="username" className="edit-profile-label">
                                Имя пользователя
                            </label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={handleUsernameChange}
                                className="edit-profile-input"
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="emailOrPhone" className="edit-profile-label">
                                Почта или номер телефона
                            </label>
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

                        <button type="submit" className="edit-profile-button">
                            Сохранить
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default EditProfilePage;
