import { Input, Button, Form, Card, Tooltip } from 'antd';
import { useCallback } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from '../../../redux/hooks';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormItem } from 'react-hook-form-antd';
import { updateUserProfile } from '../../user/reducer';

const schema = yup.object({
  name: yup.string().trim().min(1).required(),
});

export const ProfilePage = () => {
  const userId = useSelector((state) => state.user.userId);
  const userName = useSelector((state) => state.user.name);

  const {
    control,
    handleSubmit,
    formState: { isValid, errors },
  } = useForm({
    resolver: yupResolver(schema),
    reValidateMode: 'onChange',
  });

  const dispatch = useDispatch();

  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const submitProfile = useCallback(async (values: { name: string }) => {
    dispatch(
      updateUserProfile(values, () => {
        navigate(-1);
      })
    );
  }, []);

  return userId != null && userName != null && userName.length > 0 ? (
    <Navigate to="/app" />
  ) : (
    <div className="h-full overflow-y-scroll">
      <div className="container-narrow !px-4 !sm:px-8 py-8">
        <Card title={t("Profile.Title")}>
          <Form onFinish={handleSubmit(submitProfile)}>
            <FormItem
              control={control}
              name="name"
              className="mb-4 h-auto"
              required
              label={t("Profile.Name.Prompt")}
              labelCol={{ span: 24 }}
            >
              <Input id="field-name" placeholder={t("Profile.Name.Placeholder")} autoFocus />
            </FormItem>
            <Form.Item className="mb-0 flex justify-end">
              <Button disabled={!isValid} htmlType="submit" type="primary">
                {t("Labels.Apply")}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};


export default ProfilePage