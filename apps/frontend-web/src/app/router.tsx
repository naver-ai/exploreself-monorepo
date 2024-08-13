import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from 'react-router-dom';
import { ExplorerPage } from '../features/explore/pages/ExplorePage';
import { InitialNarrativePage } from '../features/explore/pages/InitialNarrativePage';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { useVerifyToken } from '../features/auth/hooks';
import { useEffect } from 'react';
import { SignedInScreenFrame } from '../features/explore/components/SignedInScreenFrame';
import { ProfilePage } from '../features/explore/pages/ProfilePage';
import { SynthesisPage } from '../features/explore/pages/SynthesisPage';
import { useVerifyAdminToken } from '../admin/features/auth/hooks';
import { AdminLoginPage } from '../admin/features/auth/pages/AdminLoginPage';
import { UserListPage } from '../admin/features/users/pages/UserListPage';
import UserDetailPage from '../admin/features/user/pages/UserDetailPage';
import { AdminSignedInRouteFrame } from '../admin/components/AdminSignedInRouteFrame';

const AdminLoggedInRoute = () => {
  const { verify, isSignedIn } = useVerifyAdminToken();

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
    return <Navigate to="/admin/login" />;
  }
};

const SignedInRoute = () => {
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
    <BrowserRouter basename="/">
      <Routes>
        <Route index element={<Navigate to={'app'} />} />
        <Route path="app">
          <Route path="login" element={<LoginPage />} />
          <Route element={<SignedInRoute />}>
            <Route element={<SignedInScreenFrame withHeader={false} />}>
              <Route index element={<ExplorerPage />} />
            </Route>
            <Route element={<SignedInScreenFrame withHeader={true} />}>
              <Route path="narrative" element={<InitialNarrativePage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="synthesis" element={<SynthesisPage/>}/>
            </Route>
          </Route>
        </Route>
        <Route path="admin">
          <Route path="login" element={<AdminLoginPage/>}/>
          <Route element={<AdminLoggedInRoute/>}>
            <Route element={<AdminSignedInRouteFrame/>}>
              <Route index element={<Navigate to={'users'} />} />
                <Route path="users">
                  <Route index element={<UserListPage/>} />
                  <Route path=":id" element={<UserDetailPage/>}>
                </Route>
              </Route>
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
