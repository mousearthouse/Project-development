import { getUserProfile } from '@/utils/api/requests/getUserProfile';
import { postUserLogin } from '@/utils/api/requests/loginUser';
import React, { useEffect } from 'react';

const MainPage = () => {
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await getUserProfile();
                console.log(response.data);
            } catch (err) {
                console.log('Ошибка при получении профиля');
            }
        };

        fetchProfile();
    }, []);

    return (
        <main>
            <div>
                <h1>Main Page</h1>
                <p>Welcome to the main page!</p>
            </div>
        </main>
    );
};

export default MainPage;
