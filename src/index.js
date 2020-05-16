import React from "react";
import ReactDOM from "react-dom";
import 'babel-polyfill'

import App from "./App";
import Launching from "./Launching";

if (module.hot) {
  module.hot.accept(() => {});
}

const rootElement = document.getElementById("root");
ReactDOM.render(<Launching />, rootElement);
