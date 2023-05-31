import React, { useContext, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import DestinationFinder from './DestinationFinder';
import WebEvents from '../webEvents';
import storage from '../storage';
import config from '../config';
import { LoginContext } from '../contexts/loginContext';

/**
 *
 * @param param0
 * @returns
 */
function Header({
	theme,
	title,
	typeWriterSpeed = 75,
	initialText = 'Where will you go today?',
	showFinder = true,
}: {
	theme?: string;
	title?: string;
	typeWriterSpeed?: number;
	initialText?: string;
	showFinder?: boolean;
}) {
	const history = useHistory();
	const pickDestinationHandle = useRef(null);
	const typeWriterHandle = useRef(null);
	// To allow more than one header
	const typeWriterElement = useRef(
		`#${btoa(Math.floor(Math.random() * 100000).toString())}`
	);
	const [currentTheme, setCurrentTheme] = useState(
		theme || config.defaultTheme || '0x0z Light'
	);
	const speedRef = useRef(typeWriterSpeed);
	const textRef = useRef(initialText);
	const callbackRef = useRef(null);
	const writeTextRef = useRef(null);
	const eventEmitterCallbackRef = useRef(null);
	const themeRef = useRef(theme || null);
	const loginContext = useContext(LoginContext);

	// Code for the h1 text animation is in the animation.ts file
	useEffect(() => {
		if (
			themeRef.current === null &&
			storage.getGlobalPreference('defaultTheme')
		) {
			setCurrentTheme(storage.getGlobalPreference('defaultTheme'));
		}

		if (eventEmitterCallbackRef.current === null) {
			eventEmitterCallbackRef.current = () => {
				if (
					themeRef.current === null &&
					storage.getGlobalPreference('defaultTheme')
				) {
					setCurrentTheme(
						storage.getGlobalPreference('defaultTheme')
					);
				}
			};
		}

		WebEvents.off('reload', eventEmitterCallbackRef.current);
		WebEvents.on('reload', eventEmitterCallbackRef.current);

		// Cb for the typeWriter animation
		callbackRef.current = (destination: string) => {
			if (typeWriterHandle.current)
				clearTimeout(typeWriterHandle.current);
			if (pickDestinationHandle.current) {
				clearTimeout(pickDestinationHandle.current);
			}

			text.innerHTML = '';
			buffer = '';
			i = 0;
			txt = destination;
			writeTextRef.current();
		};

		WebEvents.off('gotoDestination', callbackRef.current);
		WebEvents.on('gotoDestination', callbackRef.current);

		if (!document.getElementById(typeWriterElement.current)) {
			throw new Error(
				`no element with id ${typeWriterElement.current} found`
			);
		}

		// Fixes reloading
		if (pickDestinationHandle.current) {
			clearTimeout(pickDestinationHandle.current);
		}

		const text = document.getElementById(typeWriterElement.current);
		// Make the text animate like a typewriter
		let i = 0;
		let txt = textRef.current;
		let buffer = '';

		writeTextRef.current = (doRandomName?: boolean) => {
			if (i < txt.length) {
				buffer += txt.charAt(i);
				text.innerHTML = buffer;
				i++;
				typeWriterHandle.current = setTimeout(
					() => writeTextRef.current(doRandomName),
					speedRef.current
				);
			} else {
				text.innerHTML =
					text.innerHTML + "<span class='blink-text'>_</span>";

				if (doRandomName) {
					pickDestinationHandle.current = setTimeout(() => {
						randomNames();
					}, 1000 * Math.floor(Math.random() * 10) + 6000);
				} else {
					if (pickDestinationHandle.current) {
						clearTimeout(pickDestinationHandle.current);
					}
					if (typeWriterHandle.current)
						clearTimeout(typeWriterHandle.current);
				}
			}
		};

		const randomNames = () => {
			text.innerHTML = '';
			buffer = '';
			i = 0;
			const randomIndex = Math.floor(
				Math.random() * config.destinations.length
			);
			txt = `${config.destinations[randomIndex]}`;
			writeTextRef.current(true);
		};

		buffer = '';
		text.innerHTML = '';

		if (!typeWriterHandle.current && writeTextRef.current !== null) {
			writeTextRef.current(true);
		}

		return () => {
			WebEvents.off('gotoDestination', callbackRef.current);
			WebEvents.off('reload', eventEmitterCallbackRef.current);
		};
	}, []);

	if (title?.length > 32)
		title =
			title.substring(0, 32) +
			'...' +
			title.substring(title.length - 3, title.length);

	return (
		<div
			className="hero min-h-screen max-w-screen bg-base-200"
			data-theme={currentTheme}
		>
			<div className="hero-content text-center w-[100%] md:w-[80%] lg:w-[80%] lg:max-w-[80vw] md:max-w-[80vw] max-w-[95vw]">
				<div className="flex flex-col gap-4 lg:gap-3 w-full">
					{/** Mobile title */}
					<div className="max-w-screen mb-2">
						<h1 className="text-4xl md:hidden lg:hidden title max-w-screen break-all pt-4 mt-6">
							{!title || title.length === 0
								? 'Magic🪞.eth'
								: title}
						</h1>
						{/** Tablet/desktop title */}
						<h1 className="text-8xl hidden md:block lg:block title max-w-screen break-all">
							{!title || title.length === 0
								? 'Magic🪞.eth'
								: title}
						</h1>
					</div>
					<div className="mt-2 max-w-screen w-full">
						<h1
							className="text-2xl bg-secondary text-white lg:text-3xl p-2 max-w-screen hover:bg-primary hover:text-white transition-all duration-300 ease-in-out rounded-md"
							style={{
								cursor: 'pointer',
							}}
							onClick={async () => {
								let destination = document.getElementById(
									typeWriterElement.current
								).innerText;

								if (destination.indexOf('.eth') === -1) return;

								if (destination[destination.length - 1] === '_')
									destination = destination.slice(0, -1);

								WebEvents.emit('gotoDestination', destination);

								// Gives time for animations to animates\
								await new Promise((resolve) =>
									setTimeout(() => {
										history.push('/view/' + destination);
										resolve(true);
									}, 3142 / 4)
								);
							}}
							id={typeWriterElement.current}
							title="See the reflection of Web3, and build the dreams of a Decentralized Generation on Magic🪞.eth"
						>
							{/** The initial input is controlled by a prop */}
						</h1>
						{showFinder ? <DestinationFinder /> : <></>}
					</div>
				</div>
			</div>
		</div>
	);
}

Header.propTypes = {
	theme: PropTypes.string,
	title: PropTypes.string,
	initialText: PropTypes.string,
	showFinder: PropTypes.bool,
	typeWriterSpeed: PropTypes.number,
};

export default Header;
