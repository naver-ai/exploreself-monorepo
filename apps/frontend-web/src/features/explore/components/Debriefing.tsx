import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "../../../redux/hooks";
import * as yup from 'yup';
import { useCallback } from "react";
import { yupResolver } from "@hookform/resolvers/yup";

import { submitDebriefing, submitInitialNarrative } from "../reducer";
import { Form, Input, Button } from "antd";
import { FormItem } from 'react-hook-form-antd';
const {TextArea} = Input
import { useTranslation } from 'react-i18next';


const schema = yup.object({
  debriefing: yup.string().trim().min(10).required(),
});

const Debriefing = () => {
  const debriefing = useSelector(state => state.explore.debriefing)
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

  const handleSubmitDebriefing = useCallback(async (values: { debriefing: string }) => {
    dispatch(submitDebriefing(values.debriefing)
    );
  }, []);

  return (
    <div>
      <Form onFinish={handleSubmit(handleSubmitDebriefing)}>
        <FormItem control={control} name="debriefing">
          <TextArea 
            autoSize={{ minRows: 4, maxRows: 10 }}
            placeholder="이번 탐색을 통해 자신과 상황에 대해 어떤 것을 배우거나 새로 깨닫게 되었나요? 무엇이든 생각 나는대로 자유롭게 적어보아요."
          />
        </FormItem>
        <div className="flex justify-end mt-10">
          <Button disabled={!isValid} htmlType="submit" type="primary">{t("Labels.Finish")}</Button>
        </div>
      </Form>
    </div>
  )
}

export default Debriefing;