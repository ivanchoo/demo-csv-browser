import React from 'react';
import ReactDOM from 'react-dom';
import App from './app/App';
import $ from 'jquery';

const render = Component => {
  ReactDOM.render(
    <Component />,
    document.getElementById('root')
  );
};

$(() => {
  $('<div id="root" />').appendTo('body');
  render(App);
});


if (module.hot) {
  module.hot.accept('./app/App', () => render(App));
}
