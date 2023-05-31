import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import WebEvents from '../webEvents';
import storage from '../storage';

// Handle for the typeWriter animation
function Hero({ theme, children }: { theme?: string; children?: any }) {
	const [currentTheme, setCurrentTheme] = useState(theme || null);
	const eventEmitterCallbackRef = useRef(null);
	const themeRef = useRef(theme || null);

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

		return () => {
			WebEvents.off('reload', eventEmitterCallbackRef.current);
		};
	}, []);

	return (
		<div
			className={'hero min-h-screen bg-base-200 w-full z-50 max-w-screen'}
			data-theme={currentTheme}
		>
			{children}
		</div>
	);
}

Hero.propTypes = {
	theme: PropTypes.string,
	title: PropTypes.string,
	initialText: PropTypes.string,
	children: PropTypes.node,
	showFinder: PropTypes.bool,
	typeWriterSpeed: PropTypes.number,
};

export default Hero;
