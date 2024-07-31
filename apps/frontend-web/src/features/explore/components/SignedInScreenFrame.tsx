import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { useDispatch, useSelector } from '../../../redux/hooks';
import { useEffect } from 'react';
import { fetchUserInfo } from '../reducer';
import { Spin } from 'antd';

export const SignedInScreenFrame = (props: { withHeader: boolean }) => {
  const dispatch = useDispatch();

  const isLoadingUserInfo = useSelector(
    (state) => state.explore.isLoadingUserInfo
  );

  useEffect(() => {
    dispatch(fetchUserInfo());
  }, []);

  return props.withHeader === true ? (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex-1 overflow-y-hidden relative">
        {isLoadingUserInfo == true ? (
          <div className="p-10">
            <Spin tip="Loading...">
              <div />
            </Spin>
          </div>
        ) : (
          <Outlet />
        )}
      </div>
    </div>
  ) : isLoadingUserInfo == true ? (
    <div className="p-10">
      <Spin tip="Loading...">
        <div />
      </Spin>
    </div>
  ) : (
    <Outlet />
  );
};
