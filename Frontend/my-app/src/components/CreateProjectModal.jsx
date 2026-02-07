import { useEffect, useState } from "react";

const emptyForm = { name: "", description: "", deadline: "", leadEmail: "" };

const CreateProjectModal = ({ show, onClose, onSubmit, initialData }) => {
	const [form, setForm] = useState(emptyForm);

	useEffect(() => {
		if (initialData) {
			setForm({
				name: initialData.name || "",
				description: initialData.description || "",
				deadline: initialData.deadline ? initialData.deadline.substring(0, 10) : "",
				leadEmail: initialData.lead?.email || "",
			});
		} else {
			setForm(emptyForm);
		}
	}, [initialData]);

	if (!show) return null;

	const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

	const handleSubmit = (e) => {
		e.preventDefault();
		onSubmit(form);
	};

	return (
		<div className="modal d-block" tabIndex="-1" role="dialog" style={{ background: "rgba(0,0,0,0.4)" }}>
			<div className="modal-dialog modal-lg" role="document">
				<div className="modal-content">
					<div className="modal-header">
						<h5 className="modal-title">{initialData ? "Edit Project" : "Create Project"}</h5>
						<button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
					</div>
					<form onSubmit={handleSubmit}>
						<div className="modal-body">
							<div className="row g-3">
								<div className="col-md-6">
									<label className="form-label">Name</label>
									<input
										className="form-control"
										value={form.name}
										onChange={(e) => handleChange("name", e.target.value)}
										required
									/>
								</div>
								<div className="col-md-6">
									<label className="form-label">Lead Email</label>
									<input
										type="email"
										className="form-control"
										value={form.leadEmail}
										onChange={(e) => handleChange("leadEmail", e.target.value)}
										required
									/>
								</div>
								<div className="col-12">
									<label className="form-label">Description</label>
									<textarea
										className="form-control"
										rows="2"
										value={form.description}
										onChange={(e) => handleChange("description", e.target.value)}
									/>
								</div>
								<div className="col-md-4">
									<label className="form-label">Deadline</label>
									<input
										type="date"
										className="form-control"
										value={form.deadline}
										onChange={(e) => handleChange("deadline", e.target.value)}
									/>
								</div>
							</div>
						</div>
						<div className="modal-footer">
							<button type="button" className="btn btn-secondary" onClick={onClose}>
								Cancel
							</button>
							<button type="submit" className="btn btn-primary">
								{initialData ? "Save Changes" : "Create"}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default CreateProjectModal;
