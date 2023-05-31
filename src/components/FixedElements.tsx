/* eslint-disable react/prop-types */
import React, { useContext, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import ErrorIcon from './Icons/ErrorIcon';
import { Web3Context } from '../contexts/web3Context';
import { ENSContext } from '../contexts/ensContext';
import { useHistory } from 'react-router-dom';
import storage from '../storage';
import config from '../config';
import WebEvents from '../webEvents';

function FixedElements({
	onSettings,
	hideAlerts = false,
	hideSettings = false,
	hideFooter = false,
	hideUserInfo = false,
	hideOwnership = false,
	useFixed = true,
	children = null,
	linkHref = null,
}: {
	onSettings?: () => void;
	hideAlerts?: boolean;
	hideSettings?: boolean;
	hideFooter?: boolean;
	hideUserInfo?: boolean;
	hideOwnership?: boolean;
	useFixed?: boolean;
	children?: any;
	linkHref?: string;
}) {
	const context = useContext(Web3Context);
	const ensContext = useContext(ENSContext);
	const errorRef = useRef(null);
	const ensErrorRef = useRef(null);
	const [showHud, setShowHud] = useState(
		storage.getGlobalPreference('hideAlerts')
	);
	const hudRef = useRef(null);
	const history = useHistory();

	useEffect(() => {
		if (hudRef.current !== null) {
			if (storage.getGlobalPreference('hideAlerts')) {
				hudRef.current.style.display = 'none';
			} else hudRef.current.style.display = 'flex';
		}
	});

	const toggleHud = () => {
		if (
			hudRef.current.style.display === 'block' ||
			hudRef.current.style.display === 'none'
		) {
			hudRef.current.style.display = 'flex';
		} else hudRef.current.style.display = 'none';

		storage.setGlobalPreference('hideAlerts', !showHud);
		storage.saveData();
		setShowHud(!showHud);
	};

	return (
		<>
			{/** Element for the Wallet Error */}
			<div
				className="fixed top-0 left-0 z-50 flex flex-col gap-2 md:flex-row lg:flex-row p-2 max-h-[5rem]"
				ref={hudRef}
			>
				<div
					className="alert alert-info shadow-lg p-2 opacity-70 hover:opacity-100 cursor-pointer w-auto"
					hidden={
						!ensContext.loaded ||
						ensContext.ensError !== null ||
						!context.loaded ||
						!context.walletConnected ||
						hideAlerts ||
						hideUserInfo ||
						hideOwnership ||
						ensContext.owner?.toLowerCase() !==
							context.accounts[0]?.toLowerCase()
					}
				>
					<div
						className="text-center"
						onClick={() => {
							history.push(
								`/ide?url=${ensContext.currentEnsAddress}`
							);
						}}
					>
						<span className="text-4xl">
							<b>✏️</b>
						</span>
					</div>
				</div>
				<div
					className="alert alert-error shadow-lg p-4 opacity-70 hover:opacity-100 cursor-pointer w-auto"
					onClick={() => {
						ensErrorRef.current.hidden = true;
					}}
					ref={ensErrorRef}
					hidden={
						ensContext.ensError === null ||
						hideAlerts ||
						hideUserInfo ||
						ensContext.currentEnsAddress === null
					}
				>
					<div className="word-wrap">
						<ErrorIcon />
						<span>
							<b>
								{ensContext.ensError?.message ||
									ensContext?.ensError?.toString()}
							</b>
						</span>
					</div>
				</div>
				{context.walletConnected ? (
					<div
						hidden={hideAlerts || hideUserInfo}
						className="alert alert-success shadow-lg p-2 cursor-pointer opacity-70 hover:opacity-100 w-auto"
						onClick={() => {
							history.push(
								`/view/${
									context.ensAddresses[0] ||
									context.accounts[0]
								}`
							);
						}}
					>
						<div className="word-wrap">
							<span>
								<b>{context.ensAddresses[0] || 'Connected'}</b>
							</span>
						</div>
					</div>
				) : (
					<></>
				)}
				{children}
			</div>

			{/** 0x0zLogo */}
			<div className="fixed top-0 right-0 z-50" hidden={hideSettings}>
				<div className="flex flex-row items-start gap-4">
					{context.walletError ? (
						<div
							ref={errorRef}
							hidden={hideAlerts}
							className="alert alert-error shadow-lg animate-bounce p-4 mb-2 mt-4 opacity-70 hover:opacity-100 cursor-pointer w-auto"
							onClick={async () => {
								try {
									await config.onboard.walletSelect();
									await config.onboard.walletCheck();
									WebEvents.emit('reload');
								} catch (error) {
									console.log(error);
								}
							}}
						>
							<ErrorIcon />
							<span className="text-1xl hidden md:block lg:block">
								<b className="mr-2">No Web3 Session</b>
								{context.walletError?.message ||
									context.walletError?.toString() ||
									"We don't know why!"}
							</span>
						</div>
					) : (
						<></>
					)}
					<div>
						<img
							src={ensContext.avatar || '/img/0x0zLogo.jpg'}
							alt="Magic🪞"
							className="w-24 cursor-pointer"
							onClick={() => {
								if (linkHref !== null) {
									history.push(linkHref);
									return;
								}

								ensContext.currentEnsAddress !== null
									? history.push(
											'/view/' +
												ensContext.currentEnsAddress
									  )
									: history.push('/');
							}}
						/>
						<div className="flex flex-col" hidden={!showHud}>
							<button
								className="btn btn-square rounded-none bg-black border-none text-white w-full hover:text-white hover:bg-pink-500"
								onClick={onSettings}
								title="⚙️Settings.eth"
							>
								⚙️
							</button>
							<button
								className="btn btn-square rounded-none bg-black border-none text-white w-full hover:text-white hover:bg-pink-500"
								onClick={() => {
									history.push('/');
								}}
								title="🪞Magic.eth"
							>
								🪞
							</button>
							<button
								className="btn btn-square rounded-none bg-black border-none text-white w-full hover:text-white hover:bg-pink-500"
								onClick={() => {
									history.push('/ide?dream=true');
								}}
								title="Dream🎨.eth"
							>
								🎨
							</button>
							<button
								className="btn btn-square rounded-none bg-black border-none text-white w-full hover:text-white hover:bg-pink-500"
								onClick={() => {
									history.push('/ide?bot=army');
								}}
								title="🤖Army.eth"
							>
								🤖
							</button>
							<button
								className="btn btn-square rounded-none bg-black border-none text-white w-full hover:text-white hover:bg-pink-500"
								onClick={() => {
									history.push('/properties');
								}}
								title="🍬Land.eth"
							>
								🍬
							</button>
							<button
								className="btn btn-square rounded-none bg-black border-none text-white w-full hover:text-white hover:bg-pink-500"
								onClick={() => {
									history.push('/utilities/');
								}}
								title="🧰time.eth"
							>
								🧰
							</button>
							<button
								className="btn btn-square rounded-none bg-black border-none text-white w-full hover:text-white hover:bg-pink-500"
								onClick={() => {
									history.goBack();
								}}
								title="go back"
							>
								🔙
							</button>
							<button
								className="btn btn-square rounded-none bg-black border-none text-white w-full hover:text-white hover:bg-pink-500"
								onClick={() => {
									history.goForward();
								}}
								title="go foward"
							>
								🔜
							</button>
							<button
								className={
									'btn btn-square rounded-none border-none text-white w-full hover:text-white hover:bg-pink-500 ' +
									(!showHud ? 'bg-pink-500' : 'bg-black')
								}
								onClick={toggleHud}
								title="Close Menu"
							>
								{showHud ? 'ᐃ' : 'ᐁ'}
							</button>
						</div>
						<div className="flex flex-col" hidden={showHud}>
							<button
								className={
									'btn btn-square rounded-none border-none text-white w-full hover:text-white hover:bg-pink-500 bg-black'
								}
								onClick={toggleHud}
								title="Open Menu"
							>
								{showHud ? 'ᐃ' : 'ᐁ'}
							</button>
						</div>
					</div>
				</div>
			</div>
			{/** Footer */}
			{useFixed ? (
				<div className="fixed bottom-0 w-full z-50" hidden={hideFooter}>
					<div className="flex flex-col">
						<div className="w-full bg-black text-accent text-center p-4">
							{' '}
							Created by{' '}
							<a
								href="https://twitter.com/0x0zAgency/"
								className="text-yellow-100 underline"
							>
								0x0z
							</a>
							. Come check out our{' '}
							<a
								href="https://github.com/0x0zAgency/"
								className="text-yellow-100 underline"
							>
								GitHub
							</a>
							. Made with <u className="text-error">love</u> by{' '}
							<a
								href="/view/0xTinman.eth"
								className="text-yellow-400 underline"
							>
								🤖.0xTinman.eth
							</a>{' '}
							-{' '}
							<a
								href="/view/0xWizardof0z.eth"
								className="text-yellow-400 underline"
							>
								🧙🏼‍♂️.0xWizardof0z.eth
							</a>
							.
						</div>
					</div>
				</div>
			) : (
				<footer
					hidden={hideFooter}
					className="flex justify-around footer z-50 p-4 bg-black"
				>
					<div className="flex my-auto justify-center text-accent items-center">
						<img
							width={48}
							alt="0x0z logo"
							style={{ mixBlendMode: 'exclusion' }}
							src="/img/0x0zLogoTransparentWhite.png"
						/>
						<p>
							Created by 0x0z.
							<br />
							Made with ❤️ by{' '}
							<a
								href="/view/0xTinman.eth"
								className="text-yellow-100 underline"
							>
								0xTinman.eth
							</a>{' '}
							-
							<a
								href="/view/0xWizardof0z.eth"
								className="text-yellow-100 underline"
							>
								0xWizardof0z.eth
							</a>
						</p>
					</div>
					<div>
						<span className="footer-title"></span>
						<div className="grid grid-flow-col gap-4">
							<a href="https://twitter.com/0x0zAgency">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="24"
									viewBox="0 0 24 24"
									className="fill-current"
								>
									<path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
								</svg>
							</a>
							<a href="https://github.com/0x0zAgency">
								<svg
									width="24px"
									height="24px"
									className="fill-current"
									viewBox="0 -3.5 256 256"
									xmlns="http://www.w3.org/2000/svg"
									preserveAspectRatio="xMinYMin meet"
								>
									<path d="M127.505 0C57.095 0 0 57.085 0 127.505c0 56.336 36.534 104.13 87.196 120.99 6.372 1.18 8.712-2.766 8.712-6.134 0-3.04-.119-13.085-.173-23.739-35.473 7.713-42.958-15.044-42.958-15.044-5.8-14.738-14.157-18.656-14.157-18.656-11.568-7.914.872-7.752.872-7.752 12.804.9 19.546 13.14 19.546 13.14 11.372 19.493 29.828 13.857 37.104 10.6 1.144-8.242 4.449-13.866 8.095-17.05-28.32-3.225-58.092-14.158-58.092-63.014 0-13.92 4.981-25.295 13.138-34.224-1.324-3.212-5.688-16.18 1.235-33.743 0 0 10.707-3.427 35.073 13.07 10.17-2.826 21.078-4.242 31.914-4.29 10.836.048 21.752 1.464 31.942 4.29 24.337-16.497 35.029-13.07 35.029-13.07 6.94 17.563 2.574 30.531 1.25 33.743 8.175 8.929 13.122 20.303 13.122 34.224 0 48.972-29.828 59.756-58.22 62.912 4.573 3.957 8.648 11.717 8.648 23.612 0 17.06-.148 30.791-.148 34.991 0 3.393 2.295 7.369 8.759 6.117 50.634-16.879 87.122-64.656 87.122-120.973C255.009 57.085 197.922 0 127.505 0" />
									<path d="M47.755 181.634c-.28.633-1.278.823-2.185.389-.925-.416-1.445-1.28-1.145-1.916.275-.652 1.273-.834 2.196-.396.927.415 1.455 1.287 1.134 1.923M54.027 187.23c-.608.564-1.797.302-2.604-.589-.834-.889-.99-2.077-.373-2.65.627-.563 1.78-.3 2.616.59.834.899.996 2.08.36 2.65M58.33 194.39c-.782.543-2.06.034-2.849-1.1-.781-1.133-.781-2.493.017-3.038.792-.545 2.05-.055 2.85 1.07.78 1.153.78 2.513-.019 3.069M65.606 202.683c-.699.77-2.187.564-3.277-.488-1.114-1.028-1.425-2.487-.724-3.258.707-.772 2.204-.555 3.302.488 1.107 1.026 1.445 2.496.7 3.258M75.01 205.483c-.307.998-1.741 1.452-3.185 1.028-1.442-.437-2.386-1.607-2.095-2.616.3-1.005 1.74-1.478 3.195-1.024 1.44.435 2.386 1.596 2.086 2.612M85.714 206.67c.036 1.052-1.189 1.924-2.705 1.943-1.525.033-2.758-.818-2.774-1.852 0-1.062 1.197-1.926 2.721-1.951 1.516-.03 2.758.815 2.758 1.86M96.228 206.267c.182 1.026-.872 2.08-2.377 2.36-1.48.27-2.85-.363-3.039-1.38-.184-1.052.89-2.105 2.367-2.378 1.508-.262 2.857.355 3.049 1.398" />
								</svg>
							</a>
						</div>
					</div>
				</footer>
			)}
		</>
	);
}

FixedElements.propTypes = {
	onSettings: PropTypes.func,
	walletError: PropTypes.object,
};
export default FixedElements;
