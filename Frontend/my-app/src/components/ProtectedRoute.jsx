import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import useStore from "../services/Stores";
import { checkAuth, clearTokens } from "../services/Api";

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const { accessToken, syncTokens, setUser } = useStore();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let active = true;
    const verify = async () => {
      try {
        const { data } = await checkAuth();
        if (data?.user) setUser(data.user);
        syncTokens();
        if (active) setAllowed(true);
      } catch {
        clearTokens();
        if (active) setAllowed(false);
      } finally {
        if (active) setChecking(false);
      }
    };
    verify();
    return () => {
      active = false;
    };
  }, [accessToken, syncTokens]);

  if (checking) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Checking session...</span>
        </div>
      </div>
    );
  }

  if (!allowed) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;
