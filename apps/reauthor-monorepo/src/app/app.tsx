import React, {FC, useEffect, useState} from 'react';
import axios from "axios";
import { BrowserRouter , Route, Routes } from 'react-router-dom';
import Main from './Pages/Main';

const App: FC = () => {

  const [output, setOutput] = useState<string>("");

  const onSubmit = () => {
    axios.get(
      `http://localhost:3333/test`
    ).then((res) => {
      setOutput(res.data.result)
      // return res.data.result
    }).catch((error) => {
      console.error("Error in making request: ", error)
    })
  }

  return (
    // <div>
    //   <button onClick={onSubmit}>Submit</button>
    //   <p>Output: {output}</p>
    // </div>
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Main/>}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App;
