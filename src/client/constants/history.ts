import { createBrowserHistory } from 'history';

const history =
  typeof document !== 'undefined' ? createBrowserHistory() : undefined;

export default history;
