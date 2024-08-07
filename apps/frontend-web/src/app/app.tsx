import { FC } from 'react';
// import '../style/index.css'
import '../styles.css';
import '../../../../libs/ts-core/src/lib/i18n/i18n';

import { Provider } from 'react-redux';
import store, {persistor} from '../redux/store';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../../../libs/ts-core/src/lib/i18n/i18n';
import { ConfigProvider } from 'antd';
import { theme } from '../styles';
import { PersistGate } from 'redux-persist/integration/react';
import { MainRouter } from './router';

const App: FC = () => {
  return (
    <ConfigProvider theme={theme}>
      <I18nextProvider i18n={i18n}>
        <Provider store={store}>
          <PersistGate persistor={persistor}>
            <MainRouter />
          </PersistGate>
        </Provider>
      </I18nextProvider>
    </ConfigProvider>
  );
};

export default App;
