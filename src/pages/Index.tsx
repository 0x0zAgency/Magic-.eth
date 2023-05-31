import React, { useContext, useState, useRef, useEffect } from 'react';
import Header from '../components/Header';
import FixedElements from '../components/FixedElements';
import SettingsModal from '../modals/SettingsModal';
import Hero from '../components/Hero';
import { ENSContext } from '../contexts/ensContext';
import WebEvents from '../webEvents';
import storage from '../storage';
import config from '../config';
import { getFastAvatar } from '../helpers';
import { Web3Context } from '../contexts/web3Context';
import LoginModal from '../modals/LoginModal';
import { LoginContext } from '../contexts/loginContext';

export default function Index() {
	const [shouldShowSettings, setShouldShowSettings] = useState(false);
	const [shouldShowBackdrop, setShouldShowBackdrop] = useState(false);
	const [currentDestination, setCurrentDestination] = useState(null);
	const [shouldShowLogin, setShouldShowLogin] = useState(null);
	const [backgroundImage, setBackgroundImage] = useState(null);
	const ensContext = useContext(ENSContext);
	const context = useContext(Web3Context);
	const loginContext = useContext(LoginContext);
	const cooldown = useRef(null);

	useEffect(() => {
		if (!context.loaded) return;
		if (ensContext.loaded) setBackgroundImage(ensContext.avatar);

		if (cooldown.current === null) {
			cooldown.current = async (destination) => {
				setBackgroundImage('/img/0x0z.jpg');
				let result = await getFastAvatar(
					destination,
					context.web3Provider
				);
				if (result) {
					setBackgroundImage(result);
				}
				setShouldShowBackdrop(true);
				setCurrentDestination(destination);
			};
		}

		// Might cause trouble
		window.scrollTo(0, 0);

		WebEvents.off('gotoDestination', cooldown.current);
		WebEvents.on('gotoDestination', cooldown.current);

		return () => {
			WebEvents.off('gotoDestination', cooldown.current);
		};
	}, [context, ensContext]);
	return (
		<div
			data-theme={
				storage.getGlobalPreference('defaultTheme') ||
				config.defaultTheme ||
				'0x0z Light'
			}
		>
			<div
				className="hero-bg w-full h-screen absolute z-0 animate-pulse bg-cover bg-center backdrop-saturate-100 backdrop-opacity-20"
				hidden={!shouldShowBackdrop}
				style={{
					backgroundImage: `url("${backgroundImage}")`,
				}}
			/>
			<div
				className="hero-bg w-full h-screen absolute z-0 overflow-hidden bg-cover bg-center  bg-black"
				hidden={
					!shouldShowBackdrop ||
					ensContext.avatar === null ||
					ensContext.avatar.length === 0
				}
				style={{ opacity: 0.75 }}
			/>
			<Header title={currentDestination} />
			<Hero>
				<div className="hero-content w-full">
					<div className="flex flex-col md:flex-row lg:flex-row gap-2 w-full">
						<div className="p-4">
							<h4 className="text-center md:text-left text-xl md:text-3xl lg:text-4xl font-bold mb-4 pb-4">
								Introducing Magic🪞 - the revolutionary
								self-contained Web3 browser and builder that
								unveils the future of the internet.
							</h4>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
								<div
									id="registry"
									className="card w-84 glass bg-base-100 shadow-xl"
								>
									<div className="card-body">
										<h2 className="card-title">
											A completely new type of registry 📔
										</h2>
										<hr className="bg-base-100" />
										<p className="mt-2">
											This browser is a game-changer, as
											it enables users to access Web3
											websites without any proxies or
											extensions. In other words, it's
											designed to let you engineer the
											future of the internet.
											<br />
											<br />
											By using our{' '}
											<u>⭐️Atlas.eth - Virtual Web3 Registry</u>, you
											can build on all of your names and
											when gas is low or you are simply
											ready to launch your content to the
											world, you can deploy to the
											Ethereum blockchain. This lets
											everyone see the future of Web3 on
											Magic🪞.
										</p>
										<div className="card-actions justify-end mt-4">
											<a
												href="/properties"
												className="btn btn-light btn-outline"
											>
												Check it out!
											</a>
										</div>
									</div>
								</div>
								<div
									id="browser"
									className="card w-84 glass bg-base-100 shadow-xl"
								>
									<div className="card-body">
										<h2 className="card-title">
											Your naitive Web3 browser 🌍
										</h2>
										<hr className="bg-base-100" />
										<p className="mt-2">
											Think of this as the Google moment
											of Web3. The interface is incredibly
											intuitive, much like the
											search/address bar of Google.
											<br />
											By simply inputting an ETH domain
											such as <i>0x0z.eth</i>, users can
											easily access the active content tag
											for that ENS domain.
											<br />
											<br />
											But that's not all! with Magic🪞,
											users can even skip the .eth and
											directly jump into marketplaces like
											[ens.vision] by typing 0x0z.vision.
											And this is just the beginning.
										</p>
										<div className="card-actions justify-end mt-4">
											<a
												href="/view/0x0z.eth"
												className="btn btn-light btn-outline"
											>
												Example
											</a>
										</div>
									</div>
								</div>
								<div
									id="ide"
									className="card w-84 glass bg-base-100 shadow-xl"
								>
									<div className="card-body">
										<h2 className="card-title">
											A completely new IDE 💻
										</h2>
										<hr className="bg-base-100" />
										<p className="mt-2">
											But what truly sets Magic🪞 apart is
											the Dream🎨.eth Studio. A
											most magical way to create your own
											decentralized websites and add more
											power to your Web3 domains. It's a
											powerful tool that makes website
											creation incredibly easy and
											seamless
										</p>
										<div className="card-actions justify-end mt-4">
											<a
												href="/ide/?url=0x0z.eth"
												className="btn btn-light btn-outline"
											>
												Build Now!
											</a>
										</div>
									</div>
								</div>
								<div
									id="install"
									className="card w-84 glass bg-base-100 shadow-xl"
								>
									<div className="card-body">
										<h2 className="card-title">
											View once. Run anywhere ☕
										</h2>
										<hr className="bg-base-100" />
										<p className="mt-2">
											Magic🪞 is a self-contained Web3
											browser that can be instantiated
											inside of any typical browser,
											making it an incredibly versatile
											tool. This is the future of the
											internet, and Magic🪞 is leading the
											way.
										</p>
										<div className="card-actions justify-end mt-4">
											<a
												href="?install=true"
												className="btn btn-light btn-outline"
											>
												Install Now
											</a>
										</div>
									</div>
								</div>
							</div>

							<div className="pt-4">
							
							<div>
								<div
									id="features"
									className="card glass bg-accent shadow-xl hover:bg-accent"
								>
									<div className="card-body text-white">
										
										<p className="mt-2 lg:text-5xl md:text-3xl">
											Magic🪞 means to normalize consent based browsing for a reconnecting world and reset the foundation of the internet.
										</p>
										<h2 className="card-title text-3xl md:text-xl">
										Features / Tools:
										</h2>
										<p className="mt-2">
										<span className="text-2xl md:text-xl">⚙️settings.eth</span><hr className="bg-primary mb-2" />Manage your Magic🪞 experience and settings such as your decentralized storage options such as IPFS, Web3.Storage, NFT.Storage, your mirror’s theme or Frame, authorized wallets and many more.
										</p>
										<p className="mt-2">
										<span className="text-2xl md:text-xl">Dream🎨.eth</span><hr className="bg-primary mb-2" />The most magical way to create your own decentralized websites and add more power to your Web3 domains. It’s a powerful tool that makes digital content creation incredibly easy and seamless by simply selecting what template you want to execute and fill in the blanks!
										</p>
										<p className="mt-2">
										<span className="text-2xl md:text-xl">🤖Army.eth</span><hr className="bg-primary mb-2" />Magic🪞 integrates the power of AI building along side you, Websites, Landing Pages, Marketplaces via ♾️Mint.eth 3 Integration, and vast monetization methods enabled by our Ethereum Ads Service (🪧EADS.eth), a new Web is at our fingertips!
										</p>
										<p className="mt-2">
										<span className="text-2xl md:text-xl">🍬Land.eth</span><hr className="bg-primary mb-2" />Web3 Landscaping and Property Management Services! Manage all of the builds, on all of your properties, all in one place.
										</p>
										<p className="mt-2">
										<span className="text-2xl md:text-xl">🧰time.eth</span><hr className="bg-primary mb-2" />An evolving set of powertools for your Web3 browsing and ENS MGMT experience.
										</p>
										<p className="mt-2">
										<span className="text-2xl md:text-xl">🔥1️⃣0️⃣0️⃣.eth</span><hr className="bg-primary mb-2" />The fairest domains of them all. See whos rising above the stars with our ENS Leaderboards!
										</p>
										<p className="mt-2">
										<span className="text-2xl md:text-xl">📍egps.eth</span><hr className="bg-primary mb-2" />In Web3 🖖 marks the spot. Keep track of your journey, your assets and your favorite things both IRL and URL. (History)
										</p>
										
									</div>
								</div>
							</div>
						</div>

						</div>
					</div>
				</div>
				
			</Hero>
			
			<div className="pt-5 pb-5 bg-base-200">
				
			</div>
			<div className="pt-5">
				<div className="text-center w-4/3 bg-warning pt-5">
					<div className="flex flex-col md:flex-row lg:flex-row gap-2 w-full pt-5">
						<div className="lg:pl-5 lg:ml-5 md:pl-2 md:ml-2">
							<p className="hidden xl:block font-apocalypse text-5xl lg:ml-5 lg:pl-5 md:ml-2 md:pl-2 lg:text-11x xl:text-[6rem] text-black text-center md:text-left lg:justify-center lg:items-center xl:text-left">
								FOLLOW THE 0x🟨ROAD
							</p>
						</div>
						<div className="p-4">
							<h1 className="text-3xl md:text-5xl lg:text-7xl text-black text-right font-bold mb-4 pb-4">
								Harness the power of the{' '}
								<u>DEcentralized🌈GENeration</u> to create{' '}
								<u>something magical</u>
							</h1>
						</div>
					</div>
				</div>
			</div>
			<div className="card mt-4">
				<div className="card-body bg-warning text-black hover:none text-xl lg:text-2xl text-center">
					<u>Who’s the fairest browser of them all?</u>
				</div>
			</div>
			<div className="flex flex-col md:flex-row lg:flex-row gap-4 w-full pt-4 pb-4">
				<div className="card">
					<div className="card-body bg-warning text-black hover:none text-xl lg:text-2xl ">
						One that only shows you the true 🪞ReflectionNFT of a
						Web3 address.
					</div>
				</div>
				<div className="card">
					<div className="card-body bg-base-100 hover:none text-xl lg:text-2xl">
						If there is a 🪞 we can see each other through, we can
						reset the trust of the internet. Consent based browsing
						for a reconnecting world.
					</div>
				</div>
			</div>
			<div className="pt-5 pb-5 bg-base-200">
				<br />
				<br />
				<br />
				<br />
				<br />
			</div>
			{/** Contains the footer and the 0x0zLogo with the console button */}
			<FixedElements
				hideUserInfo={false}
				hideFooter={true}
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
