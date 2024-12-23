import { Input, Button, Form } from 'antd';
import { useCallback, useRef } from 'react';
import { Navigate, useNavigate, useNavigation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from '../../../redux/hooks';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormItem } from 'react-hook-form-antd';
import Markdown from 'react-markdown'
import { PencilIcon } from '@heroicons/react/24/solid';
import { TextAreaRef } from 'antd/es/input/TextArea';
import { ArrowLeftIcon } from '@heroicons/react/20/solid';
import { createAgenda } from '../reducer';

const schema = yup.object({
  narrative: yup.string().trim().min(1).required(),
});

const { TextArea } = Input;

export const InitialNarrativePage = () => {

  const isCreatingAgenda = useSelector(state => state.user.isCreatingAgenda)

  const {
    control,
    handleSubmit,
    setFocus,
    formState: { isValid },
  } = useForm({
    resolver: yupResolver(schema),
    reValidateMode: 'onChange',
  });

  const dispatch = useDispatch();

  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const inputRef = useRef<TextAreaRef>(null)

  const onBackClick = useCallback(()=>{
    if(isValid){
      if(window.confirm(t("Narrative.BackConfirm"))){
        navigate(-1)
      }
    }else{
      navigate(-1)
    }
  }, [navigate, isValid, t])

  const submitNarrative = useCallback(async (values: { narrative: string }) => {
    const newAgendaId = await dispatch(
      createAgenda(values.narrative)
    );
    if(newAgendaId != null){
      console.log(newAgendaId)
      navigate(`../${newAgendaId}`, {replace: true})
    }
  }, [navigate]);

  return <div className='flex flex-col h-full bg-white'>
      <div className="flex-1 overflow-y-scroll">
        <div className="container-narrow !px-4 !sm:px-8 py-8 h-full flex flex-col">
          <div className='text-lg font-bold pb-4 border-b mb-6 flex items-center gap-x-2'><PencilIcon className='w-5 h-5 mb-1'/>{t("Narrative.Title")}</div>
          <Markdown className="mb-4 p-2 font-light leading-7 bg-gray-100">{t("Narrative.Prompt")}</Markdown>
            <Form id="form-narrative" onFinish={handleSubmit(submitNarrative)} disabled={isCreatingAgenda} className='flex-1 cursor-text' onClickCapture={()=>{
              setFocus("narrative", {shouldSelect: false})
            }}>
              <FormItem control={control} name="narrative" rootClassName="mb-4" className='bg-gray-100'>
                <TextArea size="large" autoFocus data-enable-grammarly={false} className='minimal !leading-8 text-gray-700' autoSize={{minRows:10}} placeholder={t("Narrative.Placeholder")}/>
              </FormItem>
            </Form>
        </div>
      </div>
      <div className='shadow-2xl shadow-black z-10'>
        <div className="container-narrow flex items-center justify-between p-4 !px-8">
          <Button disabled={isCreatingAgenda} size="middle" type='text' icon={<ArrowLeftIcon className="w-4 h-4" />} className='px-2' onClick={onBackClick}>{t("Narrative.Back")}</Button>
          <Button disabled={!isValid || isCreatingAgenda === true} size="large" htmlType="submit" type="primary" form='form-narrative'>{t("Narrative.Complete")}</Button>
        </div>
      </div>
    </div>
};

export default InitialNarrativePage