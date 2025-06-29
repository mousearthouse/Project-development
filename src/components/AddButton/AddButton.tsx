import React, { useState } from 'react';
import type { MouseEvent } from 'react';
import './AddButton.css';

interface AddButtonProps {
    onAddSpot?: () => void;
    onAddPath?: () => void;
    onExitMode?: () => void;
    isSpotMode?: boolean;
    isPathMode?: boolean;
}

const AddButton: React.FC<AddButtonProps> = ({
    onAddSpot,
    onAddPath,
    onExitMode,
    isSpotMode,
    isPathMode,
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

    const isInAnyMode = isSpotMode || isPathMode;

    const handleClick = (e: MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();
        if (isInAnyMode) {
            // If in any mode, exit the mode
            if (onExitMode) {
                onExitMode();
            }
        } else {
            // If not in any mode, show menu
            setIsMenuOpen(!isMenuOpen);
        }
    };

    const handleSpotClick = (): void => {
        if (onAddSpot) {
            onAddSpot();
        }
        setIsMenuOpen(false);
    };

    const handlePathClick = (): void => {
        if (onAddPath) {
            onAddPath();
        }
        setIsMenuOpen(false);
    };

    return (
        <>
            {isMenuOpen && <div className="menu-overlay" onClick={() => setIsMenuOpen(false)} />}

            <div className="add-button-container">
                {isMenuOpen && !isInAnyMode && (
                    <div className="add-menu">
                        <button className="menu-item" onClick={handleSpotClick}>
                            <span className="menu-icon">📍</span>
                            <span>Спот</span>
                        </button>
                        <button className="menu-item" onClick={handlePathClick}>
                            <span className="menu-icon">🛤️</span>
                            <span>Путь</span>
                        </button>
                    </div>
                )}

                <div className="button-group">
                    <button
                        className={`add-button ${isMenuOpen ? 'active' : ''} ${isInAnyMode ? 'exit-mode' : ''}`}
                        onClick={handleClick}
                    >
                        {isInAnyMode ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path
                                    d="M18 6L6 18M6 6L18 18"
                                    stroke="white"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                />
                            </svg>
                        ) : (
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                className={isMenuOpen ? 'rotated' : ''}
                            >
                                <path
                                    d="M12 5V19M5 12H19"
                                    stroke="white"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        )}
                    </button>
                </div>
            </div>
        </>
    );
};

export default AddButton;
