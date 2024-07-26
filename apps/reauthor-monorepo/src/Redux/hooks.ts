import {TypedUseSelectorHook, useDispatch as stockUseDispatch, useSelector as stockUseSelector} from "react-redux";
import {AppDispatch, AppState} from "./store";

export const useDispatch = () => stockUseDispatch<AppDispatch>()
export const useSelector: TypedUseSelectorHook<AppState> = stockUseSelector