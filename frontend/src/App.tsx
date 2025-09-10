import { lazy, type Component } from 'solid-js';

import { Router, Route, Navigate } from '@solidjs/router';

const LiveView = lazy(() => import('@/pages/LiveView'));
const Recordings = lazy(() => import('@/pages/Recordings'));
const Settings = lazy(() => import('@/pages/Settings'));
const Logs = lazy(() => import('@/pages/Logs'));

const App: Component = () => {
  return (
    <Router base='/frontend'>
      <Route path="/" component={() => <Navigate href="/live" />} />
      <Route path="/live" component={LiveView} />
      <Route path="/recordings" component={Recordings} />
      <Route path="/settings" component={Settings} />
      <Route path="/logs" component={Logs} />
    </Router>
  );
};

export default App;
