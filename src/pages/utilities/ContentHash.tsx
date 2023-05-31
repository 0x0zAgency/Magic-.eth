import FixedElements from '../../components/FixedElements';
import { useHistory } from 'react-router-dom';
import { useRef, useState } from 'react';
import storage from '../../storage';
import config from '../../config';
import Navbar from '../../components/Navbar';
import { decodeContentHash, encodeContentHash } from '../../helpers';

export default function ContentHash() {
	const history = useHistory();
	const hash = useRef(null);
	const [decoded, setDecoded] = useState('');
	const [error, setError] = useState(null);

	const decode = () => {
		setError(null);
		try {
			if (hash.current.value === '')
				throw new Error('please enter a content hash');

			setDecoded(decodeContentHash(hash.current.value));
		} catch (e) {
			console.log(e);
			setError(e);
		}
	};

	const encode = () => {
		setError(null);
		try {
			if (hash.current.value === '')
				throw new Error('please enter a content hash');

			setDecoded('0x' + encodeContentHash(hash.current.value));
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
							Content Hash Encoder/Decoder
						</h1>
						<p className="mb-5 text-black">
							Enter a content hash to decode, or enter IPFS hash
							to encode a content hash
						</p>
						<input
							className="input input-bordered w-full mb-2"
							ref={hash}
							placeholder="myspecialcontenthashtodecode"
						></input>
						{error === null ? (
							<p className="mb-5 text-success mt-2 break-all">
								{decoded}
							</p>
						) : (
							<p className="mb-5 text-error mt-2 break-all">
								{error.message}
							</p>
						)}
						<button
							className="btn btn-dark w-full"
							onClick={() => {
								if (hash.current.value.startsWith('0x'))
									decode();
								else encode();
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
