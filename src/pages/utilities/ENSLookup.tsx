import FixedElements from '../../components/FixedElements';
import { ethers } from 'ethers';
import { useHistory } from 'react-router-dom';
import { useContext, useState } from 'react';
import { Web3Context, Web3ContextType } from '../../contexts/web3Context';
import Loading from '../../components/Loading';
import storage from '../../storage';
import config from '../../config';
import Navbar from '../../components/Navbar';

export default function ENSLookup() {
	const history = useHistory();
	const context = useContext<Web3ContextType>(Web3Context);
	const [hash, setHash] = useState('');
	const [registry, setRegistry] = useState(
		{} as {
			domain: string;
			contentHash: string;
			address: string;
			owner: string;
			rawContentHash: string;
		}
	);
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);

	const decode = async () => {
		let domain = hash;
		setError(null);
		setLoading(true);
		try {
			if (domain === '') throw new Error('please enter an ENS domain');

			if (domain.indexOf('.eth') === -1) domain = domain + '.eth';

			const resolver = await context.web3Provider.getResolver(domain);

			console.log('resolver created for ' + domain);

			if (resolver === null) {
				throw new Error('No resolver found for "' + domain + '"');
			}

			let contentHash = await resolver.getContentHash();
			let address = resolver.address;
			let owner = await context.web3Provider.resolveName(domain);
			let rawContentHash = await resolver._fetchBytes('0xbc1c58d1');

			setRegistry({
				domain,
				contentHash: contentHash,
				address: address,
				owner: owner,
				rawContentHash: rawContentHash,
			});
		} catch (e) {
			console.log(e);
			setError(e);
		} finally {
			setLoading(false);
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
				<div className="hero-content text-neutral-content bg-gray-500">
					<div className="max-w-screen">
						<h1 className="mb-5 text-5xl font-bold text-black text-center">
							WHOIS
						</h1>
						<p className="mb-5 text-black text-center ">
							Enter a domain name to retrieve the owner, and
							resolver address and the current content hash.
						</p>
						{!loading ? (
							<>
								<input
									className="input input-bordered w-full mb-2"
									placeholder="Enter ENS domain"
									onChange={(e) => {
										setHash(e.target.value);
									}}
									onKeyDown={(e) => {
										if (e.key === 'Enter') decode();
									}}
								></input>
								{error === null &&
								Object.keys(registry).length !== 0 ? (
									<>
										<p className="mb-5 text-success mt-2 break-word">
											ENS: {registry.domain}
										</p>
										<p className="mb-5 text-success mt-2 break-word">
											Namehash:{' '}
											{ethers.utils.namehash(
												registry.domain
											)}
										</p>
										<p className="mb-5 text-success mt-2 break-word">
											Owner: {registry.owner}
										</p>
										<p className="mb-5 text-success mt-2 break-word">
											Resolver: {registry.address}
										</p>
										<p className="mb-5 text-success mt-2 break-word">
											Content Hash: {registry.contentHash}
										</p>
										<p className="mb-5 text-success mt-2 break-word">
											Raw Content Hash:{' '}
											{registry.rawContentHash}{' '}
											<span
												className="text-xs text-blue-700 cursor-pointer hover:underline"
												onClick={() => {
													history.push(
														'/utilities/contenthash/' +
															registry.rawContentHash
													);
												}}
											>
												(convert)
											</span>
										</p>
										<p className="mb-5 text-success mt-2 break-word ">
											Registry Etherscan:{' '}
											<a
												href={
													'https://etherscan.io/address/' +
													registry.address
												}
												className="text-blue-700 cursor-pointer hover:underline"
											>
												https://etherscan.io/address/
												{registry.address}
											</a>
										</p>
									</>
								) : (
									<p className="mb-5 text-error mt-2">
										{error?.message}
									</p>
								)}
							</>
						) : (
							<>
								<Loading />
							</>
						)}

						<button
							className="btn btn-dark w-full"
							onClick={() => {
								decode();
							}}
						>
							Look Up
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
