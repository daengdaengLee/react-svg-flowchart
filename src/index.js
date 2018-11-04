import React, { Fragment } from 'react';
import ReactDOM from 'react-dom';
import { createGlobalStyle } from 'styled-components';
import reset from 'styled-reset';
import * as serviceWorker from './serviceWorker';

const GlobalStyle = createGlobalStyle`
  ${reset}
  html, body, #root {
    height: 100%;
  }
`;

ReactDOM.render(
  <Fragment>
    <div>Hello World</div>
    <GlobalStyle />
  </Fragment>,
  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
