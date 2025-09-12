import { lazy, type Component } from 'solid-js';
import { Router, Route, Navigate } from '@solidjs/router';

import { EnvDataProvider } from '@/contexts/env-data';

const LiveView = lazy(() => import('@/pages/LiveView'));
const Recordings = lazy(() => import('@/pages/Recordings'));
const Settings = lazy(() => import('@/pages/Settings'));
const Logs = lazy(() => import('@/pages/Logs'));

const App: Component = () => {
  return (
    <EnvDataProvider>
      <Router base='/frontend'>
        <Route path="/" component={() => <Navigate href="/live" />} />
        <Route path="/live" component={LiveView} />
        <Route path="/recordings" component={Recordings} />
        <Route path="/settings" component={Settings} />
        <Route path="/logs" component={Logs} />
      </Router>
    </EnvDataProvider>
  );
};

export default App;
