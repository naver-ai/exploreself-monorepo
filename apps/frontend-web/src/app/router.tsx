import { lazy, Suspense, useEffect} from 'react';

import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from 'react-router-dom';

import { useVerifyToken } from '../features/auth/hooks';
import { useVerifyAdminToken } from '../admin/features/auth/hooks';

const SignedInScreenFrame = lazy(()=> import('../features/user/components/SignedInScreenFrame'))
const AgendaRoute = lazy(() => import('../features/agenda/components/AgendaRoute'))

const ExplorerPage = lazy(() => import('../features/agenda/pages/ExplorePage'))
const SummaryPage = lazy(()=>import('../features/agenda/pages/SummaryPage'))

const InitialNarrativePage = lazy(()=>import('../features/user/pages/InitialNarrativePage'))
const LoginPage = lazy(()=>import('../features/auth/pages/LoginPage'))
const ProfilePage = lazy(()=>import('../features/user/pages/ProfilePage'))


const AdminSignedInRouteFrame = lazy(()=>import('../admin/components/AdminSignedInRouteFrame'))

const AdminLoginPage = lazy(()=>import('../admin/features/auth/pages/AdminLoginPage'))
const UserListPage = lazy(()=>import('../admin/features/users/pages/UserListPage'))
const UserDetailPage = lazy(()=>import('../admin/features/user/pages/UserDetailPage'))
const DataPage = lazy(()=>import('../admin/features/data/pages/DataPage'))
const AgendaListPage = lazy(()=>import('../features/user/pages/AgendaListPage'))

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
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route index element={<Navigate to={'app'} />} />
          <Route path="app">
            <Route path="login" element={<LoginPage />} />
            <Route element={<SignedInRoute />}>
              <Route index element={<Navigate to="agendas" />} />
              <Route element={<SignedInScreenFrame withHeader={false} />}>
                <Route path="profile" element={<ProfilePage />} />
              </Route>
              <Route path="agendas">
                <Route element={<SignedInScreenFrame withHeader={true} />}>
                  <Route index element={<AgendaListPage />} />
                  <Route path="new" element={<InitialNarrativePage />} />
                </Route>
                <Route path=":agendaId">
                  <Route element={<SignedInScreenFrame withHeader={false} />}>
                    <Route element={<AgendaRoute />}>
                      <Route index element={<ExplorerPage />} />
                    </Route>
                    <Route element={<AgendaRoute />}>
                      <Route path="summary" element={<SummaryPage />} />
                    </Route>
                  </Route>
                </Route>
              </Route>
            </Route>
          </Route>
          <Route path="admin">
            <Route path="login" element={<AdminLoginPage />} />
            <Route element={<AdminLoggedInRoute />}>
              <Route element={<AdminSignedInRouteFrame />}>
                <Route index element={<Navigate to={'users'} />} />
                <Route path="users">
                  <Route index element={<UserListPage />} />
                  <Route path=":id" element={<UserDetailPage />} />
                </Route>
                <Route path="data">
                  <Route index element={<DataPage />} />
                </Route>
              </Route>
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};
