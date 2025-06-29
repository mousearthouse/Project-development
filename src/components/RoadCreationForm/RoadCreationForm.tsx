import React, { useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import './RoadCreationForm.css';
import { uploadFile } from '../../utils/api/requests/uploadFile';

interface RoadCreationFormProps {
    onSubmit: (data: RoadFormData) => void;
    onCancel: () => void;
}

export interface RoadFormData {
    name?: string;
    description?: string;
    fileId?: string;
    rating: number;
}

const RoadCreationForm: React.FC<RoadCreationFormProps> = ({ onSubmit, onCancel }) => {
    const [name, setName] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [fileId, setFileId] = useState<string>('');
    const [rating, setRating] = useState<number>(5);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState<boolean>(false);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        let uploadedFileId = fileId;

        // Upload file if selected
        if (selectedFile) {
            setIsUploading(true);
            try {
                const response = await uploadFile(selectedFile);
                uploadedFileId = response.data.id || response.data;
                console.log('File uploaded successfully, ID:', uploadedFileId);
            } catch (error) {
                console.error('Error uploading file:', error);
                setIsUploading(false);
                return;
            }
            setIsUploading(false);
        }

        const formData: RoadFormData = {
            rating,
            ...(name && { name }),
            ...(description && { description }),
            ...(uploadedFileId && { fileId: uploadedFileId }),
        };

        onSubmit(formData);
    };

    return (
        <div className="road-form-overlay" onClick={onCancel}>
            <div className="road-form-container" onClick={(e) => e.stopPropagation()}>
                <div className="road-form-header">
                    <h3>Создать дорогу</h3>
                    <button className="close-btn" onClick={onCancel}>
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="road-form">
                    <div className="form-group">
                        <label htmlFor="name">Название (необязательно)</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Введите название дороги"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Описание (необязательно)</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Введите описание дороги"
                            rows={3}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="file">Загрузить файл (необязательно)</label>
                        <input
                            type="file"
                            id="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="file-input"
                        />
                        {selectedFile && (
                            <div className="file-preview">Выбран файл: {selectedFile.name}</div>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="fileId">Или введите File ID (необязательно)</label>
                        <input
                            type="text"
                            id="fileId"
                            value={fileId}
                            onChange={(e) => setFileId(e.target.value)}
                            placeholder="Введите file ID"
                            disabled={!!selectedFile}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="rating">Рейтинг</label>
                        <select
                            id="rating"
                            value={rating}
                            onChange={(e) => setRating(Number(e.target.value))}
                        >
                            <option value={1}>1</option>
                            <option value={2}>2</option>
                            <option value={3}>3</option>
                            <option value={4}>4</option>
                            <option value={5}>5</option>
                        </select>
                    </div>

                    <div className="form-buttons">
                        <button type="button" onClick={onCancel} className="cancel-btn">
                            Отмена
                        </button>
                        <button type="submit" className="submit-btn" disabled={isUploading}>
                            {isUploading ? 'Загрузка...' : 'Создать дорогу'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RoadCreationForm;
