import React, {FC, useEffect, useState} from 'react';
import axios from "axios";

const App: FC = () => {

  // const [input, setInput] = useState("");
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
    <div>
      <button onClick={onSubmit}>Submit</button>
      <p>Output: {output}</p>
    </div>
  )
}

export default App;
