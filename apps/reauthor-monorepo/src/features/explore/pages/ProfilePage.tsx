import { Input, Button, Form, Card, Tooltip } from "antd";
import { useCallback } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from "../../../redux/hooks";
import * as yup from 'yup'
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { FormItem } from "react-hook-form-antd";
import { submitUserProfile } from "../reducer";

const schema = yup.object({
  name: yup.string().trim().min(1).required()
})

export const ProfilePage = () => {

  const userId = useSelector(state => state.explore.userId)
  const userName = useSelector(state => state.explore.name)

  const { control, handleSubmit, formState: {isValid, errors} } = useForm({
    resolver: yupResolver(schema),
    reValidateMode: 'onChange'
  })
  
  const dispatch = useDispatch()

  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const submitProfile = useCallback(async (values: {name: string}) => {
    dispatch(submitUserProfile(values, () =>{
      navigate("/app")
    }))
  },[])

  return userId != null && userName != null && userName.length > 0 ? <Navigate to="/app"/> : (
    <div className="container-narrow !px-4 !sm:px-8">
        <Card title="Please complete your profile.">
            <Form onFinish={handleSubmit(submitProfile)}>
                <FormItem control={control} name="name" className="mb-4 h-auto" required label="Please provide the name you would like AI to call you:" 
                    labelCol={{ span: 24 }}>
                    <Input id="field-name" placeholder="Your nickname" autoFocus/>
                </FormItem>
                <Form.Item className="mb-0 flex justify-end">
                    <Button disabled={!isValid} htmlType="submit" type="primary">Apply</Button>
                </Form.Item>
            </Form>
        </Card>
    </div>
  )
}