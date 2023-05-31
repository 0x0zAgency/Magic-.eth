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

function VirtualRegistry({ match }) {
	const history = useHistory();
	const loginContext = useContext(LoginContext);
	const context = useContext(Web3Context);
	const [error, setError] = useState(null);
	const [shouldShowLogin, setShouldShowLogin] = useState(null);
	const [loading, setLoading] = useState(true);
	const [hasChanges, setHasChanges] = useState(false);
	const [isApproved, setIsApproved] = useState(false);
	const [virtualRegistry, setVirtualRegistry] = useState({});
	const [virtualRegistryToggles, setVirtualRegistryToggles] = useState({});
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

			try {
				let result = await apiFetch(
					'registry',
					'get',
					{ domainName: domain },
					'GET'
				);

				if (!result.ok)
					return setError(
						result.error || result.message || 'Unknown Error'
					);

				setVirtualRegistry(result?.fakeRegistry?.registry || {});
				setVirtualRegistryToggles(result?.fakeRegistry?.toggles || {});
			} catch (error) {
				//ignore error
				setVirtualRegistry(null);
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
								Virtual Registry for <u>{domain}</u>
							</h1>
						</div>
						<div className="flex flex-col w-2/5 p-2">
							<p className="text-3xl">
								Your virutal registry is a mirror of your ENS
								Registry allowing you to change things for free!
							</p>
						</div>
					</div>

					<div className="flex flex-col md:flex-row sm:w-full md:w-4/5 justify-content-center mx-auto mt-2 mb-2 p-2 gap-2">
						<div className="flex flex-row md:flex-col md:w-4/5 sm:w-full">
							<div className="align-middle inline-block min-w-full bg-white">
								<div className="bg-info p-2 text-black text-3xl">
									<b>⚙️{domain}</b>
								</div>
								{!isApproved && !error ? (
									<div className="p-2">
										<div className="alert alert-error">
											You are not approved to edit this
											domain. You can how ever view the
											current settings.
										</div>
									</div>
								) : (
									<></>
								)}
								{error ? (
									<div className="p-2">
										<div className="alert alert-error">
											{error.message || error}
										</div>
									</div>
								) : (
									<>
										{Object.keys(
											config.fakeRegistryFields
										).map((key, index) => {
											let type =
												config.fakeRegistryFields[key]
													.type || 'text';

											if (type === 'string')
												type = 'text';

											return (
												<div className="border border-gray-300">
													<div className="flex flex-row p-2 ">
														<div className="flex flex-col w-2/5 p-2 text-center">
															<label className="md:text-2xl text-1xl text-black">
																<u>{key}</u>
															</label>
														</div>
														<div className="flex flex-col w-3/5 p-2">
															{type !==
																'select' &&
															type !==
																'checkbox' ? (
																<input
																	className="md:text-2xl text-1xl input input-bordered w-full"
																	placeholder=""
																	type={type}
																	disabled={
																		!isApproved
																	}
																	onChange={(
																		event
																	) => {
																		let _vr =
																			{};
																		if (
																			virtualRegistry
																		)
																			_vr =
																				{
																					...virtualRegistry,
																				};

																		_vr[
																			key
																		] =
																			event.target.value;
																		setHasChanges(
																			true
																		);
																		setVirtualRegistry(
																			_vr
																		);
																	}}
																	value={
																		virtualRegistry?.[
																			key
																		] ||
																		config
																			.fakeRegistryFields[
																			key
																		]
																			.default ||
																		''
																	}
																/>
															) : null}
															{type ===
															'select' ? (
																<select
																	className="md:text-2xl text-1xl input input-bordered w-full"
																	placeholder=""
																	disabled={
																		!isApproved
																	}
																	onChange={(
																		event
																	) => {
																		let _vr =
																			{};
																		if (
																			virtualRegistry
																		)
																			_vr =
																				{
																					...virtualRegistry,
																				};

																		_vr[
																			key
																		] =
																			event.target.value;
																		setHasChanges(
																			true
																		);
																		setVirtualRegistry(
																			_vr
																		);
																	}}
																	value={
																		virtualRegistry?.[
																			key
																		] ||
																		config
																			.fakeRegistryFields[
																			key
																		]
																			.default ||
																		''
																	}
																>
																	{config.fakeRegistryFields[
																		key
																	].options.map(
																		(
																			option,
																			index
																		) => {
																			return (
																				<option
																					key={
																						index
																					}
																					value={
																						option
																					}
																				>
																					{
																						option
																					}
																				</option>
																			);
																		}
																	)}
																</select>
															) : null}
														</div>
														<div className="flex flex-col w-1/5 p-2">
															<input
																className={
																	'md:text-2xl text-1xl input input-bordered w-full' +
																	(virtualRegistryToggles?.[
																		key
																	] ===
																		true ||
																	config
																		.fakeRegistryFields[
																		key
																	]
																		.alwaysToggled
																		? ' bg-success'
																		: ' bg-error')
																}
																disabled={
																	!isApproved
																}
																placeholder="?"
																type="checkbox"
																onClick={(
																	e
																) => {
																	if (
																		config
																			.fakeRegistryFields[
																			key
																		]
																			.alwaysToggled ||
																		!virtualRegistry[
																			key
																		]
																	)
																		e.preventDefault();
																}}
																onChange={(
																	event
																) => {
																	let _vr =
																		{};

																	if (
																		!virtualRegistry[
																			key
																		]
																	)
																		return;

																	if (
																		virtualRegistryToggles
																	)
																		_vr = {
																			...virtualRegistryToggles,
																		};

																	_vr[key] =
																		event.target.value;
																	setHasChanges(
																		true
																	);
																	setVirtualRegistryToggles(
																		_vr
																	);
																}}
																value={
																	config
																		.fakeRegistryFields[
																		key
																	]
																		.alwaysToggled
																		? true
																		: virtualRegistryToggles?.[
																				key
																		  ] ||
																		  false
																}
															/>
														</div>
													</div>
													{config.fakeRegistryFields[
														key
													].help ? (
														<div className="p-2">
															<div className="alert bg-gray-200 p-4 mb-2">
																<p className="text-1xl text-black">
																	{
																		config
																			.fakeRegistryFields[
																			key
																		].help
																	}
																</p>
															</div>
														</div>
													) : null}
												</div>
											);
										})}
									</>
								)}
							</div>
						</div>
						<div className="flex flex-row md:flex-col md:w-1/5 sm:w-full p-2 gap-2">
							<div className="flex flex-row w-full">
								<div className="alert alert-info mb-2">
									<p className="text-lg">
										You can enter a value you would like to
										use, then use the button on the right to
										toggle it. Red means that it will not
										use the value you entered and use what
										ever is in the ENS registry. If it is
										green then it will use the value you
										enter over your ENS registry value.
									</p>
								</div>
							</div>
							<div
								className="flex flex-col w-full"
								hidden={!hasChanges || !isApproved}
							>
								<button
									className="btn btn-primary"
									onClick={() => {
										setLoading(true);
										save()
											.catch((e) => {
												setError(
													e.message || 'Unknown Error'
												);
											})
											.finally(() => {
												setLoading(false);
											});
									}}
								>
									Save
								</button>
							</div>
							<div className="flex flex-col w-full">
								<button
									className="btn btn-warning"
									onClick={() => {
										history.push('/properties');
									}}
								>
									Back
								</button>
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

export default withRouter(VirtualRegistry);
