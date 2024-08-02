import { useCallback } from 'react';
import { Button, Card, Form, Input } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useDispatch } from '../../../redux/hooks';
import { FormItem } from 'react-hook-form-antd';
import { loginWithPasscode } from '../reducer';
import { useTranslation } from 'react-i18next';

const schema = yup
  .object({
    passcode: yup.string().trim().min(5).required(),
  })
  .required();

export const LoginPage = () => {
  const { control, handleSubmit } = useForm<{ passcode: string }>({
    resolver: yupResolver(schema),
  });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const signIn: SubmitHandler<{ passcode: string }> = useCallback(
    (values: { passcode: string }) => {
      dispatch(
        loginWithPasscode(values.passcode, () => {
          navigate('/app');
        })
      );
    },
    []
  );

  const [t] = useTranslation()

  return (
    <div className="container mx-auto justify-center items-center flex h-[100vh] overflow-auto">
      <Card
        rootClassName="justify-center min-w-[30%]"
        title={<span>{t("SignIn.Title")}</span>}
        bordered={false}
      >
        <Form onFinish={handleSubmit(signIn)} className="w-full flex gap-2">
          <FormItem
            control={control}
            name="passcode"
            rootClassName="m-0 flex-1"
          >
            <Input.Password placeholder={t("SignIn.Passcode.Prompt")} autoFocus/>
          </FormItem>
          <Button rootClassName="self-stretch" htmlType="submit" type="primary">
            {t("SignIn.Enter")}
          </Button>
        </Form>
      </Card>
    </div>
  );
};
