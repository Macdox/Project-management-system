import { useNavigate } from "react-router-dom";
import useStore from "../services/Stores";

const LogoutButton = ({ className = "btn btn-outline-danger btn-sm" }) => {
	const navigate = useNavigate();
	const { logout } = useStore();

	const handleLogout = () => {
		logout();
		navigate("/", { replace: true });
	};

	return (
		<button type="button" className={className} onClick={handleLogout}>
			Logout
		</button>
	);
};

export default LogoutButton;
