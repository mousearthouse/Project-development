import { getUserProfile } from '@/utils/api/requests/getUserProfile';
import { postUserLogin } from '@/utils/api/requests/loginUser';
import React, { useEffect } from 'react';

const MainPage = () => {
    useEffect(() => {
        const loginAndFetchProfile = async() => {
            try{
                const response = await postUserLogin({
                    params: { username: "testuser", password: "string123" },
                    config: {},
                })
                console.log(response);
                
                localStorage.setItem('token', response.data.accessToken);
                localStorage.setItem('refresh_token', response.data.refreshToken);

                try {
                    const profileResponse = await getUserProfile();
                    console.log(profileResponse.data);
                } catch (err) {
                    console.log('Ошибка при получении профиля');
                }
            }
            catch (error) {
                console.error(error)
            }
        }

        loginAndFetchProfile();
    }, [])
    
    return (
        <main>
            <div>
                <h1>Main Page</h1>
                <p>Welcome to the main page!</p>
            </div>
        </main>
    );
}

export default MainPage;