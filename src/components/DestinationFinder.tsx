/* eslint-disable no-unused-vars */
import React, { useRef, useState, useContext } from 'react';
import ErrorIcon from './Icons/ErrorIcon';
import WebEvents from '../webEvents';
import { useHistory } from 'react-router-dom';
import { LoginContext } from '../contexts/loginContext';
import config from '../config';

export default function DestinationFinder() {
	const inputElement = useRef(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(false);
	const [hasInput, setHasInput] = useState(false);
	const errorRef = useRef(null);
	const history = useHistory();
	const loginContext = useContext(LoginContext);

	/**
	 *
	 * @param destination The destination to go to
	 */
	const gotoAddress = async (destination: string) => {
		setError(false);
		destination = destination.toString();
		destination = destination.trim();
		// Remove leading and trailing dots
		destination = destination.replace(/^\.+|\.+$/g, '');
		// Remove http:// or https:// from the destination
		if (destination.includes('http://')) {
			destination = destination.replace('http://', '');
		}
		if (destination.includes('https://')) {
			destination = destination.replace('https://', '');
		}
		// Remove html tags from the destination
		destination = destination.replace(/<[^>]*>/g, '');
		// Remove any colons and stuff
		destination = destination.replace(/:|;|\?|\|\*|#/g, '');
		destination = destination.replace(/ /g, '-');
		// Remove leading and trailing spaces
		destination = destination.trim();

		let isResolver = false;
		let resolverExtension = '';
		let resolverActualExtension = '.eth';

		config.resolvers.forEach((resolver) => {
			if (destination.includes(resolver[0])) {
				isResolver = true;
				destination = destination.split('.').slice(0, -1).join('.');
				resolverExtension = resolver[1] || '';
				resolverActualExtension = resolver[0];
			}
		});

		if (destination.length === 0) {
			throw new Error('Please enter a destination to visit!');
		}

		if (destination.length > 100)
			throw new Error('Destination is too long!');

		destination = destination.replace('.eth', '');
		destination = destination + resolverActualExtension;

		if (destination.split('.').pop() === 'eth')
			destination = destination.split('.').slice(0, -1).join('.');

		WebEvents.emit(
			'gotoDestination',
			destination + (isResolver ? resolverExtension : '.eth')
		);

		// Gives time for animations to animates\
		await new Promise((resolve) =>
			setTimeout(() => {
				history.push(
					'/' +
						destination +
						(isResolver ? resolverExtension : '.eth')
				);
				resolve(true);
			}, 4542)
		);
	};

	const errorHandler = (error: any) => {
		setError(error.message);
		// Fade out the error after 5 seconds
		clearTimeout(errorRef.current);
		errorRef.current = setTimeout(() => {
			setError(false);
		}, 10000);
	};

	// Get the current destination from the box and goes to it
	const handleVisit = () => {
		setLoading(true);
		const destination = inputElement.current.value;
		gotoAddress(destination)
			.catch(errorHandler)
			.finally(() => {
				setLoading(false);
			});
	};

	// Pick random tokenId from ENS and try and got to it...
	const handleTakeMeAnywhere = () => {
		setLoading(true);
		gotoAddress(
			config.destinations[
				Math.floor(Math.random() * config.destinations.length)
			]
		)
			.catch(errorHandler)
			.finally(() => {
				setLoading(false);
			});
	};

	return (
		<div className="w-full max-w-screen">
			<div className="alert alert-error shadow-lg mb-2" hidden={!error}>
				<div>
					<ErrorIcon />
					<span>
						<b className="mr-2">Error!</b>
						{error}
					</span>
				</div>
			</div>
			<div className="flex flex-col">
				<div className="form-control w-full">
					<div className="input-group w-75 mb-4 mt-4">
						<input
							type="text"
							data-loading={loading}
							disabled={loading}
							ref={inputElement}
							maxLength={64}
							onKeyDown={(e) => {
								if (e.key === 'Enter') handleVisit();
							}}
							onInput={() => {
								setHasInput(
									inputElement.current.value.length > 0
								);
							}}
							placeholder="Enter a destination..."
							className={`input input-bordered w-full ${
								!loading
									? 'animate-pulse hover:animation-play-state:paused'
									: ''
							}`}
						/>
						<button
							data-loading={loading}
							disabled={loading || !hasInput}
							className="btn bg-primary w-25 hover:text-white hover:bg-black"
							onClick={handleVisit}
						>
							VISIT
						</button>
					</div>
				</div>
				<button
					className="btn btn-outline bg-light w-full mb-2"
					data-loading={loading}
					disabled={loading}
					onClick={handleTakeMeAnywhere}
					title="Trancend spacetime and visit a random destination in the 🟨 Metaverse!"
				>
					🐈 TAKE ME ANYWHERE 🐈‍⬛
				</button>
				<div className="hidden md:block">
					<div className="divider">
						👇 build the next web and unlock the magic of Web3 👇
					</div>
				</div>

				<button
					className="btn btn-outline bg-light hover:bg-accent-500 w-full mt-4 lg:mt-3 mb-2"
					data-loading={loading}
					disabled={loading}
					onClick={() => {
						history.push('/ide');
					}}
					title="Dream a little dream of Web3 with the Dream🎨.eth Studio!"
				>
					DREAM🎨.ETH STUDIO
				</button>

				{loginContext.isSignedIn ? (
					<>
						<div className="hidden md:block">
							<div className="divider">
								👇 check out the new stuff we have added 👇
							</div>
						</div>
						<button
							className="btn btn-outline bg-light hover:bg-accent-500 w-full mt-4 lg:mt-3 animate-pulse"
							data-loading={loading}
							disabled={loading}
							onClick={() => {
								history.push('/properties');
							}}
							title="🍬Land.eth - Manage your ENS Property, Web3 Landing Pages, Marketplaces, NFTs, and more!"
						>
							🍬LAND.ETH
						</button>
						<button
							className="btn btn-outline bg-light hover:bg-accent-500 w-full mt-4 lg:mt-3 animate-pulse"
							data-loading={loading}
							disabled={loading}
							onClick={() => {
								history.push('/leaderboard/top');
							}}
							title="🔥️1️⃣0️⃣0️⃣.eth - See who is trending in ENS"
						>
							🔥️1️⃣0️⃣0️⃣.eth
						</button>
					</>
				) : (
					<></>
				)}
			</div>
		</div>
	);
}
