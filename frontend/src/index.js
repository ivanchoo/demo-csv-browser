import React from "react";
import ReactDOM from "react-dom";
import App from "./app/App";
import $ from "jquery";
import { Provider } from "mobx-react";
import { Store } from "./app/store";

const store = new Store();

const render = Component => {
  ReactDOM.render(
    <Provider store={store}>
      <Component />
    </Provider>,
    document.getElementById("root")
  );
};

$(() => {
  // eslint-disable-next-line
  $('<div id="root" />').appendTo("body");
  render(App);
});

if (module.hot) {
  module.hot.accept("./app/App", () => render(App));
}
