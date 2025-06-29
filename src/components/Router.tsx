import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
    RouterProvider,
} from 'react-router-dom';

import { MainPage } from '@/pages/imports';

import { Layout } from '@/components/Layout';

import { ROUTES } from '@/utils/routes';

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route element={<Layout />}>
            <Route path={ROUTES.MAINPAGE} element={<MainPage />} />
        </Route>,
    ),
);

export const Router = () => <RouterProvider router={router} />;
