import LogoutButton from "../LogoutButton";

function Developer() {
  return (
    <div className="container py-5">
      <div className="card shadow-sm">
        <div className="card-body d-flex justify-content-between align-items-start">
          <div>
            <h5 className="card-title">Developer Dashboard</h5>
            <p className="text-muted mb-0">View your assigned tasks and upload documents.</p>
          </div>
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}

export default Developer;