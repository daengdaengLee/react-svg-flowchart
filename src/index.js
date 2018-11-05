import React, { Fragment } from 'react';
import ReactDOM from 'react-dom';
import {
  HashRouter as Router,
  Route,
  Switch,
  Redirect,
} from 'react-router-dom';
import { createGlobalStyle } from 'styled-components';
import reset from 'styled-reset';
import Composer from './components/4-pages/composer';
import ManySvgNode from './components/4-pages/many-svg-node';
import * as serviceWorker from './serviceWorker';

const GlobalStyle = createGlobalStyle`
  ${reset}
  html, body, #root {
    height: 100%;
  }
`;

ReactDOM.render(
  <Router>
    <Fragment>
      <Switch>
        <Route
          path="/many-svg-node"
          render={() => <ManySvgNode rowCount={100} colCount={16} />}
        />
        <Route path="/composer" component={Composer} />
        <Redirect to="/composer" />
      </Switch>
      <GlobalStyle />
    </Fragment>
  </Router>,
  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
