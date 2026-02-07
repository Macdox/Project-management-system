import Admin from "../components/dashboards/Admin";
import Lead from "../components/dashboards/Lead";
import Developer from "../components/dashboards/Developer";
import useStore from "../services/Stores";

function Dashboard() {
  const { user } = useStore();

  const role = user?.role?.toUpperCase();

  const renderByRole = () => {
    if (role === "ADMIN") return <Admin />;
    if (role === "LEAD") return <Lead />;
    if (role === "DEVELOPER") return <Developer />;
    return (
      <div className="container py-5">
        <div className="alert alert-warning">Role not recognized.</div>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return <div className="app min-vh-100">{renderByRole()}</div>;
}

export default Dashboard;