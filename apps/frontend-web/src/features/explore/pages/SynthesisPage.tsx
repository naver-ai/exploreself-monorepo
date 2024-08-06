import { Input } from "antd"
import { AggregateBox } from "../components/AggregateBox"
import SynthesisBox from "../components/SynthesisBox"

export const SynthesisPage = () => {
  return (
    <div className="flex">
      <AggregateBox/>
      <div>
        <SynthesisBox/>
        <Input/>
      </div>
    </div>
  )
}