import { Button, Dropdown, MenuProps } from 'antd';
import { useDispatch, useSelector } from '../../../redux/hooks';
import { useMemo } from 'react';
import { signOut } from '../../auth/reducer';

export const UserAvatar = (props: { buttonClassName?: string }) => {
  const userName = useSelector((state) => state.explore.name);

  const dispatch = useDispatch();

  const menuData: MenuProps = useMemo(() => {
    return {
      items: [
        {
          key: 'logout',
          danger: true,
          label: '로그아웃',
        },
      ],
      onClick: (ev) => {
        switch (ev.key) {
          case 'logout':
            dispatch(signOut());
            break;
        }
      },
    };
  }, []);

  return (
    <Dropdown menu={menuData}>
      <Button className={`${props.buttonClassName}`} type="dashed">
        {userName}
      </Button>
    </Dropdown>
  );
};
