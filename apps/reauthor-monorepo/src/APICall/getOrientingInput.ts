import axios from "axios"

const getOrientingInput = async (tid: string): Promise<string | null> => {
  try {
    const response = await axios.post(`http://localhost:3333/thread/getOrientingInput`,{
      tid: tid
    });
    return response.data.orientingInput;
  } catch (err) {
    console.error("Error in getOrientingInpur: ", err)
    return null
  } 
}

export default getOrientingInput;