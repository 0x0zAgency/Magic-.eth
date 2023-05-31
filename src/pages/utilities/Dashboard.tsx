import FixedElements from '../../components/FixedElements';
import { useHistory } from 'react-router-dom';
import { useRef, useState } from 'react';
import SettingsModal from '../../modals/SettingsModal';
import storage from '../../storage';
import config from '../../config';
import Navbar from '../../components/Navbar';

export default function Dashboard() {
	const history = useHistory();

	const hash = useRef(null);
	const [decoded, setDecoded] = useState('');
	const [error, setError] = useState(null);
	const [showSettingsModal, setShowSettingsModal] = useState(false);

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
				<div className="hero-overlay bg-opacity-70" />
				<div className="hero-content text-center bg-gray-500">
					<div className="min-w-screen">
						<h1 className="mb-5 text-5xl font-bold text-black">
							🧰TIME.eth
						</h1>
						<p className="mb-5 text-black">
							Here is 🧰 box full of utilities that you can use to
							manage and maintain your MAGIC🪞 experience.
						</p>

						<button
							className="btn btn-dark w-full"
							onClick={() => {
								history.push('/utilities/namehash');
							}}
						>
							Name Hash
						</button>
						<button
							className="btn btn-dark w-full mt-2"
							onClick={() => {
								history.push('/utilities/contenthash');
							}}
						>
							Content Hash
						</button>
						<button
							className="btn btn-dark w-full mt-2"
							onClick={() => {
								history.push('/utilities/ens');
							}}
						>
							ENS WHOIS
						</button>
						<button
							className="btn btn-dark w-full mt-2"
							onClick={() => {
								history.push('/utilities/converter');
							}}
						>
							UTF8 Bytes / String Converter
						</button>
						<button
							className="btn btn-dark w-full mt-2"
							onClick={() => {
								history.push('/utilities/user');
							}}
						>
							Current User Checker
						</button>
						<button
							className="btn btn-dark w-full mt-2"
							onClick={() => {
								history.push('/utilities/logout');
							}}
						>
							Wipe 🪞
						</button>
						<button
							className="btn btn-dark w-full mt-2"
							onClick={() => {
								history.push('/utilities/logout');
							}}
						>
							Logout
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
			<SettingsModal
				onHide={() => setShowSettingsModal(false)}
				hidden={!showSettingsModal}
			/>
			<FixedElements
				hideSettings={true}
				hideUserInfo={true}
				hideFooter={false}
				hideOwnership
				useFixed={false}
				onSettings={() => setShowSettingsModal(true)}
			></FixedElements>
		</div>
	);
}
