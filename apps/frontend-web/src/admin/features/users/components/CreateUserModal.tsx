import {Button, Form, Input, Modal, Space} from 'antd'
import { useDispatch, useSelector } from '../../../../redux/hooks';
import { useForm } from 'react-hook-form'
import { FormItem } from 'react-hook-form-antd'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useCallback, useMemo } from 'react';
import { createUser } from '../reducer';
import { ButtonProps } from 'antd';


const creationSchema = yup.object().shape({
  alias: yup.string().required().trim().min(1).matches(/[a-zA-Z0-9\-_]+/, {message: "Alias should consist of alphanumeric letters, hyphens, and underscores."}),
  passcode: yup.string().required().trim().min(5),
})

const CreateUserModal = (props:{
  open: boolean,
  onClose: () => void;
}) => {
  const {control, handleSubmit, reset, setError, formState: {errors}} = useForm({resolver: yupResolver(creationSchema)})
  const dispatch = useDispatch()
  const clearAndClose = useCallback(()=>{
    reset()
    props.onClose()
  }, [props.onClose])

  const submitUserInfo = useCallback((values: any) => {
    dispatch(createUser(values, (user) => {
      clearAndClose()
    }))
  },[clearAndClose])

  const isCreating = useSelector(state => state.admin.users.isCreatingUser)

  const okButtonProps: ButtonProps = useMemo(()=>{
    return {"htmlType": "submit", form: "new-user-form", disabled: isCreating}
}, [isCreating])

const cancelButtonProps: ButtonProps | undefined = useMemo(() => {
    return isCreating === true ? {hidden: true} : undefined
}, [isCreating])

  return <Modal okButtonProps={okButtonProps} cancelButtonProps={cancelButtonProps} okText={isCreating === true ? "Creating..." : "Create"} maskClosable={false}
  title="Create User" open={props.open} onCancel={clearAndClose} destroyOnClose={true} onClose={clearAndClose}>
<Form labelCol={{span: 5}} preserve={false} onFinish={handleSubmit(submitUserInfo)} id="new-user-form">
  <FormItem control={control} name="alias" label="Alias">
      <Input placeholder="User's alias (Only shown to researcher)"/>
  </FormItem>

  <FormItem control={control} name="passcode" label="Passcode">
      <Input placeholder="유저의 패스코드를 입력하세요"/>
  </FormItem>

  {
      errors.root != null ? <div className='text-red-400'>{errors.root.message}</div> : null
  }
</Form>
</Modal>
}

export default CreateUserModal;