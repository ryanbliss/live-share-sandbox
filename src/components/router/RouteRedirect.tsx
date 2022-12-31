import { FC } from "react";
import { Navigate, useSearchParams } from "react-router-dom";

interface IRouteRedirectProps {
  pathName: string;
  preserveSearch?: boolean;
}

export const RouteRedirect: FC<IRouteRedirectProps> = ({
  pathName,
  preserveSearch = false,
}) => {
  const [searchParams] = useSearchParams();
  return (
    <Navigate
      to={{
        pathname: pathName,
        search: preserveSearch ? `?${searchParams.toString()}` : undefined,
      }}
      replace
    />
  );
};
