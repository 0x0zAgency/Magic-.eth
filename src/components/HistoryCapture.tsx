import React, { useEffect } from 'react';

/**
 * This fixes foward and back button when navigating around the website
 */
export default function HistoryCapture({ children }) {
	useEffect(() => {
		let change = () => {
			if ((window as any).innerDocClick) {
				(window as any).innerDoClick = false;
			} else {
				if (window.location.hash != '#undefined') {
					{
						window.location.hash = (
							window.location as any
						).lasthash[
							(window.location as any).lasthash.length - 1
						];
						//blah blah blah
						(window.location as any).lasthash.pop();
					}
				} else {
					window.history.pushState(
						'',
						document.title,
						window.location.href
					);
				}
			}
		};

		window.onhashchange = change;
	}, []);

	return <>{children}</>;
}
