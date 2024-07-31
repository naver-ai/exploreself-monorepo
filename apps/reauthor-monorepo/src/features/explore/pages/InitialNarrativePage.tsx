import { Input, Button, Form } from "antd";
import { useCallback } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from "../../../redux/hooks";
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

  return userId != null && initial_narrative != null && initial_narrative.length > 0 ? <Navigate to="/app"/> : (
    <div className="h-full overflow-y-scroll">
    <div className="container-narrow !px-4 !sm:px-8 py-8">
      <p className="mb-4 px-2 font-light">Each and everyone has their own challenges. Could be things such as conflict with an old friend, being obsessed in diet, etc. Do you have any story of yours that you would like to understand better? Please write down below!</p>
      <Form onFinish={handleSubmit(submitNarrative)}>
          <FormItem control={control} name="narrative" className="mb-4">
            <TextArea rows={4} placeholder="Describe your challenges."/>
          </FormItem>
          <div className="flex justify-end">
            <Button disabled={!isValid} htmlType="submit" type="primary">Submit</Button>
          </div>
      </Form>
      
    </div>
    </div>
  )
}