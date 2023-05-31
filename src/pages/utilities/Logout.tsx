import FixedElements from '../../components/FixedElements';
import { useHistory } from 'react-router-dom';
import { useContext, useState } from 'react';
import { LoginContext } from '../../contexts/loginContext';
import storage from '../../storage';
import config from '../../config';
import Navbar from '../../components/Navbar';

export default function Logout() {
	const history = useHistory();
	const loginContext = useContext(LoginContext);
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(false);
	const logout = async () => {
		setError(null);
		setSuccess(false);
		try {
			if (!loginContext.isSignedIn)
				throw new Error(
					'you must be logged in to log out. Please log in to log out.'
				);

			await loginContext.destroy();
			setSuccess(true);
		} catch (e) {
			console.log(e);
			setError(e);
		}
	};

	return (
		<div
			data-theme={
				storage.getGlobalPreference('defaultTheme') ||
				config.defaultTheme ||
				'forest'
			}
		>
			<Navbar />
			<div className="hero min-h-screen">
				<div className="hero-overlay bg-opacity-60" />
				<div className="hero-content text-neutral-content bg-gray-500">
					<div className="max-w-xl">
						<h1 className="mb-5 text-5xl font-bold text-black text-center ">
							Logout
						</h1>
						<p className="mb-5 text-black text-center ">
							This will log you out of magic mirror. Bye then.
						</p>

						{error === null ? (
							<>
								{success ? (
									<p className="mb-5 text-success mt-2">
										You have been logged out.
									</p>
								) : (
									<></>
								)}
							</>
						) : (
							<p className="mb-5 text-error mt-2">
								{error.message}
							</p>
						)}
						<button
							className="btn btn-dark w-full"
							onClick={() => {
								logout();
							}}
						>
							Logout
						</button>
						<button
							className="btn btn-dark w-full mt-2"
							onClick={() => {
								history.push('/utilities/');
							}}
						>
							Dashboard
						</button>
						<button
							className="btn btn-dark w-full mt-2"
							onClick={() => {
								history.push('/');
							}}
						>
							Home
						</button>
					</div>
				</div>
			</div>
			<FixedElements useFixed={false}></FixedElements>
		</div>
	);
}
