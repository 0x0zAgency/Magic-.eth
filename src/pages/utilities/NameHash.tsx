import FixedElements from '../../components/FixedElements';
import { useHistory } from 'react-router-dom';
import { useRef, useState } from 'react';
import { ethers } from 'ethers';
import storage from '../../storage';
import config from '../../config';
import Navbar from '../../components/Navbar';

export default function NameHash() {
	const history = useHistory();
	const hash = useRef(null);
	const [decoded, setDecoded] = useState('');
	const [error, setError] = useState(null);

	const decode = () => {
		setError(null);
		try {
			if (hash.current.value === '')
				throw new Error('please enter a dns domain');

			const decoded = ethers.utils.namehash(hash.current.value);
			setDecoded(decoded);
		} catch (e) {
			console.log(e);
			setError(e);
		}
	};

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
				<div className="hero-overlay bg-opacity-60" />
				<div className="hero-content text-center text-neutral-content bg-gray-500">
					<div className="max-w-xl">
						<h1 className="mb-5 text-5xl font-bold text-black">
							ENS NameHash Calculator
						</h1>
						<p className="mb-5 text-black">
							Please enter an ENS domain to calculate the namehash
						</p>
						<input
							className="input input-bordered w-full mb-2"
							ref={hash}
							placeholder="mylongsuperspecialENSdomain.eth"
						></input>
						{error === null ? (
							<p className="mb-5 text-success mt-2 break-words">
								{decoded}
							</p>
						) : (
							<p className="mb-5 text-error mt-2 break-words">
								{error.message}
							</p>
						)}
						<button
							className="btn btn-dark w-full"
							onClick={() => {
								decode();
							}}
						>
							Calculate
						</button>
						<button
							className="btn btn-dark w-full mt-2"
							onClick={() => {
								history.push('/utilities/');
							}}
						>
							Dashboard
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
			<FixedElements useFixed={false}></FixedElements>
		</div>
	);
}
