import { Button, Dropdown, MenuProps } from 'antd';
import { useDispatch, useSelector } from '../../../redux/hooks';
import { useMemo } from 'react';
import { signOut } from '../../auth/reducer';
import { useTranslation } from 'react-i18next';
import { dangerousReset } from '../../agenda/reducer';

export const UserAvatar = (props: { buttonClassName?: string, disabled?: boolean}) => {
  const userName = useSelector((state) => state.user.name);

  const [t] = useTranslation()

  const dispatch = useDispatch();

  const menuData: MenuProps = useMemo(() => {
    return {
      items: [
        // {
        //   key: 'reset',
        //   danger: true,
        //   label: t("Reset.Title")
        // },
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
          case 'reset':
            if(confirm(t("Reset.Confirm"))){
              dispatch(dangerousReset())
            }
            break;
        }
      },
    };
  }, []);

  return (
    <Dropdown menu={menuData} disabled={props.disabled}>
      <Button disabled={props.disabled} className={`${props.buttonClassName}`} type="dashed">
        {userName}
      </Button>
    </Dropdown>
  );
};
