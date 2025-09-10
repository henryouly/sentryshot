/* @refresh reload */
import './index.css';
import { lazy } from 'solid-js';
import { render } from 'solid-js/web';
import { Router, Route, Navigate } from '@solidjs/router';
import 'solid-devtools';

const root = document.getElementById('root');

const LiveView = lazy(() => import('@/pages/LiveView'));
const Recordings = lazy(() => import('@/pages/Recordings'));
const Settings = lazy(() => import('@/pages/Settings'));
const Logs = lazy(() => import('@/pages/Logs'));

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  );
}

render(() => (
  <Router base='/frontend/'>
    <Route path="/" component={() => <Navigate href="/live" />} />
    <Route path="/live" component={LiveView} />
    <Route path="/recordings" component={Recordings} />
    <Route path="/settings" component={Settings} />
    <Route path="/logs" component={Logs} />
  </Router>
), root!);
