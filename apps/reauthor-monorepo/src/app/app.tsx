import {FC} from 'react';
// import '../style/index.css'
import 'apps/reauthor-monorepo/src/styles.css'
import '../i18n/i18n'

import { Provider } from 'react-redux';
import store from '../redux/store';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n/i18n';
import { MainRouter } from './router';
import { ConfigProvider } from 'antd';
import { theme } from '../styles';

const App: FC = () => {

  return <ConfigProvider theme={theme}><I18nextProvider i18n={i18n}>
    <Provider store={store}>
      <MainRouter/>
    </Provider>
  </I18nextProvider></ConfigProvider>
}

export default App;
