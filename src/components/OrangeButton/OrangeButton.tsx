import React, { useState } from 'react';
import type { MouseEvent } from 'react';
import './OrangeButton.css';
import badRoadIcon from '../../assets/bad_road.svg';
import stairsIcon from '../../assets/stares.svg';
import dotIcon from '../../assets/dot.svg';

export const PointType = {
    BAD_ROAD: 'bad_road',
    STAIRS: 'stairs',
    NORMAL: 'normal',
} as const;

export type PointType = (typeof PointType)[keyof typeof PointType];

interface OrangeButtonProps {
    onClick?: (pointType: PointType) => void;
}

const OrangeButton: React.FC<OrangeButtonProps> = ({ onClick }) => {
    const [currentPointType, setCurrentPointType] = useState<PointType>(PointType.NORMAL);

    const pointTypes = [
        { type: PointType.BAD_ROAD, icon: badRoadIcon, name: 'Плохая дорога' },
        { type: PointType.STAIRS, icon: stairsIcon, name: 'Лестница' },
        { type: PointType.NORMAL, icon: dotIcon, name: 'Обычная точка' },
    ];

    const getCurrentPoint = () => {
        return pointTypes.find((p) => p.type === currentPointType) || pointTypes[0];
    };

    const handleClick = (e: MouseEvent<HTMLButtonElement>): void => {
        e.preventDefault();

        const currentIndex = pointTypes.findIndex((p) => p.type === currentPointType);
        const nextIndex = (currentIndex + 1) % pointTypes.length;
        const nextPointType = pointTypes[nextIndex].type;

        setCurrentPointType(nextPointType);

        if (onClick) {
            onClick(nextPointType);
        }
    };

    const currentPoint = getCurrentPoint();

    return (
        <button className={`orange-button point-type-${currentPoint.type}`} onClick={handleClick}>
            <img src={currentPoint.icon} alt={currentPoint.name} className="point-icon" />
        </button>
    );
};

export default OrangeButton;
