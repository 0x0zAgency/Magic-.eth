import React, { useContext, useEffect, useState } from 'react';
import storage from '../storage';
import config from '../config';
import FixedElements from '../components/FixedElements';
import SettingsModal from '../modals/SettingsModal';
import LoginModal from '../modals/LoginModal';
import { Web3Context } from '../contexts/web3Context';
import { LoginContext } from '../contexts/loginContext';
import { apiFetch } from '../api';
import { useHistory } from 'react-router-dom';
import Loading from '../components/Loading';
import Navbar from '../components/Navbar';

export default function Properties() {
	const [shouldShowSettings, setShouldShowSettings] = useState(false);
	const [shouldShowLogin, setShouldShowLogin] = useState(null);
	const [ens, setENS] = useState([]);
	const [loading, setLoading] = useState(false);
	const [filterTerm, setFilterTerm] = useState('');
	const [hasSearched, setHasSearched] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [lastSearchTerm, setLastSearchTerm] = useState('');
	const [error, setError] = useState(null);
	const [count, setCount] = useState(0);
	const [hasMoreSearchResults, setHasMoreSearchResults] = useState(false);
	const [totalPages, setTotalPages] = useState(0);
	const [page, setPage] = useState(storage.getPagePreference('page') || 0);
	const [pageMax, setPageMax] = useState(100);
	const context = useContext(Web3Context);
	const history = useHistory();
	const loginContext = useContext(LoginContext);

	let getAllEns = async () => {
		setHasSearched(false);
		setLoading(true);
		setError(null);
		let result = await apiFetch(
			'ens',
			'all',
			{
				address: context.walletAddress,
				page: page,
			},
			'GET'
		);

		setENS(result.nfts || []);
		setLoading(false);
	};

	let fetchENS = async () => {
		setHasSearched(false);
		setLoading(true);
		setError(null);
		await apiFetch(
			'ens',
			'fetch',
			{
				address: context.walletAddress,
			},
			'GET'
		);
		await getAllEns();
		await getCount();
		setLoading(false);
	};

	let searchENS = async () => {
		if (searchTerm === '') return;

		setHasSearched(true);
		setLastSearchTerm(searchTerm);
		setError(null);
		let result = await apiFetch(
			'ens',
			'search',
			{
				domainName: searchTerm,
				page: page,
			},
			'GET'
		);
		setHasMoreSearchResults(result.nextPage === true);
		if (page > 0)
			setENS((prev) => {
				return [...prev, ...result.nfts];
			});
		else setENS(result.nfts || []);
	};

	let getCount = async () => {
		setLoading(true);
		setError(null);
		let result = await apiFetch(
			'ens',
			'count',
			{
				address: context.walletAddress,
			},
			'GET'
		);
		setCount(result.count);
		setTotalPages(result.pages);
		setPageMax(result.pageMax);
		setLoading(false);
		return result.count;
	};

	useEffect(() => {
		if (!context.loaded || !loginContext.isSignedIn) return;

		if (searchTerm === '') getAllEns().catch((err) => setError(err));
		else searchENS().catch((err) => setError(err));

		if (!hasSearched) storage.setPagePreference('page', page);
	}, [page]);

	useEffect(() => {
		if (!context.loaded || !loginContext.isSignedIn) return;
		if (searchTerm === '' && lastSearchTerm !== '') {
			setPage(0);
			getAllEns().catch((err) => setError(err));
		}

		storage.setPagePreference('searchTerm', searchTerm);
	}, [searchTerm]);

	useEffect(() => {
		if (!context.loaded || !loginContext.loaded) return;
		if (!loginContext.isSignedIn) return;

		let main = async () => {
			let count = await getCount();
			if (count > 0) getAllEns();
			else {
				if (!storage.getPagePreference('firstTime')) {
					await fetchENS();
					storage.setPagePreference('firstTime', true);
				}
			}
		};

		main()
			.catch((err) => {
				console.error(err);
				setError(err);
			})
			.finally(() => {
				setLoading(false);
			});
	}, [context, loginContext]);

	useEffect(() => {
		const func = (e) => {
			if (e.key === 'ArrowLeft')
				setPage((val) => {
					return val - 1 >= 0 ? val - 1 : val;
				});

			if (e.key === 'ArrowRight')
				setPage((val) => {
					if (val + 1 < Math.ceil(count / pageMax)) return val + 1;
					return val;
				});
		};

		document.addEventListener('keydown', func);

		return () => {
			document.removeEventListener('keydown', func);
		};
	}, []);

	let renderedEns = (ens || [])
		.filter((item, index) => {
			let filtered = false;
			if (
				filterTerm.length > 0 &&
				!item.domainName
					.toLowerCase()
					.includes(filterTerm.toLowerCase())
			)
				filtered = true;

			if (hasSearched && filtered) return false;

			return true;
		})
		.map((item, index) => {
			let filtered = false;
			if (
				filterTerm.length > 0 &&
				!item.domainName
					.toLowerCase()
					.includes(filterTerm.toLowerCase())
			)
				filtered = true;

			return (
				<div
					className="col-span-1 row-span-1 bg-white rounded-lg shadow-lg p-4"
					style={{
						opacity: filtered ? 0.5 : 1,
					}}
					key={index}
				>
					<div
						className={
							'flex flex-col' +
							(item.domainName === searchTerm
								? 'border-amber-400'
								: '')
						}
					>
						<div className="text-2xl font-bold text-black">
							{item.domainName.length > 16 ? (
								<>
									{item.domainName.substring(0, 16)}
									...
								</>
							) : (
								<>{item.domainName}</>
							)}
						</div>
						<div className="text-2xl font-bold text-black">
							{item.FakeRegistry ? (
								<span className="badge bg-error text-black">
									Has Fake Registry
								</span>
							) : null}
							{item.Stats ? (
								<span
									className={
										'badge text-black ' +
										(item.Stats.totalViews <= 0
											? 'bg-error'
											: 'bg-success')
									}
								>
									{item.Stats.totalViews} views
								</span>
							) : null}

							<span
								className={
									'ms-2 badge text-black ' +
									((item.managerCount || 0) === 0
										? 'bg-warning'
										: 'bg-success')
								}
							>
								{item.managerCount || 0} Managers
							</span>
						</div>
						<div className="text-sm text-gray-500 break-all hidden lg:block mt-2">
							{item.nftDescription &&
							item.nftDescription.length > 28 ? (
								<div>
									{item.nftDescription.substring(0, 28)}
									...
								</div>
							) : (
								<div>{item.nftDescription}</div>
							)}
							{!item.nftDescription ? <div>⚪️</div> : null}
						</div>
						{item.nftMedia ? (
							<img
								onError={(e) => {
									let target = e.target as HTMLImageElement;
									target.src = '/img/0x0zLogo.jpg';
								}}
								src={
									item.nftMedia[0]?.raw || '/img/0x0zLogo.jpg'
								}
								width="100%"
								height="100%"
								alt="avatar"
								className="mt-2 border-2 border-gray-500 rounded-lg flex items-center justify-center"
							/>
						) : null}

						<div className="flex flex-row gap-2 mt-2">
							<button
								title="Buidl a page with Dream🎨.eth"
								hidden={item.domainName.includes(
									'Untitled Token'
								)}
								className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
								onClick={() => {
									history.push(`/ide?url=${item.domainName}`);
								}}
							>
								🖌
							</button>
							<button
								className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
								onClick={() => {
									history.push(`/ide?url=${item.domainName}`);
								}}
							>
								👁️
							</button>
							<button
								className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
								onClick={() => {
									history.push(`/view/${item.domainName}`);
								}}
							>
								➡️
							</button>
						</div>
					</div>
				</div>
			);
		});

	return (
		<div
			data-theme={
				storage.getGlobalPreference('defaultTheme') ||
				config.defaultTheme ||
				'forest'
			}
		>
			<Navbar />
			{error ? (
				<div className="max-w-screen mx-auto px-4 sm:px-6 lg:px-8 bg-error p-2">
					<div className="max-w-3xl mx-auto text-black">
						<div className="text-center">
							<h2 className="text-3xl font-extrabold">Error</h2>
							<p className="mt-2 text-lg">
								{error?.message || 'Please try again later...'}
							</p>
						</div>
					</div>
				</div>
			) : null}
			<div className="flex flex-col md:flex-row justify-center md:justify-between items-center p-2 mt-5 pt-5 gap-4">
				<div className="flex flex-row justify-start items-center gap-4">
					<div className="hidden flex flex-col pl-4 lg:block pr-2">
						<div className="text-2xl font-bold">Properties</div>
						<div className="text-sm text-gray-500">
							Total: {count}
						</div>
					</div>
					<div className="flex flex-col pl-4 hidden lg:block">
						<input
							disabled={!loginContext.isSignedIn}
							data-loading={loading}
							className="bg-gray-200 h-full appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white"
							id="domain"
							type="text"
							placeholder="🔦 Filter Name..."
							onChange={(e) => {
								setFilterTerm(e.target.value);
							}}
						/>
					</div>
					<div className="flex flex-col hidden lg:block">
						<select className="bg-gray-200 h-full appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white">
							<option value="all">All</option>
							<option value="owned">No Fake Registry</option>
							<option value="owned">No Content Hash</option>
							<option value="owned">Has Managers</option>
						</select>
					</div>
				</div>
				<div
					className="flex flex-row justify-center items-center gap-5"
					hidden={hasSearched}
				>
					<div className="btn-group">
						<button
							disabled={page === 0}
							className="btn btn-primary"
							onClick={() => {
								setPage(page - 1);
							}}
						>
							Previous
						</button>

						{(() => {
							let buttons = [];
							for (let i = 0; i < totalPages; i++) {
								buttons.push(
									<button
										className={`btn ${
											page === i
												? 'btn-primary'
												: 'btn-secondary'
										}`}
										onClick={() => {
											setPage(i);
										}}
									>
										{i}
									</button>
								);
							}
							return buttons;
						})()}

						<button
							disabled={page + 1 >= Math.ceil(count / pageMax)}
							className="btn btn-primary"
							onClick={() => {
								setPage(page + 1);
							}}
						>
							Next
						</button>
					</div>
				</div>
				<div className="flex flex-row gap-2 pr-0 md:pr-5">
					<input
						disabled={!loginContext.isSignedIn}
						data-loading={loading}
						className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white"
						id="domain"
						type="text"
						placeholder="🔎 Search Name..."
						onKeyDown={(e) => {
							if (e.key === 'Enter') {
								setSearchTerm(
									(e.target as HTMLInputElement).value
								);
								setPage(0);
								searchENS().catch((err) => {
									setError(err);
								});
							}
						}}
						onChange={(e) => {
							setSearchTerm(e.target.value);
						}}
					/>
					<button
						disabled={loading || !loginContext.isSignedIn}
						data-loading={loading}
						className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
						onClick={async () => {
							setPage(0);
							searchENS().catch((err) => {
								setError(err);
							});
						}}
					>
						SEARCH
					</button>
				</div>
			</div>
			{loading ? (
				<div className="p-2">
					<Loading
						showLoadingBar={false}
						loadingReason="Fetching your ENS from the Virtual Web3 Registry."
					/>
				</div>
			) : (
				<div className="p-2 mt-2">
					<div className="p-2 hidden md:block mt-2">
						<div className="divider">
							{context.ensAddresses[0]}
							<span className="bg-alert p-2 text-1">
								{context.walletAddress}
							</span>
						</div>
					</div>
					<div className="grid gap-4 grid-flow-row-dense grid-cols-1 md:grid-cols-3 lg:grid-cols-5 grid-rows-3 p-4 mx-auto min-h-screen">
						{renderedEns.length > 0 ? (
							<>{renderedEns}</>
						) : (
							<>
								{loginContext.isSignedIn &&
								ens.length === 0 &&
								hasSearched ? (
									<div className="col-span-1 md:col-span-2 lg:col-span-5 row-span-1">
										<div className="flex flex-col justify-center text-center">
											<h2 className="text-2xl font-bold">
												We've come up dry trying to find
												"{lastSearchTerm}"
											</h2>
											<p className="text-sm text-gray-500 ">
												We search through the title of
												the domain and also the
												description.
											</p>
										</div>
									</div>
								) : (
									<></>
								)}
								{loginContext.isSignedIn &&
								filterTerm.length !== 0 &&
								hasSearched ? (
									<div className="col-span-1 md:col-span-2 lg:col-span-5 row-span-1">
										<div className="flex flex-col justify-center text-center">
											<h2 className="text-2xl font-bold">
												Your filter has found nothing
												called "{filterTerm}"
											</h2>
											<p className="text-sm text-gray-500 ">
												Try something else!
											</p>
										</div>
									</div>
								) : (
									<></>
								)}
								{loginContext.isSignedIn ? (
									<div
										className="col-span-1 md:col-span-3 lg:col-span-5 row-span-1"
										hidden={hasSearched}
									>
										<div className="flex flex-col justify-center items-center">
											<div className="text-2xl font-bold">
												No ENS addresses found!
											</div>
											<div className="text-sm text-gray-500 text-center">
												We use an external API to
												collect your mints which can
												sometimes render innaccurately.
												Please be aware that this only
												shows{' '}
												<u>
													ENS properties that you own!
												</u>
												<br />
												Tap the 'Fetch' button next to
												the search bar to fetch your ENS
												properties.
											</div>
											<div className="flex flex-row gap-2 mt-2">
												<button
													disabled={
														loading ||
														!loginContext.isSignedIn
													}
													className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
													onClick={() => {
														fetchENS()
															.catch((error) => {
																setError(error);
															})
															.finally(() => {
																setLoading(
																	false
																);
															});
													}}
												>
													Fetch
												</button>
											</div>
										</div>
									</div>
								) : (
									<div className="col-span-1 md:col-span-3 lg:col-span-5 row-span-1">
										<div className="flex flex-col justify-center items-center">
											<div className="text-2xl font-bold">
												Please Login To View Your
												Properties
											</div>
											<div className="text-sm text-gray-500">
												You will need to login to load
												all of your properties so that
												you can let the 🍬LAND.eth
												Landscaping Service get to work
												for you DEGEN!
											</div>
											<button
												className="bg-success text-white font-bold py-2 px-4 rounded mt-2"
												onClick={() => {
													setShouldShowLogin(true);
												}}
											>
												Login 🔑
											</button>
										</div>
									</div>
								)}
							</>
						)}
						{hasSearched &&
						hasMoreSearchResults &&
						renderedEns.length > 0 ? (
							<div className="p-2">
								<button
									className="btn btn-primary"
									onClick={async () => {
										if (
											page + 1 <
											Math.ceil(count / pageMax)
										)
											setPage(page + 1);
									}}
								>
									Load More
								</button>
							</div>
						) : null}
					</div>
				</div>
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
