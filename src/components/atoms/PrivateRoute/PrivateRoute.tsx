import { RootState } from "@src/_states/types";
import { useSelector } from "react-redux";
import { Redirect, Route, RouteProps } from "react-router-dom";

interface PrivateRouteProps extends RouteProps {
  children: React.ReactNode
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, ...rest }) => {
  const auth = useSelector((state: RootState) => state.auth)

  return (
    <Route
      {...rest}
      render={({ location }) =>
        auth.userData ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: '/login',
              state: { from: location },
            }}
          />
        )
      }
    />
  )
}
export default PrivateRoute