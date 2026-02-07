import LogoutButton from "../LogoutButton";

function Lead() {
  return (
    <div className="container py-5">
      <div className="card shadow-sm">
        <div className="card-body d-flex justify-content-between align-items-start">
          <div>
            <h5 className="card-title">Lead Dashboard</h5>
            <p className="text-muted mb-0">Assign developers and track project status.</p>
          </div>
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}

export default Lead;