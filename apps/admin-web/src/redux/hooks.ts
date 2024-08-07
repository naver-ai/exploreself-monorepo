import {
  TypedUseSelectorHook,
  useDispatch as stockUseDispatch,
  useSelector as stockUseSelector,
} from 'react-redux';
import { AdminDispatch, AdminReduxState } from './store';

export const useDispatch = () => stockUseDispatch<AdminDispatch>();
export const useSelector: TypedUseSelectorHook<AdminReduxState> = stockUseSelector;
