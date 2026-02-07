import { useEffect, useState } from "react";
import LogoutButton from "../LogoutButton";
import useStore from "../../services/Stores";
import CreateProjectModal from "../CreateProjectModal";
import CreateUserCard from "../users/CreateUserCard";
import EditUserRoleCard from "../users/EditUserRoleCard";
import {
  fetchProjects,
  createProject,
  updateProject,
  deleteProject,
  completeProject,
  uploadProjectDocument,
  register,
  editUserRole,
  getUsers,
} from "../../services/Api";

function Admin() {
  const { user } = useStore();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [uploadingId, setUploadingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [openDocs, setOpenDocs] = useState({});
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");

  const loadProjects = async () => {
    setLoading(true);
    try {
      const { data } = await fetchProjects();
      setProjects(data || []);
      setStatus({ type: "", message: "" });
    } catch (err) {
      setStatus({ type: "danger", message: err.response?.data?.message || "Failed to load projects" });
    } finally {
      setLoading(false);
    }
  };

  const toggleDocs = (id) => {
    setOpenDocs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleSubmitModal = async (formData) => {
    setStatus({ type: "", message: "" });
    try {
      if (editingProject) {
        await updateProject(editingProject._id, formData);
        setStatus({ type: "success", message: "Project updated" });
      } else {
        await createProject(formData);
        setStatus({ type: "success", message: "Project created" });
      }
      setModalOpen(false);
      setEditingProject(null);
      loadProjects();
    } catch (err) {
      setStatus({ type: "danger", message: err.response?.data?.message || "Save failed" });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    try {
      await deleteProject(id);
      setStatus({ type: "success", message: "Project deleted" });
      setProjects((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      setStatus({ type: "danger", message: err.response?.data?.message || "Delete failed" });
    }
  };

  const handleComplete = async (id) => {
    try {
      await completeProject(id);
      setStatus({ type: "success", message: "Marked completed" });
      loadProjects();
    } catch (err) {
      setStatus({ type: "danger", message: err.response?.data?.message || "Update failed" });
    }
  };

  const handleUpload = async (id, file) => {
    if (!file) return;
    setUploadingId(id);
    try {
      await uploadProjectDocument(id, file);
      setStatus({ type: "success", message: "Document uploaded" });
      loadProjects();
    } catch (err) {
      setStatus({ type: "danger", message: err.response?.data?.message || "Upload failed" });
    } finally {
      setUploadingId(null);
    }
  };

  const handleCreateUser = async ({ name, email, password, role }) => {
    return register(name, email, password, role);
  };

  const handleEditRole = async ({ email, role }) => {
    return editUserRole(email, role);
  };

  const loadUsers = async () => {
    setUsersLoading(true);
    setUsersError("");
    try {
      const { data } = await getUsers();
      setUsers(data || []);
    } catch (err) {
      setUsersError(err.response?.data?.message || "Failed to load users");
    } finally {
      setUsersLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="card shadow-sm mb-4">
        <div className="card-body d-flex justify-content-between align-items-start">
          <div>
            <h5 className="card-title">Admin Dashboard</h5>
            <p className="text-muted mb-0">
              Manage users, roles, and projects. {user?.email ? `Signed in as ${user.email}.` : ""}
            </p>
          </div>
          <LogoutButton />
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div>
          <div className="card shadow-sm h-100">
            <div className="card-body d-flex justify-content-between align-items-start">
              <div>
                <h6 className="card-title mb-1">Create User</h6>
                <p className="text-muted small mb-0">Add Admin/Lead/Developer accounts.</p>
              </div>
              <button className="btn btn-primary" onClick={() => setShowCreateUser(true)}>
                Create User
              </button>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <EditUserRoleCard onUpdate={handleEditRole} />
        </div>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div>
              <h6 className="card-title mb-0">Users</h6>
              <p className="text-muted small mb-0">All users (Admin)</p>
            </div>
            <button className="btn btn-outline-primary btn-sm" onClick={loadUsers} disabled={usersLoading}>
              {usersLoading ? "Loading..." : "Refresh"}
            </button>
          </div>
          {usersError && <div className="alert alert-danger py-2 mb-2">{usersError}</div>}
          {usersLoading ? (
            <div className="d-flex align-items-center gap-2 text-muted">
              <div className="spinner-border spinner-border-sm text-primary" role="status" />
              <span>Loading users...</span>
            </div>
          ) : users.length === 0 ? (
            <p className="text-muted mb-0">No users loaded. Click Refresh.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-sm align-middle">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id || u.email}>
                      <td>{u.name || "-"}</td>
                      <td>{u.email}</td>
                      <td>{u.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="mb-0">Projects</h6>
        <button className="btn btn-primary" onClick={() => { setEditingProject(null); setModalOpen(true); }}>
          New Project
        </button>
      </div>

      {status.message && (
        <div className={`alert alert-${status.type}`} role="alert">{status.message}</div>
      )}

      <div className="card shadow-sm">
        <div className="card-body">
          <h6 className="card-title">Projects</h6>
          {loading ? (
            <div className="d-flex align-items-center gap-2">
              <div className="spinner-border spinner-border-sm text-primary" role="status" />
              <span className="text-muted">Loading...</span>
            </div>
          ) : projects.length === 0 ? (
            <p className="text-muted mb-0">No projects yet.</p>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Lead</th>
                    <th>Deadline</th>
                    <th>Documents</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p) => (
                    <tr key={p._id}>
                      <td>{p.name}</td>
                      <td>{p.status}</td>
                      <td>{p.lead?.email || "-"}</td>
                      <td>{p.deadline ? p.deadline.substring(0, 10) : "-"}</td>
                      <td>
                        {p.documents && p.documents.length > 0 ? (
                          <div>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => toggleDocs(p._id)}
                            >
                              Docs ({p.documents.length})
                            </button>
                            {openDocs[p._id] && (
                              <div className="mt-2 border rounded p-2 bg-light">
                                <div className="d-flex flex-column gap-1">
                                  {p.documents.map((doc) => (
                                    <a
                                      key={doc.filename}
                                      href={`http://localhost:5000/uploads/${doc.filename}`}
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      {doc.originalName || doc.filename}
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted">None</span>
                        )}
                      </td>
                      <td className="d-flex flex-wrap gap-2">
                        <button className="btn btn-sm btn-outline-secondary" onClick={() => { setEditingProject(p); setModalOpen(true); }}>
                          Edit
                        </button>
                        <button className="btn btn-sm btn-outline-success" onClick={() => handleComplete(p._id)} disabled={p.status === "COMPLETED"}>
                          Complete
                        </button>
                        <label className="btn btn-sm btn-outline-primary mb-0">
                          {uploadingId === p._id ? "Uploading..." : "Upload"}
                          <input
                            type="file"
                            hidden
                            onChange={(e) => handleUpload(p._id, e.target.files?.[0])}
                          />
                        </label>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(p._id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <CreateProjectModal
        show={modalOpen}
        onClose={() => { setModalOpen(false); setEditingProject(null); }}
        onSubmit={handleSubmitModal}
        initialData={editingProject}
      />

      {showCreateUser && (
        <div className="modal d-block" tabIndex="-1" role="dialog" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create User</h5>
                <button type="button" className="btn-close" aria-label="Close" onClick={() => setShowCreateUser(false)}></button>
              </div>
              <div className="modal-body">
                <CreateUserCard onCreate={handleCreateUser} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;