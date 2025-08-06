/* eslint-disable no-undef */
import { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import App from './App';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store/Store';
import Spinner from './views/spinner/Spinner';


//Import React Query client and Devtols
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// instance query client
const queryClient = new QueryClient();
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
     <PersistGate loading={null} persistor={persistor}>
    <Suspense fallback={<Spinner />}>
      <BrowserRouter>
          <QueryClientProvider client={queryClient}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <App />
              </LocalizationProvider>
                {process.env.NODE_ENV === 'development' && (
                    <ReactQueryDevtools initialIsOpen={false} />
                  )}
            </QueryClientProvider>
      </BrowserRouter>
    </Suspense>
    </PersistGate>
  </Provider>
);