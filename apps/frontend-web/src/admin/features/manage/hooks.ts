import { useMatch } from "react-router-dom"

export function useUId(): string | undefined {
  const urlMatch = useMatch("/users/:uid/*")
  return urlMatch?.params.uid
}

