import React, { useRef, useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-json';
import 'prismjs/themes/prism-dark.css';

import FixedElements from '../components/FixedElements';
import HTMLRenderer from '../components/HTMLRenderer';
import storage from '../storage';
import WebEvents from '../webEvents';
import SettingsModal from '../modals/SettingsModal';
import { useHistory } from 'react-router-dom';
import PublishModal from '../modals/PublishModal';
import ChatGPTModal from '../modals/ChatGPTModal';
import { ENSContext } from '../contexts/ensContext';
import { IPFSDirectory, IPFSStats, getStats, resolveDirectory } from '../ipfs';
import NewProjectModal from '../modals/NewProjectModal';
import { prettifyCode } from '../helpers';
import config from '../config';

const defaultTabs = {
	html: {
		name: '📃',
		icon: 'code',
		language: 'html',
		code: '',
	},
	css: {
		name: '🖌️',
		icon: 'code',
		language: 'css',
		code: '',
	},
	js: {
		name: '🧩',
		icon: 'code',
		language: 'javascript',
		code: '',
	},
	'.xens': {
		name: '📜',
		icon: 'code',
		language: 'json',
		code: '',
	},
};

function IDE({ theme }) {
	const [selectedTab, setSelectedTab] = useState('html');
	// eslint-disable-next-line no-unused-vars
	const [tabs, setTabs] = useState(defaultTabs);
	const [currentCode, setCode] = useState(
		storage.getPagePreference(selectedTab) || tabs[selectedTab].code
	);
	const [showPreview, setShowPreview] = useState(true);
	const [showCode, setShowCode] = useState(true);
	const [codeBuffer, setCodeBuffer] = useState(currentCode);
	const [width, setWidth] = useState(50);
	const [overlayPreview, setOverlayPreview] = React.useState(false);
	const [shouldShowSettings, setShouldShowSettings] = useState(false);
	const [shouldShowPublish, setShouldShowPublish] = useState(false);
	const [shouldShowChatGPT, setShouldShowChatGPT] = useState(false);
	const [shouldShowNewProject, setShouldShowNewProject] = useState(false);
	const [shouldOpenPublishMenu, setShouldOpenPublishMenu] = useState(false);
	const [shouldShowDebug, setShouldShowDebug] = useState(false);
	const [dir, setDir] = useState<IPFSDirectory>(null);
	const [stats, setStats] = useState<IPFSStats>(null);
	const cooldown = useRef(null);
	const savedCode = useRef({} as any);
	const eventEmitterCallbackRef = useRef(null);
	const themeRef = useRef(theme || null);
	const history = useHistory();
	const ensContext = useContext(ENSContext);

	const onResize = () => {
		if (window.innerWidth < 800 && width !== 100) setWidth(100);
	};

	useEffect(() => {
		let _tabs = {
			...tabs,
			html: {
				...tabs.html,
				code: storage.getPagePreference('html') || '',
			},
			css: {
				...tabs.css,
				code: storage.getPagePreference('css') || '',
			},
			js: {
				...tabs.js,
				code: storage.getPagePreference('js') || '',
			},
			'.xens': {
				...tabs['.xens'],
				code: storage.getPagePreference('.xens') || '',
			},
		};

		let allCodeEmpty = false;

		if (
			_tabs.html.code === '' &&
			_tabs.css.code === '' &&
			_tabs.js.code === '' &&
			_tabs['.xens'].code === ''
		) {
			allCodeEmpty = true;
		}
		setTabs(_tabs);

		if (allCodeEmpty) setShouldShowNewProject(true);

		//if the screen is below mobile size, set the width to 100%
		if (window.innerWidth < 900) {
			setWidth(100);
		}

		//on window resize
		window.addEventListener('resize', onResize);

		return () => {
			window.removeEventListener('resize', onResize);
		};
	}, []);

	useEffect(() => {
		//check get params if url exists
		const url = new URL(window.location.href);
		const urlParams = new URLSearchParams(url.search);
		const urlParam = urlParams.get('url');
		const botParam = urlParams.get('bot');
		const dreamParam = urlParams.get('dream');

		if (dreamParam === 'true')
			setShouldShowNewProject(!shouldShowNewProject);
		if (botParam === 'army') setShouldShowChatGPT(!shouldShowPublish);
		if (ensContext.currentEnsAddress !== urlParam)
			ensContext.setCurrentEnsAddress(urlParam);

		if (ensContext.loaded && ensContext.contentHash !== null) {
			(async () => {
				let potentialStats = await getStats(
					ensContext.contentHash,
					null,
					null,
					ensContext.currentEnsAddress
				);
				setStats(potentialStats);
				let potentialDir = await resolveDirectory(
					ensContext.contentHash,
					null,
					null,
					ensContext.currentEnsAddress
				);
				setDir(potentialDir);
			})();
		} else {
			setStats({} as any);
			setDir({} as any);
		}
	}, [ensContext]);

	savedCode.current.css = storage.getPagePreference('css') || '';
	savedCode.current.js = storage.getPagePreference('js') || '';
	savedCode.current[selectedTab] =
		storage.getPagePreference(selectedTab) || currentCode;

	return (
		<div
			data-theme={
				storage.getGlobalPreference('defaultTheme') ||
				config.defaultTheme ||
				'0x0z Light'
			}
		>
			<div className="flex flex-col lg:flex-row w-full overflow-hidden">
				<div
					style={{
						width:
							!overlayPreview && showPreview
								? width + '%'
								: '100%',
						minWidth: '536px',
					}}
					className="w-full overflow-y-scroll overflow-x-hidden min-h-screen max-h-screen"
					hidden={!showCode || (overlayPreview && !showPreview)}
				>
					<div
						className="inline-flex w-full rounded-sm border-1 shadow-sm z-50"
						role="group"
					>
						<button
							className="btn rounded-none bg-warning animate-pulse text-white hover:text-white hover:bg-black hidden md:block lg:block"
							onClick={() => {
								setShouldShowPublish(!shouldShowPublish);
							}}
						>
							PUBLISH
						</button>
						<button
							className="btn rounded-none bg-warning animate-pulse text-white hover:text-white hover:bg-black block md:hidden lg:hidden"
							onClick={() => {
								setShouldShowPublish(!shouldShowPublish);
							}}
						>
							⬆️
						</button>
						{Object.keys(tabs).map((tabIndex, index) => {
							const tab = tabs[tabIndex];
							return (
								<button
									key={index}
									data-selected={selectedTab === tabIndex}
									className="btn rounded-none border-none text-white hover:text-white hover:bg-black"
									onClick={() => {
										clearTimeout(cooldown.current);
										storage.saveData();
										setSelectedTab(tabIndex);
										setCode(
											storage.getPagePreference(
												tabIndex
											) ||
												savedCode.current[tabIndex] ||
												tabs[tabIndex].code
										);
										setTabs({
											...tabs,
											[tabIndex]: {
												...tab,
												code:
													storage.getPagePreference(
														tabIndex
													) || tab.code,
											},
										});
									}}
								>
									{tab.name}
								</button>
							);
						})}
						<button className="btn rounded-none bg-pink-500 text-white hover:text-white hover:bg-black">
							🗃️
						</button>
						<button
							className="btn rounded-none bg-info animate-pulse text-white hover:text-white hover:bg-black"
							onClick={() => {
								setShouldShowChatGPT(!shouldShowPublish);
							}}
							title="🤖Army.eth - Employ the power of AI to build your dWeb project"
						>
							🤖
						</button>
						<button
							className="btn rounded-none bg-primary text-white hover:text-white hover:bg-black"
							onClick={() => {
								setShouldShowNewProject(!shouldShowNewProject);
							}}
							title="Dream🎨.eth - Create a new dream project"
						>
							🎨
						</button>
						<div className="p-1 mx-2 w-[6vw] hidden lg:block">
							<input
								type="range"
								min={35}
								max={85}
								value={width}
								onChange={(e) => {
									//if the screen width is mobile size set the width to 100%
									if (window.innerWidth < 768) {
										setWidth(100);
										return;
									}

									setWidth(parseInt(e.target.value));
								}}
								className="transparent h-1.5 mt-4 w-full cursor-pointer appearance-none rounded-lg border-transparent bg-neutral-200"
							/>
						</div>
						<button
							className="btn rounded-none bg-neutral-200 text-white hover:text-white hover:bg-black hidden lg:block"
							onClick={() => {
								setWidth(50);
							}}
						>
							📱
						</button>
					</div>
					<Editor
						value={currentCode}
						onValueChange={(code) => {
							if (code !== currentCode) setCode(code);
							// Wait for the user to stop typing
							clearTimeout(cooldown.current);
							cooldown.current = setTimeout(() => {
								storage.setPagePreference(selectedTab, code);
								storage.saveData();
								savedCode.current[selectedTab] = code;
								setCodeBuffer(code);
								setTabs({
									...tabs,
									[selectedTab]: {
										...tabs[selectedTab],
										code,
									},
								});
							}, 800);
						}}
						highlight={(code) => {
							try {
								// Make a switch statement for the language
								switch (tabs[selectedTab].language) {
									case 'html':
										return highlight(code, languages.html);
									case 'css':
										return highlight(code, languages.css);
									case 'js':
										return highlight(code, languages.js);
									case 'json':
										return highlight(code, languages.json);
								}
							} catch (error) {}

							return highlight(code, languages.js);
						}}
						padding={24}
						className="z-50 line-numbers"
						spellCheck
						style={{
							fontFamily: '"Fira code", "Fira Mono", monospace',
							fontSize: 12,
							background: 'rgba(0,0,0,0.1)',
							...(!overlayPreview
								? { border: '1px solid black' }
								: {}),
						}}
					/>
				</div>
				<div
					className={'h-full ' + (showPreview ? 'w-full' : 'w-auto')}
					style={{
						width:
							showPreview &&
							!overlayPreview &&
							showCode &&
							width !== 100
								? 100 - width + '%'
								: `${showPreview ? '100' : '0'}%`,
						borderLeft: '1px solid black',
						minWidth: '375px',
						...(overlayPreview
							? {
									position: 'absolute',
									left: '0',
									opacity: 0.4,
									marginTop: 40,
							  }
							: {}),
					}}
				>
					<div
						hidden={!showPreview}
						className="h-full w-full"
						style={{
							...(overlayPreview
								? {
										pointerEvents: 'none',
										touchEvents: 'none',
										paddingTop: 20,
										width: '90%',
										marginLeft: '5%',
										paddingLeft: 20,
								  }
								: {}),
						}}
					>
						{ensContext.loaded && ensContext.ensError !== null ? (
							<>
								<div className="bg-red-500 text-white p-2 rounded-md">
									<p className="font-bold">ENS Error</p>
									<p>{ensContext.ensError}</p>
									<p
										style={{
											fontSize: 10,
										}}
									>
										Preview might contain broken ENS
										information!
									</p>
								</div>
							</>
						) : (
							<></>
						)}
						{ensContext.currentEnsAddress === null ? (
							<>
								<div className="bg-red-500 text-white p-2 rounded-md">
									<p className="font-bold">ENS Error</p>
									<p>No Current ENS</p>
									<p
										style={{
											fontSize: 10,
										}}
									>
										Preview might contain broken ENS
										information!
									</p>
								</div>
							</>
						) : (
							<></>
						)}
						{!shouldShowDebug ? (
							<>
								<HTMLRenderer
									code={savedCode.current}
									stylesheets={[
										'https://cdn.jsdelivr.net/npm/daisyui@2.47.0/dist/full.css',
									]}
									meta={[
										{
											tag: 'title',
											children: 'web3.eth',
										},
									]}
									ensContext={{
										...ensContext,
										setCurrentENSAddress: null,
										resolver: null,
										dir: dir,
										stats: stats,
									}}
									scripts={['https://cdn.tailwindcss.com']}
									style={{
										...(!overlayPreview
											? {
													height: '92vh',
													border: '1px solid black',
											  }
											: {}),
									}}
								/>
							</>
						) : (
							<div>
								<div className="bg-red-500 text-white p-2 rounded-md">
									<p className="font-bold">Debug</p>
									<p>Debug info will be shown</p>
									<p
										style={{
											fontSize: 10,
										}}
									>
										Hide the debug info by clicking the 🐛
										button
									</p>
								</div>
								<div className="bg-gray-700 text-white p-2 rounded-md mt-2">
									<p className="font-bold">
										window.ensContext
									</p>
									<code
										style={{
											fontSize: 12,
											maxHeight: 258,
											overflowY: 'scroll',
										}}
									>
										<pre
											style={{
												maxHeight: 258,
												overflowY: 'scroll',
											}}
										>
											{JSON.stringify(
												{
													...ensContext,
													setCurrentENSAddress: null,
													resolver: null,
													dir: dir,
													stats: stats,
												},
												null,
												2
											)}
										</pre>
									</code>
								</div>
								<div className="flex flex-row items-center justify-center ml-2 mt-2 mb-2">
									<div
										className="flex flex-row items-center justify-center p-2 rounded-md border-2 border-gray-400 cursor-pointer hover:bg-gray-200"
										onClick={() => {
											setShouldShowDebug(false);
										}}
									>
										<p className="text-white">
											Hide Debug Info
										</p>
									</div>
								</div>
							</div>
						)}
					</div>
					<div
						className={
							'w-full bg-gray-700 border-1 border-black p-2 ' +
							(showPreview
								? 'flex flex-col lg:flex-row md:flex-row'
								: 'flex flex-col') +
							' ' +
							(overlayPreview && showPreview ? 'h-40' : '')
						}
					>
						<button
							className="btn rounded-none bg-pink-500 border-none text-white hover:text-white hover:bg-black"
							onClick={() => setShowPreview(!showPreview)}
						>
							{!showPreview ? 'Show Preview' : 'Hide Preview'}
						</button>
						<button
							className="btn rounded-none bg-pink-500 border-none text-white hover:text-white hover:bg-black"
							onClick={() => setShowCode(!showCode)}
						>
							{!showCode ? 'Show Code' : 'Hide Code'}
						</button>
						<button
							className="btn rounded-none bg-pink-500 border-none text-white hover:text-white hover:bg-black"
							onClick={() => setOverlayPreview(!overlayPreview)}
						>
							{!overlayPreview ? 'Overlay' : 'Stop Overlaying'}
						</button>
						<button
							className="btn rounded-none bg-info border-none text-white hover:text-white hover:bg-black"
							title="Save"
						>
							💾
						</button>
						<button
							className="btn rounded-none bg-info border-none text-white hover:text-white hover:bg-black"
							title="Open"
						>
							📁
						</button>
						<button
							className="btn rounded-none bg-info border-none text-white hover:text-white hover:bg-black"
							onClick={() => {
								let newCode = prettifyCode(
									currentCode,
									selectedTab
								);
								setCode(newCode);
								storage.setPagePreference(selectedTab, newCode);
								storage.saveData();
							}}
							title="Prettify🧹Code"
						>
							🧹
						</button>
						<button
							className={
								'btn rounded-none bg-info border-none text-white hover:text-white hover:bg-black ' +
								(shouldShowDebug ? 'bg-success' : 'bg-info')
							}
							onClick={() => {
								setShouldShowDebug(!shouldShowDebug);
							}}
							title="Debug🐛Data"
						>
							🐛
						</button>
						<button
							className="btn rounded-none bg-transparent border-none text-white hover:text-white hover:bg-black w-50"
							onClick={() => {
								setShouldShowSettings(!shouldShowSettings);
							}}
							title="⚙️Settings.eth"
						>
							⚙️
						</button>
						<button
							className="btn rounded-none bg-transparent border-none text-white hover:text-white hover:bg-black w-50"
							onClick={() => {
								history.push('/');
							}}
						>
							🪞
						</button>
						<button
							className="btn rounded-none bg-transparent border-none text-white hover:text-white hover:bg-black w-50"
							onClick={() => {
								history.push('/properties');
							}}
						>
							🍬
						</button>
					</div>
				</div>
			</div>
			<FixedElements
				hideAlerts={false}
				hideSettings
				hideFooter
				hideUserInfo
			/>
			<ChatGPTModal
				tabs={tabs}
				onSetHTML={(code) => {
					//take everything inbetween script tags
					let script = code.match(/<script>(.*?)<\/script>/s);
					let fScript = script ? (script[1] as any) : '';
					//take everything inbetween style tags
					let style = code.match(/<style>(.*?)<\/style>/s);
					let fStyle = style ? (style[1] as any) : '';
					//remove script tags from html
					let parsedHTML = code.replace(
						/<script>(.*?)<\/script>/s,
						''
					);
					//also remove script tags that have attributes in the tag
					parsedHTML = parsedHTML.replace(
						/<script(.*?)>(.*?)<\/script>/s,
						''
					);

					//remove style tags
					parsedHTML = parsedHTML.replace(
						/<style>(.*?)<\/style>/s,
						''
					);

					let newTabs = {
						...tabs,
						html: {
							...tabs.html,
							code: parsedHTML,
						},
						js: {
							...tabs.js,
							code: fScript,
						},
						css: {
							...tabs.css,
							code: fStyle,
						},
					};
					Object.keys(newTabs).forEach((tabKey) => {
						storage.setPagePreference(
							tabKey,
							newTabs[tabKey].code || ''
						);
					});
					storage.saveData();

					setCode(newTabs[selectedTab].code || '');
					setCodeBuffer(newTabs[selectedTab].code || '');
					setTabs(newTabs);
					setShouldShowChatGPT(false);
				}}
				hidden={!shouldShowChatGPT}
				onHide={() => {
					setShouldShowChatGPT(false);
				}}
			/>

			<SettingsModal
				hidden={!shouldShowSettings}
				onHide={() => {
					if (shouldOpenPublishMenu) {
						setShouldShowPublish(true);
						setShouldOpenPublishMenu(false);
					}

					setShouldShowSettings(false);
				}}
			/>
			<NewProjectModal
				hidden={!shouldShowNewProject}
				onHide={() => {
					setShouldShowNewProject(false);
				}}
				tabs={tabs}
				setCode={(newTabs) => {
					Object.keys(newTabs).forEach((tabKey) => {
						storage.setPagePreference(
							tabKey,
							newTabs[tabKey].code || ''
						);
					});
					storage.saveData();

					setCodeBuffer(newTabs[selectedTab].code || '');
					setCode(newTabs[selectedTab].code || '');
					setTabs(newTabs);
					setShouldShowNewProject(false);
				}}
			/>
			<PublishModal
				tabs={tabs}
				hidden={!shouldShowPublish}
				onSettings={() => {
					setShouldShowPublish(false);
					setShouldOpenPublishMenu(true);
					setShouldShowSettings(true);
				}}
				onHide={() => {
					setShouldShowPublish(false);
				}}
			/>
		</div>
	);
}

IDE.propTypes = {
	theme: PropTypes.string,
};

export default IDE;
