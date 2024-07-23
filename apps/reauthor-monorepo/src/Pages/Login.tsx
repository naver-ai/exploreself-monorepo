import React from 'react';
import type { FormProps, RadioChangeEvent } from 'antd';
import { Button, Checkbox, Form, Input, Radio } from 'antd';
import loginHandle from '../APICall/loginHandle';
import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { loginUser } from '../Redux/reducers/userSlice';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../Redux/store';


type FieldType = {
  username?: string;
  ucode?: string;
};

const Login = () => {

  // const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [name, setName] = useState<string>('')
  const [ucode, setUcode] = useState<string>('')
  const [isKorean, setIsKorean] = useState<boolean>(true)
  const navigate = useNavigate();
  const dispatch = useDispatch()

  const handleName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
  }
  const handleUcode = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUcode(e.target.value)
  }

  const onSubmit = async () => {
    if (name && ucode) {
      try {
        const user = await loginHandle(name, ucode, isKorean)
        dispatch(loginUser(user?.user._id))
        console.log("USER: ", user)
        // const newuid = useSelector((state: IRootState) => state.userInfo.uid)
        // console.log("NEW: ", newuid)
        navigate('/narrative')
      } catch (err) {
        console.log("err in login: ", err)
      }
    }
    // TODO: Handle exception
  }

  const LanguageChange = (e: RadioChangeEvent) => {
    setIsKorean(e.target.value);
  };

  return(
    <Form
    name="basic"
    labelCol={{ span: 8 }}
    wrapperCol={{ span: 16 }}
    style={{ maxWidth: 600 }}
  >
    <Form.Item<FieldType>
      label="Username"
      name="username"
      rules={[{ required: true, message: 'Please input your username!' }]}
    >
      <Input  onChange={handleName}/>
    </Form.Item>

    <Form.Item<FieldType>
      label="User code"
      name="ucode"
      rules={[{ required: true, message: 'Please input your given code!' }]}
    >

      <Input onChange={handleUcode}/>
    </Form.Item>
    <Radio.Group onChange={LanguageChange} value={isKorean}>
      <Radio value={true}>Korean</Radio>
      <Radio value={false}>English</Radio>
    </Radio.Group>

    <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
      <Button type="primary" htmlType="submit" onClick={onSubmit}>
        Submit
      </Button>
    </Form.Item>
  </Form>
  )  
};

export default Login;