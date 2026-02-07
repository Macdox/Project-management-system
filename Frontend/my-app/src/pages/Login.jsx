import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useStore from "../services/Stores";

const Login = () => {
  const navigate = useNavigate();
  const { login, accessToken } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (accessToken) {
      navigate("/dashboard", { replace: true });
    }
  }, [accessToken, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result?.error) {
      setStatus({ type: "danger", message: result.error });
      return;
    }
    setStatus({ type: "success", message: "Login successful" });
    navigate("/dashboard");
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h4 className="card-title mb-3 text-center">Sign in</h4>
              <p className="text-muted text-center mb-4">
                Enter your credentials to continue
              </p>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign in"}
                </button>
              </form>
              {status.message && (
                <div className={`alert alert-${status.type} mt-3 mb-0`} role="alert">
                  {status.message}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
