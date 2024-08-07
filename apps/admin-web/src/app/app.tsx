import { Provider } from 'react-redux';
import { store } from '../redux/store';
import { MainRouter } from './router';
import '../styles.css';
import { ConfigProvider } from 'antd';
import i18n from '../../../../libs/ts-core/src/lib/i18n/i18n';
import { I18nextProvider } from 'react-i18next';



export function App() {
  return (
    <ConfigProvider>
      <I18nextProvider i18n={i18n}>
        <Provider store={store}>
          <MainRouter />
        </Provider>
      </I18nextProvider>
    </ConfigProvider>
  );
}

export default App;
