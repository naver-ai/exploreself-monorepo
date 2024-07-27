import { Input, Button } from "antd";
import React, { useCallback, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import setInitNarrative from "../../../APICall/setInitNarrative";
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from "../../../Redux/hooks";


const {TextArea} = Input;
export const InitialNarrativePage = () => {

  const token = useSelector((state) => state.userInfo.token) as string;
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [narrative, setNarrative] = useState<string>('');
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNarrative(e.target.value)
  }
  const submitNarrative = useCallback(async () => {
    const success = await setInitNarrative(token, narrative)
    if(success) {
      navigate('/')
    }
  },[narrative])
 
  return(
    <div>
      Enter initial narrative: 
      <br/>
      <br/>
      <TextArea rows={4} onChange={handleChange} value={narrative}/>
      <Button onClick={submitNarrative}>Submit</Button>
    </div>
  )
}