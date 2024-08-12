import { useMatch } from "react-router-dom"

export function useUId(): string | undefined {
  const urlMatch = useMatch("admin/users/:uid/*")
  return urlMatch?.params.uid
}

