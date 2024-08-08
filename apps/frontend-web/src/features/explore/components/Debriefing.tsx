import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "../../../redux/hooks";
import * as yup from 'yup';
import { useCallback } from "react";
import { yupResolver } from "@hookform/resolvers/yup";

import { abortReviewStage, terminateSession } from "../reducer";
import { Form, Input, Button } from "antd";
import { FormItem } from 'react-hook-form-antd';
const {TextArea} = Input
import { useTranslation } from 'react-i18next';
import { SessionStatus } from "@core";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { ArrowLeftIcon } from "@heroicons/react/20/solid";


const schema = yup.object({
  debriefing: yup.string().trim().notRequired(),
});

const Debriefing = () => {
  const debriefing = useSelector(state => state.explore.debriefing)
  const sessionStatus = useSelector(state => state.explore.sessionStatus)
  const dispatch = useDispatch();

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm({
    resolver: yupResolver(schema),
    reValidateMode: 'onChange',
  });
  const [t] = useTranslation()

  const handleSubmitDebriefing = useCallback(async (values: any) => {
    dispatch(terminateSession(values.debriefing));
  }, []);

  const onReturnClick = useCallback(() => {
    dispatch(abortReviewStage())
  }, [])

  console.log(sessionStatus)

  return (<div>{sessionStatus == SessionStatus.Reviewing ? <Form onFinish={handleSubmit(handleSubmitDebriefing)}>
  <FormItem control={control} name="debriefing">
    <TextArea
      defaultValue={debriefing}
      autoFocus
      autoSize={{ minRows: 5, maxRows: 10 }}
      placeholder="이번 탐색을 통해 자신과 상황에 대해 어떤 것을 배우거나 새로 깨닫게 되었나요? 무엇이든 생각 나는대로 자유롭게 적어보아요."
    />
  </FormItem>
  <div className="flex justify-end mt-10 gap-3">
    <Button type="text" icon={<ArrowLeftIcon className="w-4 h-4"/>} onClick={onReturnClick}>{t("Synthesis.BackToExplore")}</Button>
    <Button disabled={!isValid} htmlType="submit" type="primary">{t("Synthesis.Complete")}</Button>
  </div></Form> : <div>
    <div>{debriefing}</div>
    <div className="text-center text-lg text-gray-500 flex items-center justify-center gap-x-2">
      <CheckCircleIcon className="w-6 h-6 text-green-500"/> 
      <span className="leading-0">{t("Synthesis.CompleteMessage")}</span>
    </div>
  </div>
    }</div>)
}

export default Debriefing;