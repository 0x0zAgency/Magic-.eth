import React, { useContext, useEffect, useState } from 'react';
import storage from '../storage';
import config from '../config';
import Navbar from '../components/Navbar';
import { apiFetch } from '../api';
import { useHistory } from 'react-router-dom';
import FixedElements from '../components/FixedElements';
import { LoginContext } from '../contexts/loginContext';
import LoginModal from '../modals/LoginModal';
import { Web3Context } from '../contexts/web3Context';

export default function History() {
	const [userHistory, setUserHistory] = useState([]);
	const [shouldShowLogin, setShouldShowLogin] = useState(false);
	const [error, setError] = useState(null);
	const history = useHistory();
	const loginContext = useContext(LoginContext);
	const web3Context = useContext(Web3Context);

	/**
	 * Fetch the user's history from the API
	 */
	useEffect(() => {
		setError(null);

		if (!loginContext.isSignedIn) {
			setError(new Error('You must be signed in to view your history'));
			return;
		}

		let main = async () => {
			let result = await apiFetch('history', 'get', {}, 'GET');
			setUserHistory(result);
		};
		main().catch((e) => {
			setError(e);
		});
	}, [loginContext.isSignedIn]);

	return (
		<div
			data-theme={
				storage.getGlobalPreference('defaultTheme') ||
				config.defaultTheme ||
				'forest'
			}
		>
			<Navbar />
			<div className="flex flex-row bg-gray-500 pt-4 pb-5">
				<div className="flex flex-col w-2/5 p-2">
					<h1 className="text-3xl md:text-5xl lg:text-6xl text-black text-center md:text-right lg:text-right mb-4">
						You've been picked up by our <u>📍egps.eth</u>
					</h1>
				</div>
				<div className="flex flex-col w-2/5 p-2">
					<p className="text-3xl">
						Heres your journey through the mirror so far!
					</p>
				</div>
			</div>
			<div className="flex flex-col pt-4 pb-4 items-center justify-center min-h-screen">
				<div className="flex flex-row items-center justify-center w-1/5 p-2">
					<div className="card bg-success">
						<div className="card-body text-center">
							<p className="text-3xl text-black ">The Present</p>
						</div>
					</div>
				</div>
				{(() => {
					let historyList = [];

					if (error || !loginContext.isSignedIn) {
						return (
							<>
								<svg
									className="w-6 h-6"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
								</svg>
								<div className="flex flex-row items-center justify-center w-1/5 p-2">
									<div className="card bg-error">
										<div className="card-body text-center text-black">
											<p className="text-3xl ">Error</p>
											<p>
												{error?.message
													? error.message
													: 'Unknown error'}
											</p>
											<div
												hidden={loginContext.isSignedIn}
											>
												<button
													className="btn"
													onClick={() => {
														setShouldShowLogin(
															true
														);
													}}
												>
													Sign in
												</button>
											</div>
										</div>
									</div>
								</div>
							</>
						);
					}

					for (let i = 0; i < userHistory.length; i++) {
						historyList.push(
							<>
								<div className="flex flex-row items-center justify-center w-1/5 p-2">
									<svg
										className="w-6 h-6"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
									</svg>
								</div>
								<div className="flex flex-row items-center justify-center w-1/5 p-2">
									<div className="card bg-white">
										<div className="card-body text-center">
											<p
												className="text-3xl text-black"
												style={{ cursor: 'pointer' }}
												onClick={() => {
													history.push(
														`/view/${userHistory[i].domainName}`
													);
												}}
											>
												{userHistory[i].domainName}
											</p>
											<p>
												You visited this property on{' '}
												{new Date(
													userHistory[i].createdAt
												).toString()}
											</p>
										</div>
									</div>
								</div>
							</>
						);
					}
					return historyList;
				})()}
				<div className="flex flex-row items-center justify-center w-1/5 p-2">
					<svg
						className="w-6 h-6"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
					</svg>
				</div>
				<div className="flex flex-row items-center justify-center w-1/5 p-2">
					<div className="card bg-warning">
						<div className="card-body text-center">
							<p className="text-3xl text-black">The Genesis</p>
						</div>
					</div>
				</div>
			</div>
			<FixedElements
				hideSettings={true}
				hideUserInfo={true}
				hideFooter={false}
				hideOwnership
				useFixed={false}
			/>
			<LoginModal
				hidden={
					shouldShowLogin !== null
						? !shouldShowLogin
						: loginContext.isSignedIn ||
						  !web3Context.walletConnected
				}
				onHide={() => {
					setShouldShowLogin(false);
				}}
				onLogin={async () => {
					await loginContext.login();
					setShouldShowLogin(false);
				}}
			/>
		</div>
	);
}
