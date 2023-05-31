import React, { useContext, useEffect, useState } from 'react';
import storage from '../storage';
import config from '../config';
import Navbar from '../components/Navbar';
import { useHistory, withRouter } from 'react-router-dom';
import { apiFetch } from '../api';
import Loading from '../components/Loading';
import { LoginContext } from '../contexts/loginContext';
import LoginModal from '../modals/LoginModal';
import { Web3Context } from '../contexts/web3Context';
import FixedElements from '../components/FixedElements';
import SettingsModal from '../modals/SettingsModal';

function ENS({ match }) {
	const history = useHistory();
	const loginContext = useContext(LoginContext);
	const context = useContext(Web3Context);
	const [error, setError] = useState(null);
	const [shouldShowLogin, setShouldShowLogin] = useState(null);
	const [loading, setLoading] = useState(true);
	const [isApproved, setIsApproved] = useState(false);
	const [shouldShowSettings, setShouldShowSettings] = useState(false);
	const {
		params: { domain },
	} = match;

	const save = async () => {};

	useEffect(() => {
		if (!domain) return;
		if (domain.indexOf('.') === -1) return setError('Invalid domain name');

		let main = async () => {
			if (!loginContext.loaded) return;

			if (!loginContext.isSignedIn) {
				setError(new Error('You must be signed in to view this page'));
				return;
			}

			try {
				let approval = await apiFetch(
					'ens',
					'approved',
					{ domainName: domain, address: loginContext.address },
					'GET'
				);

				if (!approval?.ok) return setError('Invalid Domain');
				if (approval.approved) setIsApproved(true);
			} catch (error) {
				setError('Invalid Domain');
				return;
			}
		};
		main()
			.catch((e) => {
				setError(e.message || 'Unknown Error');
			})
			.finally(() => {
				setLoading(false);
			});
	}, [domain, loginContext]);

	return (
		<div
			data-theme={
				storage.getGlobalPreference('defaultTheme') ||
				config.defaultTheme ||
				'forest'
			}
		>
			<Navbar />

			{loading ? (
				<Loading />
			) : (
				<>
					<div className="flex flex-row bg-gray-500 pt-4 pb-5">
						<div className="flex flex-col w-2/5 p-2">
							<h1 className="text-3xl md:text-5xl lg:text-6xl text-black text-center md:text-right lg:text-right mb-4">
								<u>{domain}</u> Inspector
							</h1>
						</div>
						<div className="flex flex-col w-2/5 p-2">
							<p className="text-3xl">
								Heres where you can see which variables are
								currently inside of your registry and change
								them.
							</p>
						</div>
					</div>
					<div className="flex flex-row p-2">
						<div className="flex flex-col w-2/5 p-2">
							<div className="bg-warning p-2 text-black text-3xl">
								<b>🛠️ Tools</b>
							</div>
							<div className="w-full h-full bg-gray-200 text-black p-2">
								<div className="flex flex-col w-full gap-2">
									<div className="flex flex-col w-full">
										<button className="bg-gray-500 text-white p-2 rounded-md">
											Overview
										</button>
									</div>
									<div className="divider">
										Authentication & Ownership
									</div>
									<div className="flex flex-col w-full">
										<button className="bg-gray-500 text-white p-2 rounded-md">
											Transfer ENS
										</button>
									</div>
									<div className="flex flex-col w-full">
										<button className="bg-gray-500 text-white p-2 rounded-md">
											Set Operator
										</button>
									</div>
									<div className="flex flex-col w-full">
										<button className="bg-gray-500 text-white p-2 rounded-md">
											Set Approved
										</button>
									</div>
									<div className="flex flex-col w-full">
										<button className="bg-gray-500 text-white p-2 rounded-md">
											View Managers
										</button>
									</div>
									<div className="divider">Registry</div>
									<div className="flex flex-col w-full">
										<button className="bg-gray-500 text-white p-2 rounded-md">
											View Virtual Registry
										</button>
									</div>
									<div className="flex flex-col w-full">
										<button className="bg-gray-500 text-white p-2 rounded-md">
											Deploy ENS Registry
										</button>
									</div>
									<div className="divider">
										Sub Domains & Content Records
									</div>
									<div className="flex flex-col w-full">
										<button className="bg-gray-500 text-white p-2 rounded-md">
											Add/Remove Subdomain
										</button>
									</div>
									<div className="flex flex-col w-full">
										<button className="bg-gray-500 text-white p-2 rounded-md">
											Set Content Record
										</button>
									</div>
									<div className="flex flex-col w-full">
										<button className="bg-gray-500 text-white p-2 rounded-md">
											Verify Content Hash
										</button>
									</div>
									<div className="divider">Links</div>
									<div className="flex flex-col w-full">
										<button className="bg-gray-500 text-white p-2 rounded-md">
											ENS.vision
										</button>
									</div>
									<div className="flex flex-col w-full">
										<button className="bg-gray-500 text-white p-2 rounded-md">
											ens.limo
										</button>
									</div>
									<div className="flex flex-col w-full">
										<button className="bg-gray-500 text-white p-2 rounded-md">
											Magic🪞.eth
										</button>
									</div>
									<div className="flex flex-col w-full">
										<button className="bg-gray-500 text-white p-2 rounded-md">
											Etherscan (Token)
										</button>
									</div>
									<div className="flex flex-col w-full">
										<button className="bg-gray-500 text-white p-2 rounded-md">
											Etherscan (Resolver)
										</button>
									</div>
									<div className="flex flex-col w-full">
										<button className="bg-gray-500 text-white p-2 rounded-md">
											Etherscan (Registry)
										</button>
									</div>
									<div className="flex flex-col w-full">
										<button className="bg-gray-500 text-white p-2 rounded-md">
											Opensea
										</button>
									</div>
									<div className="divider"></div>
									<div className="flex flex-col w-full">
										<button
											className="bg-warning text-black p-2 rounded-md"
											onClick={() => {
												history.push('/properties');
											}}
										>
											Back
										</button>
									</div>
								</div>
							</div>
						</div>
						<div className="flex flex-col w-full p-2">
							<div className="w-full h-full bg-gray-200 text-black p-2">
								<div className="alert alert-error">
									<u>🛠️ NOTE</u>
									This page is under construction. Please
									check back later.
								</div>
							</div>
						</div>
					</div>
				</>
			)}
			{/** Contains the footer and the 0x0zLogo with the console button */}
			<FixedElements
				hideSettings={true}
				hideUserInfo={true}
				hideFooter={false}
				hideOwnership
				useFixed={false}
				onSettings={() => {
					setShouldShowSettings(!shouldShowSettings);
				}}
			/>
			<SettingsModal
				hidden={!shouldShowSettings}
				onHide={() => {
					setShouldShowSettings(false);
				}}
			/>
			<LoginModal
				hidden={
					shouldShowLogin !== null
						? !shouldShowLogin
						: loginContext.isSignedIn || !context.walletConnected
				}
				onHide={() => {
					setShouldShowLogin(false);
				}}
				onLogin={async () => {
					await loginContext.login();
				}}
			/>
		</div>
	);
}

export default withRouter(ENS);
