import { useCallback, useEffect } from 'react';
import { Button, Row, Space, Col, Drawer } from 'antd';
import {
  setSynthesisBoxOpen,
  setThemeSelectorOpen,
} from '../reducer';
import { useDispatch, useSelector } from '../../../redux/hooks';
import { postInteractionData } from '../../../api_call/postInteractionData';
import { InteractionType } from '@core';
import { LoadingIndicator } from '../../../components/LoadingIndicator';
import { getNewSynthesis} from '../reducer';
import { useTranslation } from 'react-i18next';
import { CloseOutlined } from '@ant-design/icons';


const SynthesisBox = () => {

  const isOpen = useSelector((state) => state.explore.isSynthesisBoxOpen);
  const synthesisList: string[] = useSelector(state => state.explore.synthesis)
  const isCreatingSynthesis = useSelector(state => state.explore.isCreatingSynthesis)

  const dispatch = useDispatch();
  const generateSynthesis = useCallback(async () => {
    dispatch(getNewSynthesis())
  },[])

  const onCloseSynthesis = useCallback(() => {
    dispatch(setSynthesisBoxOpen(false));
  },[])

  useEffect(() => {
    if(isOpen) {
      if(!synthesisList || synthesisList.length == 0) {
        generateSynthesis()
      }
    }
  },[isOpen])

  const [t] = useTranslation()



  return (
    <Drawer
      placement="left"
      closable={false}
      onClose={onCloseSynthesis}
      open={isOpen}
      size="large"
      getContainer={false}
      rootStyle={{ position: 'absolute', height: '100vh' }}
      title={t("Synthesis.Title")}
      extra={
        <Space>
          <Button disabled={isCreatingSynthesis} onClick={() => generateSynthesis()}>{t("Synthesis.More")}</Button>
          <Button
                type="text"
                icon={<CloseOutlined />}
                onClick={onCloseSynthesis}
              />
        </Space>
      }
    >
      <div>
      <div className="w-full flex justify-end">
              
            </div>
      {isCreatingSynthesis? <LoadingIndicator title={t("Synthesis.Generating")}/>: null}
          {[...synthesisList].reverse().map((item, i) => {
          return (
            <div className='flex flex-row border justify-between mx-10 px-10 py-7 my-5 rounded-lg shadow-md'>
              {item}
              {/* <OutlineBookmarkIcon className="w-8 h-8"/> */}
            </div>
          )
        })} 
  
      </div>
    </Drawer>
  );
};

export default SynthesisBox;
