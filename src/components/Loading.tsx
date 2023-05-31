import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const CharacterSet = [
	'📁',
	'🗄️',
	'🚕',
	'⛽',
	'✈️',
	'🗿',
	'🪐',
	'🛸',
	'🚀',
	'🌈',
];
let Count = [];

const AddEmoji = (settings: {
	maxIcons: any;
	range: any;
	minSpeed: any;
	speed: any;
	maxWaitTime: any;
}) => {
	// Keep icons below the max icons limit
	if (Count.length >= (settings?.maxIcons || 246)) {
		Count[0].remove();
		Count = Count.slice(1);
	}

	const id = document.getElementById('loadingIcons');
	if (id === null) {
		return 2;
	}

	const elm = document.createElement('p');
	elm.innerHTML =
		Object.values(CharacterSet)[
			Math.floor(Math.random() * CharacterSet.length)
		];

	if (Math.floor(Math.random() * 100) < 25) {
		elm.innerHTML = `<span class='loadingIconEquipable'>${'☂️'}</span>${
			elm.innerHTML
		}`;
	}

	if (Math.floor(Math.random() * 100) < 10) {
		elm.innerHTML = `<span class='loadingIconEquipable' style='margin-top: 2px !important; margin-left: -12px !important'>${'🔫'}</span>${
			elm.innerHTML
		}`;
	}

	if (Math.floor(Math.random() * 100) < 5) {
		elm.innerHTML = `<span class='loadingIconEquipable' style='margin-top: 10px !important; margin-left: 10px !important'>${'✏️'}</span>${
			elm.innerHTML
		}`;
	}

	elm.className = 'loadingIcon';
	elm.style.paddingTop =
		Math.floor(Math.random() * (settings?.range || 200)).toString() + 'px';
	elm.style.animationDuration =
		Math.max(
			settings?.minSpeed || 30,
			Math.floor(Math.random() * (settings?.speed || 100))
		).toString() + 's';

	try {
		id.append(elm);
		Count.push(elm);
	} catch (error) {}

	return Math.random() * (settings?.maxWaitTime || 48);
};

const Loading = ({
	settings,
	loadingReason = 'Loading Content...',
	showLoadingBar = true,
	loadingPercentage = 0,
}) => {
	const timeoutRef = useRef(null);

	if (timeoutRef.current === null) {
		timeoutRef.current = (seconds = 1) => {
			seconds = Math.max(1, seconds);
			setTimeout(() => {
				if (timeoutRef.current !== null)
					timeoutRef.current(AddEmoji(settings));
			}, seconds * 1000);
		};

		if (timeoutRef.current) timeoutRef.current();
	}

	useEffect(() => {
		return () => {
			Count.forEach((val) => {
				try {
					val.remove();
				} catch (error) {}
			});

			if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		};
	}, [settings]);

	return (
		<div className="text-center mt-1 overflow-hidden mb-1">
			<div className="flex flex-col p-2">
				<div className="bg-gray-100 overflow-hidden border-2 p-2">
					<div className="relative" id="loadingIcons" />
					<div className="items-center mb-2 mt-4 text-black">
						<div>
							<p className="text-6xl spinText mb-2">🔨</p>
							{loadingReason !== undefined &&
							loadingReason !== null ? (
								<p className="text-1xl mt-5 underline">
									{loadingReason}
								</p>
							) : (
								<></>
							)}
							{showLoadingBar &&
							loadingPercentage !== undefined &&
							!isNaN(loadingPercentage) ? (
								<div className="w-full mt-2 pt-2">
									<progress
										className="progress w-full"
										value={loadingPercentage}
										max="100"
									/>
								</div>
							) : (
								<></>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

Loading.propTypes = {
	settings: PropTypes.string,
	loadingReason: PropTypes.string,
	showLoadingBar: PropTypes.bool,
	loadingPercentage: PropTypes.number,
};

export default Loading;
