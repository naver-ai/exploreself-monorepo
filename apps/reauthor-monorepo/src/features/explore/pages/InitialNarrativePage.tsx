import { Input, Button, Form } from "antd";
import { useCallback } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from "../../../Redux/hooks";
import * as yup from 'yup'
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { FormItem } from "react-hook-form-antd";
import { submitInitialNarrative } from "../reducer";

const schema = yup.object({
  narrative: yup.string().trim().min(10).required()
})

const {TextArea} = Input;

export const InitialNarrativePage = () => {

  const userId = useSelector(state => state.explore.userId)
  const initial_narrative = useSelector(state => state.explore.initial_narrative)

  const { control, handleSubmit, formState: {isValid} } = useForm({
    resolver: yupResolver(schema),
    reValidateMode: 'onChange'
  })
  
  const dispatch = useDispatch()

  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const submitNarrative = useCallback(async (values: {narrative: string}) => {
    dispatch(submitInitialNarrative(values.narrative, () =>{
      navigate("/app")
    }))
  },[])

  console.log(userId, initial_narrative)
 
  return userId != null && initial_narrative != null && initial_narrative.length > 0 ? <Navigate to="/app"/> : (
    <div>
      Enter initial narrative: 
      <br/>
      <br/>
      <Form onFinish={handleSubmit(submitNarrative)}>
          <FormItem control={control} name="narrative">
            <TextArea rows={4}/>
          </FormItem>
          <Button disabled={!isValid} htmlType="submit">Submit</Button>
      </Form>
      
    </div>
  )
}