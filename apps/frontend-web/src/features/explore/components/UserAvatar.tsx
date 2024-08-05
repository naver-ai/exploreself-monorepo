import { Button, Dropdown, MenuProps } from 'antd';
import { useDispatch, useSelector } from '../../../redux/hooks';
import { useMemo } from 'react';
import { signOut } from '../../auth/reducer';
import { useTranslation } from 'react-i18next';

export const UserAvatar = (props: { buttonClassName?: string }) => {
  const userName = useSelector((state) => state.explore.name);

  const [t] = useTranslation()

  const dispatch = useDispatch();

  const menuData: MenuProps = useMemo(() => {
    return {
      items: [
        {
          key: 'logout',
          danger: true,
          label: t("SignOut.Title"),
        },
      ],
      onClick: (ev) => {
        switch (ev.key) {
          case 'logout':
            if(confirm(t("SignOut.Confirm"))){
              dispatch(signOut());
            }
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
