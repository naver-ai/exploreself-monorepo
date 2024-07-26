import { Input, Button } from "antd";
import React, { useState } from "react";
import axios from "axios";
import { setInitialNarrative } from "../Redux/reducers/userSlice";
import { useNavigate } from "react-router-dom";
import setInitNarrative from "../APICall/setInitNarrative";
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from "../Redux/hooks";


const {TextArea} = Input;
const InitialNarrative = () => {

  const uid = useSelector((state) => state.userInfo.userId);
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [narrative, setNarrative] = useState<string>('');
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNarrative(e.target.value)
  }
  const submitNarrative = () => {
    // TODO: Change to axios
    // dispatch(setInitialNarrative(narrative))
    setInitNarrative(uid!, narrative)
    navigate('/value')
  }
 
  return(
    <div>
      Enter initial narrative: <input/>
      <br/>
      <br/>
      <TextArea rows={4} onChange={handleChange} value={narrative}/>
      <Button onClick={submitNarrative}>Submit</Button>
    </div>
  )
}
export default InitialNarrative;