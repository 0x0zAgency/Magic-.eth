import FixedElements from '../../components/FixedElements';
import { ethers } from 'ethers';
import { useHistory } from 'react-router-dom';
import { useRef, useState } from 'react';
import storage from '../../storage';
import config from '../../config';
import Navbar from '../../components/Navbar';

export default function Converter() {
	const history = useHistory();
	const hash = useRef(null);
	const [decoded, setDecoded] = useState('');
	const [error, setError] = useState(null);

	const decode = () => {
		setError(null);
		try {
			if (hash.current.value === '')
				throw new Error('please enter a value to convert');
			let decoded: any;
			if (hash.current.value.startsWith('0x')) {
				decoded = ethers.utils.toUtf8String(hash.current.value);
			} else
				decoded = ethers.utils.hexlify(
					ethers.utils.toUtf8Bytes(hash.current.value)
				);
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
							UTF8String / UTF8Bytes Converter
						</h1>
						<p className="mb-5 text-black">
							Please enter either UTF8String or UTF8Bytes
						</p>
						<input
							className="input input-bordered w-full mb-2"
							ref={hash}
							onKeyDown={(e) => {
								if (e.key === 'Enter') decode();
							}}
							placeholder="decode_me!"
						></input>
						{error === null ? (
							<p className="mb-5 text-success mt-2">{decoded}</p>
						) : (
							<p className="mb-5 text-error mt-2">
								{error.message}
							</p>
						)}
						<button
							className="btn btn-dark w-full"
							onClick={() => {
								decode();
							}}
						>
							Convert
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
