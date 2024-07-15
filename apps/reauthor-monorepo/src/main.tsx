import * as ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './Redux/store';


import App from './app/app';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);
