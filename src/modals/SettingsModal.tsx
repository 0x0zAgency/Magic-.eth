import React, { useRef, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import storage from '../storage';
import { Web3Context } from '../contexts/web3Context';
import WebEvents from '../webEvents';
import config from '../config';
import { useHistory } from 'react-router-dom';

function SettingsModal({ hidden, onHide }) {
	const web3StorageRef = useRef(null);
	const ipfsCompanionRef = useRef(null);
	const defaultThemeRef = useRef(null);
	const context = useContext(Web3Context);
	const [currentIPFSProvider, setCurrentIPFSProvider] = useState(
		storage.getGlobalPreference('ipfsProvider') || 'web3.storage'
	);
	const history = useHistory();

	// Disables scrolling while this modal is active
	useEffect(() => {
		if (!hidden) document.body.style.overflow = 'hidden';
		else document.body.style.overflow = 'auto';
	}, [hidden]);

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
			<div className="bg-white rounded-md w-full overflow-y-auto max-h-screen shadow shadow-lg border-2">
				<div className="flex flex-col w-full">
					<div className="bg-yellow-400 p-2 text-black text-3xl">
						<b>⚙️settings.eth</b>
					</div>
					<div className="flex flex-col flex-1 p-3">
						<p className="mt-4 text-black">
							Welcome to ⚙️settings.eth! Here you can configure
							important aspects of your Magic🪞Mirror experience.
						</p>

						<div className="form-control mt-4">
							<p className="text-2xl mb-4 border-b-2 text-black">
								Web3.Storage
							</p>
							<div className="input-group">
								<input
									type="text"
									ref={web3StorageRef}
									defaultValue={
										storage.getGlobalPreference(
											'web3StorageKey'
										) || ''
									}
									placeholder="Enter Web3 Storage Key..."
									className="input input-bordered w-full"
								/>
								<button className="btn bg-black w-[14em] text-white">
									Login to Web3.Storage
								</button>
							</div>
							<button className="btn btn-sm bg-blue-500 mt-2 text-black text-white">
								Check Web3.Storage API Key
							</button>
						</div>
						<div className="form-control mt-4">
							<p className="text-2xl mb-4 text-black border-b-2">
								IPFS Companion / Endpoint
							</p>
							<div className="input-group">
								<input
									type="url"
									defaultValue={
										storage.getGlobalPreference(
											'ipsCompanionEndpoint'
										) || 'http://localhost:5001/api/v0'
									}
									ref={ipfsCompanionRef}
									placeholder="Enter your IPFS Companion Endpoint..."
									className="input input-bordered w-full"
								/>
								<button className="btn bg-black w-[14em] text-white">
									Test Connection
								</button>
							</div>
						</div>
						<p className="text-2xl mb-4 border-b-2 text-black mt-4">
							Prefered IPFS Provider
						</p>
						<div className="btn-group btn-group-vertical">
							<button
								className={`btn ${
									currentIPFSProvider === 'web3-storage' ||
									!currentIPFSProvider
										? 'btn-active'
										: ''
								}`}
								onClick={() => {
									setCurrentIPFSProvider('web3-storage');
								}}
							>
								Web3.Storage{' '}
								<div className="badge badge-warning mx-4">
									Requires Web3.Storage Account
								</div>
							</button>
							<button
								className={`btn ${
									currentIPFSProvider === 'ipfs-http'
										? 'btn-active'
										: ''
								}`}
								onClick={() => {
									setCurrentIPFSProvider('ipfs-http');
								}}
							>
								IPFS Companion
							</button>
							<button
								className={`btn ${
									currentIPFSProvider === 'ipfs-api'
										? 'btn-active'
										: ''
								}`}
								onClick={() => {
									setCurrentIPFSProvider('ipfs-api');
								}}
							>
								Magic🪞
								<div className="badge badge-warning mx-4">
									Requires A Golden 🎫
								</div>
							</button>
						</div>

						{context.walletConnected ? (
							<>
								<p className="text-2xl mb-4 mt-4 text-black border-b-2">
									Connected Accounts
								</p>
								<div className="overflow-x-auto">
									<table className="table w-full mb-2">
										<thead>
											<tr>
												<th />
												<th>ENS Address</th>
												<th>Wallet Address</th>
											</tr>
										</thead>
										<tbody>
											{context.accounts.map(
												(account, index) => {
													return (
														<tr key={index}>
															<th>{index}</th>

															<td
																className="cursor-pointer underline"
																onClick={() => {
																	if (onHide)
																		onHide();
																	history.push(
																		`/view/${context.ensAddresses[index]}`
																	);
																}}
															>
																{context
																	.ensAddresses[
																	index
																] ||
																	'ENS Not Found...'}
															</td>
															<td>{account}</td>
														</tr>
													);
												}
											)}
										</tbody>
									</table>
								</div>
								<button className="btn btn-sm w-full bg-red-500 mt-2 text-white hover:bg-black">
									Disconnect
								</button>
							</>
						) : (
							<></>
						)}
						<div className="form-control mt-4">
							<p className="text-2xl mb-4 border-b-2 text-black">
								Default Frame
							</p>
							<div className="input-group">
								<select
									className="select w-full"
									ref={defaultThemeRef}
									defaultValue={
										storage.getGlobalPreference(
											'defaultTheme'
										) || config.defaultTheme
									}
								>
									{config.themes.map((theme, index) => {
										return (
											<option key={index} value={theme}>
												{theme}
											</option>
										);
									})}
								</select>
							</div>
						</div>
						<p className="mt-4 text-black">
							More information on what this means can{' '}
							<a href="?" className="underline text-yellow-500">
								be found here
							</a>
							.
						</p>
						<button
							className="btn bg-success text-white mt-4 hover:bg-black animate-pulse hover:animate-none"
							onClick={() => {
								storage.setGlobalPreference(
									'web3StorageKey',
									web3StorageRef.current.value
								);
								storage.setGlobalPreference(
									'ipsCompanionEndpoint',
									ipfsCompanionRef.current.value
								);
								storage.setGlobalPreference(
									'defaultTheme',
									defaultThemeRef.current.value
								);
								storage.setGlobalPreference(
									'ipfsProvider',
									currentIPFSProvider
								);
								storage.saveData();
								WebEvents.emit('reload');
								if (onHide) onHide();
							}}
						>
							Save & Close
						</button>
						<button
							className="btn bg-red-500 text-white mt-4 hover:bg-black"
							onClick={() => {
								setCurrentIPFSProvider(
									storage.getGlobalPreference(
										'ipfsProvider'
									) || 'web3-storage'
								);
								ipfsCompanionRef.current.value =
									storage.getGlobalPreference(
										'ipsCompanionEndpoint'
									);
								web3StorageRef.current.value =
									storage.getGlobalPreference(
										'web3StorageKey'
									);

								if (onHide) onHide();
							}}
						>
							Cancel
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

SettingsModal.propTypes = {
	hidden: PropTypes.bool,
	onHide: PropTypes.func,
};

export default SettingsModal;
