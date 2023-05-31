/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useRef, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import storage from '../storage';
import { Web3Context } from '../contexts/web3Context';
import WebEvents from '../webEvents';
import HeartIcon from '../components/Icons/HeartIcon';
import ViewIcon from '../components/Icons/ViewIcon';
import config from '../config';
import { getProvider, recreateProvider } from '../ipfs';
import Loading from '../components/Loading';
import { Web3ContextType } from '../contexts/web3Context';
import { ENSContext } from '../contexts/ensContext';
import { setENSContentHash } from '../helpers';
import { renderHTML } from '../components/HTMLRenderer';

const avatars = {
	html: '/img/html.png',
	css: '/img/css.png',
	js: '/img/js.png',
	javascript: '/img/js.png',
	ts: '/img/ts.png',
	json: '/img/json.png',
};

function PublishModal({
	hidden,
	onHide,
	savedData = {},
	tabs = {},
	onSettings,
}) {
	const context = useContext<Web3ContextType>(Web3Context);
	const ensContext = useContext(ENSContext);

	const [loading, setLoading] = useState(false);
	const [savedCid, setSavedCid] = useState(storage.getPagePreference('cid'));
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(false);

	const setContentHash = async (cid) => {
		setLoading(true);

		await setENSContentHash(
			ensContext.currentEnsAddress,
			ensContext.resolverAddress,
			cid,
			context.web3Provider,
			context.signer
		);

		storage.setPagePreference('cid', undefined);
		storage.saveData();

		setSavedCid(null);
		setSuccess(true);
		setTimeout(() => {
			setSuccess(false);
		}, 3000);
		setLoading(false);
	};

	const publish = async () => {
		setLoading(true);

		let ipfsProvider = getProvider('web3-storage');
		let files = Object.values(tabs).map((tab: any) => {
			let name = tab.name;

			switch (tab.language) {
				case 'html':
					name = 'index.partial';
					break;
				case 'css':
					name = 'css.partial';
					break;
				case 'js':
				case 'javascript':
					name = 'js.partial';
					break;
				case 'ts':
					name = 'script.partial';
					break;
				case 'json':
					name = '.xens';
			}

			return {
				name: name,
				data: tab.code,
				type: ipfsProvider.getContentType(tab.language),
			};
		});

		//get xens file
		let xensFile = files.find((file) => file.name === '.xens');
		if (xensFile) {
			let xens = JSON.parse(xensFile.data);

			if (xens.direct) {
				//construct index.html
				let html = files.find((file) => file.name === 'index.partial');
				let css = files.find((file) => file.name === 'css.partial');
				let js = files.find((file) => file.name === 'js.partial');

				let code = {
					html: html ? html.data : '',
					css: css ? css.data : '',
					js: js ? js.data : '',
				};

				files.push({
					name: 'index.html',
					data: renderHTML(code, [], [], [], ensContext),
					type: ipfsProvider.getContentType('html'),
				});
			}
		}

		let cid = await ipfsProvider.uploadFiles(files);

		storage.setPagePreference('cid', cid);
		storage.saveData();

		setSavedCid(cid);
		setLoading(false);
	};

	// Disables scrolling while this modal is active
	useEffect(() => {
		if (!hidden) document.body.style.overflow = 'hidden';
		else document.body.style.overflow = 'auto';
	}, [hidden]);

	let tabSize = Object.values(tabs || {}).length;
	let contents = '';
	let size = 0;
	let limit = config.fileSizeLimit; //10mb limit
	Object.values(tabs).forEach((tab: any) => {
		console.log(tab);
		contents += tab.code;
		tab.size = new Blob([tab.code]).size;
		tab.size = (tab.size / 1024 / 1024).toFixed(3);
	});
	size = new Blob([contents]).size;
	size = parseFloat((size / 1024 / 1024).toFixed(3));

	let totalPercent = Math.floor((size / limit) * 100);
	let tabKeys = Object.keys(tabs);

	return (
		<div
			data-theme={
				storage.getGlobalPreference('defaultTheme') ||
				config.defaultTheme ||
				'forest'
			}
			className="mx-auto sm:w-3/5 md:w-3/5 lg:w-4/5 fixed inset-0 flex items-center overflow-y-auto z-50 bg-transparent"
			hidden={hidden}
		>
			{loading ? (
				<div className="bg-white rounded-md w-full overflow-y-auto max-h-screen shadow shadow-lg border-2">
					<div className="flex flex-col w-full">
						<Loading />
					</div>
				</div>
			) : (
				<>
					{savedCid ? (
						<>
							<div className="bg-white rounded-md w-full overflow-y-auto max-h-screen shadow shadow-lg border-2">
								<div className="flex flex-col w-full">
									{error ? (
										<div className="bg-red-400 p-2 text-black text-3xl mb-2">
											<b>🚨</b>
										</div>
									) : (
										<>
											<div className="bg-pink-400 p-2 text-black text-3xl mb-2">
												<b>🌟</b>
											</div>
											<p className="text-center text-3xl text-black">
												Your content has been uploaded
												to IPFS!
											</p>
										</>
									)}

									{error ? (
										<p className="text-center text-3xl text-black">
											There was an issue with that
											transaction. Please check etherscan.
										</p>
									) : (
										<></>
									)}

									<p
										className="text-center bg-black text-white"
										style={{
											cursor: 'pointer',
										}}
										onClick={() => {
											window.open(
												`https://w3s.link/ipfs/${savedCid}`,
												'_blank'
											);
										}}
									>
										https://w3s.link/ipfs/{savedCid}
									</p>
									<p className="text-black text-center p-2">
										You are nearly done! Simply press the
										button below to update your ens content
										hash!
									</p>

									<div className="btn-group w-full mt-2 mb-2 p-2">
										<button
											className="btn btn-primary"
											disabled={
												ensContext.owner !==
												context.walletAddress
											}
											onClick={() => {
												setError(null);
												setContentHash(savedCid).catch(
													(error) => {
														console.log(error);
														setError(error);
														setLoading(false);
													}
												);
											}}
										>
											Update ENS Content Hash
										</button>
										<button
											className="btn"
											onClick={() => {
												setError(null);
												publish().catch((error) => {
													console.log(error);
													setError(error);
													setLoading(false);
												});
											}}
										>
											Reupload To IPFS
										</button>
										<button
											className="btn"
											onClick={() => {
												if (onHide) onHide();
											}}
										>
											Maybe Later..
										</button>
									</div>
								</div>
							</div>
						</>
					) : (
						<div className="bg-white rounded-md w-full overflow-y-auto max-h-screen shadow shadow-lg border-2">
							<div className="flex flex-col w-full">
								<div className="bg-pink-400 p-2 text-black text-3xl">
									<b>🌟</b>
								</div>
								{success ? (
									<p className="text-center text-3xl text-black">
										Your content hash has been updated!
									</p>
								) : (
									<></>
								)}
								{error ? (
									<p className="text-center text-3xl text-black mt-2">
										There was an issue uploading your stuff
										to IPFS. Please check that that your
										IPFS settings are correct.
									</p>
								) : (
									<></>
								)}

								<div className="flex flex-col p-2 w-full mt-2">
									<div className="stats shadow">
										<div className="stat">
											<div className="stat-figure text-primary">
												<HeartIcon />
											</div>
											<div className="stat-title">
												Files
											</div>
											<div className="stat-value text-primary">
												{tabSize}
											</div>
										</div>

										<div className="stat">
											<div className="stat-figure text-primary">
												<ViewIcon />
											</div>
											<div className="stat-title">
												Paypload Size
											</div>
											<div className="stat-value text-primary">
												{size}mb
											</div>
											<div className="stat-desc">
												{totalPercent}% of limit (
												{config.fileSizeLimit}mb)
											</div>
										</div>
									</div>
									<div className="overflow-x-auto w-full mt-4">
										<table className="table w-full">
											<thead>
												<tr>
													<th />
													<th>Name</th>
													<th>Size</th>
													<th />
												</tr>
											</thead>
											<tbody>
												{Object.values(tabs).map(
													(
														tab: any,
														index: number
													) => {
														return (
															<tr key={index}>
																<th className="text-center">
																	<label>
																		✅
																	</label>
																</th>
																<td>
																	<div className="flex items-center space-x-3">
																		<div className="avatar">
																			<div className="mask mask-squircle w-12 h-12">
																				<img
																					src={
																						avatars[
																							tab
																								.language
																						]
																					}
																					alt="Avatar Tailwind CSS Component"
																				/>
																			</div>
																		</div>
																		<div>
																			<div className="font-bold">
																				{tab.language.toUpperCase()}
																			</div>
																			<div className="text-sm opacity-50">
																				{
																					tab.name
																				}{' '}
																				-{' '}
																				{
																					tabKeys[
																						index
																					]
																				}
																			</div>
																		</div>
																	</div>
																</td>
																<td>
																	{tab.size}mb
																</td>
																<th></th>
															</tr>
														);
													}
												)}
											</tbody>
										</table>
									</div>
									{totalPercent > 100 ? (
										<>
											<div className="text-red-500 text-center mt-3">
												<b>⚠️</b> Your total payload
												size is over the limit of 12mb
											</div>
										</>
									) : (
										<></>
									)}
									{size === 0 ? (
										<>
											<div className="text-red-500 text-center mt-3">
												<b>⚠️</b> All of your files are
												empty
											</div>
										</>
									) : (
										<></>
									)}
									<div className="btn-group w-full mt-2">
										<button
											className="btn"
											disabled={
												totalPercent > 100 ||
												size === 0 ||
												tabSize === 0
											}
											onClick={() => {
												setError(null);
												publish().catch((error) => {
													console.log(error);
													setError(error);
													setLoading(false);
												});
											}}
										>
											Publish
										</button>
										<button
											className="btn"
											onClick={() => {
												if (onSettings) onSettings();
											}}
										>
											Open Settings
										</button>
										<button
											className="btn btn-error"
											onClick={() => {
												if (onHide) onHide();
											}}
										>
											Cancel
										</button>
									</div>
								</div>
							</div>
						</div>
					)}
				</>
			)}
		</div>
	);
}

PublishModal.propTypes = {
	hidden: PropTypes.bool,
	tabs: PropTypes.object,
	onHide: PropTypes.func,
};

export default PublishModal;
