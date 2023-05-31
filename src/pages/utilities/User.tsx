import FixedElements from '../../components/FixedElements';
import { useHistory } from 'react-router-dom';
import { useContext, useState } from 'react';
import { LoginContext } from '../../contexts/loginContext';
import { apiFetch } from '../../api';
import storage from '../../storage';
import config from '../../config';
import Navbar from '../../components/Navbar';

export default function User() {
	const history = useHistory();
	const loginContext = useContext(LoginContext);
	const [user, setUser] = useState(null);
	const [error, setError] = useState(null);
	const fetch = async () => {
		setError(null);
		try {
			if (!loginContext.isSignedIn)
				throw new Error(
					'please log in to fetch your user data from the database'
				);

			let result = await apiFetch('user', 'me', null, 'GET');
			setUser(result.user);
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
							Current User Checker
						</h1>
						<p className="mb-5 text-black text-center ">
							This will require you to be currently logged in to
							magic mirror. Returns your user row from the
							database.
						</p>

						{error === null ? (
							<>
								{!user ? (
									<></>
								) : (
									<>
										{Object.keys(user).map((key) => {
											return (
												<p
													className="mb-5 text-success mt-2"
													key={key}
												>
													{key}:{' '}
													{typeof user[key] ===
													'object'
														? JSON.stringify(
																user[key]
														  )
														: user[key]}
												</p>
											);
										})}
									</>
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
								fetch();
							}}
						>
							Fetch
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
