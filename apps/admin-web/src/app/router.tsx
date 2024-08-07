import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from 'react-router-dom';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { useVerifyToken } from '../features/auth/hooks';
import { useEffect } from 'react';
import { Main } from '../features/manage/pages/Main';

const LoggedInRoute = () => {
  const { verify, isSignedIn } = useVerifyToken();

  useEffect(() => {
    verify().then((isSignedIn) => {
      if (!isSignedIn) {
        console.log('Should redirect to login');
      }
    });
  }, [verify]);

  if (isSignedIn) {
    return <Outlet />;
  } else if (isSignedIn == null) {
    return <div>Verifying user...</div>;
  } else {
    return <Navigate to="/app/login" />;
  }
};

export const MainRouter = () => {
  return (
    <BrowserRouter basename="/admin">
      <Routes>
      <Route path="login" element={<LoginPage/>}/>
        <Route index element={<Navigate to={'manage'} />} />
        <Route path="manage">
          <Route element={<LoggedInRoute/>}>
            <Route index element={<Main/>} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
