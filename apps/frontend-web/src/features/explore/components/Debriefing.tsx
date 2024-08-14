import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "../../../redux/hooks";
import * as yup from 'yup';
import { useCallback } from "react";
import { yupResolver } from "@hookform/resolvers/yup";

import { abortReviewStage, revertTerminateSession, terminateSession } from "../reducer";
import { Form, Input, Button, Switch } from "antd";
import { FormItem } from 'react-hook-form-antd';
const {TextArea} = Input
import { useTranslation } from 'react-i18next';
import { SessionStatus } from "@core";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { ArrowLeftIcon } from "@heroicons/react/20/solid";
import session from "redux-persist/lib/storage/session";


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
    if(window.confirm("Synthesis.CompleteConfirm")){
      dispatch(terminateSession(values.debriefing));
    }
  }, []);

  const handleRevertTerminateSession = useCallback(async () => {
    dispatch(revertTerminateSession())
  },[])

  const handleSwitchChange = useCallback((checked: boolean) => {
    if (checked) {
      handleSubmitDebriefing({ debriefing });
    } else {
      handleRevertTerminateSession();
    }
  }, [debriefing, handleSubmitDebriefing, handleRevertTerminateSession]);

  const onReturnClick = useCallback(() => {
    dispatch(abortReviewStage())
  }, [])

  return (<div>
  {sessionStatus == SessionStatus.Reviewing ? 
  <Form onFinish={handleSubmit(handleSubmitDebriefing)}>
  <FormItem control={control} name="debriefing">
    <TextArea
      data-enable-grammarly={false}
      defaultValue={debriefing}
      autoFocus
      autoSize={{ minRows: 5, maxRows: 10 }}
      placeholder={t("Synthesis.FinalReflection")}
    />
  </FormItem>
  <div className="flex justify-end mt-10 gap-3">
    <Button type="text" icon={<ArrowLeftIcon className="w-4 h-4"/>} onClick={onReturnClick}>{t("Synthesis.BackToExplore")}</Button>
  </div>
  <div className="flex justify-end mt-4">
    <div className="mr-3">{t("Synthesis.Complete")}</div>
    <Switch
      checked={sessionStatus !== SessionStatus.Reviewing}
      onChange={handleSwitchChange}
    />
  </div>
  </Form>
   : 
   <div>
    <div>{debriefing}</div>
    {/* <div className="flex justify-end mt-10 gap-3">
    <Button type="text" icon={<ArrowLeftIcon className="w-4 h-4"/>} onClick={onReturnClick}>{t("Synthesis.BackToExplore")}</Button>
    </div> */}
    <div className="flex justify-end mt-4">
    <CheckCircleIcon className="w-6 h-6 text-green-500"/> 
    <span className="leading-0 mr-3">{t("Synthesis.CompleteMessage")}</span>
    <Switch
      checked={sessionStatus == SessionStatus.Terminated}
      onChange={handleSwitchChange}
    />
  </div>
  
   </div>}
  
  
  </div>)
}

export default Debriefing;
