import Notif from "./components/atoms/Notif/Notif";
import { ErrorBoundary } from "./components/atoms/ErrorBoundary/ErrorBoundary";
import FacebookProvider from "./components/atoms/FacebookProvier/FacebookProvider";

import { store } from "./_states/store";
import { Provider } from "react-redux";

import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import PrivateRoute from "./components/atoms/PrivateRoute/PrivateRoute";
import React from "react";
import { IRoute, routes } from "./_config/config";

const NestedRoute: React.FC<{ routes: IRoute[] }> = (props) => {
  return (
    <Switch>
      {props.routes
        .filter((item) => item.private)
        .map(({ Component, ...item }, key) => (
          <PrivateRoute key={key} path={item.path}>
            {!!item.children && item.children.length > 0 ? (
              <Component {...item.props}>
                <NestedRoute routes={item.children} />
              </Component>
            ) : (
              <ErrorBoundary>
                <Component {...item.props} />
              </ErrorBoundary>
            )}
          </PrivateRoute>
        ))}
      {props.routes
        .filter((item) => !item.private)
        .map(({ Component, ...item }, key) => (
          <Route key={key} path={item.path}>
            {!!item.children && item.children.length > 0 ? (
              <Component {...item.props}>
                <NestedRoute routes={item.children} />
              </Component>
            ) : (
              <ErrorBoundary>
                <Component {...item.props} />
              </ErrorBoundary>
            )}
          </Route>
        ))}
    </Switch>
  );
};

function App() {
  return (
      <Provider store={store}>
        <Notif>
          <FacebookProvider />
          <Router>
            <NestedRoute routes={routes} />
          </Router>
        </Notif>
      </Provider>
  );
}

export default App;
