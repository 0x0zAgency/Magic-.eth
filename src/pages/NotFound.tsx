import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import FixedElements from '../components/FixedElements';

export default function NotFound() {
	const history = useHistory();

	useEffect(() => {
		//get the current URL
		const currentURL = window.location.href;
		//if it ends in a .eth and is on the root of the domain, redirect to the viewer
		if (currentURL.endsWith('.eth') && currentURL.split('/').length === 4) {
			const token = currentURL.split('/').pop();
			history.push(`/🧱/${token}`);
		}
	}, []);

	return (
		<>
			<div className="hero min-h-screen">
				<div className="hero-overlay bg-opacity-60" />
				<div className="hero-content text-center text-neutral-content bg-error">
					<div className="max-w-md">
						<h1 className="mb-5 text-5xl font-bold text-black">
							404
						</h1>
						<p className="mb-5 text-black">
							This page straight up doesn&apos;t exist. Try
							elsewhere.
						</p>
						<img
							src="/img/404.webp"
							width="618"
							height="790"
							onClick={() => {
								history.push('/');
							}}
						></img>
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
			<FixedElements
				hideAlerts
				hideOwnership
				hideSettings
				hideUserInfo
				useFixed={false}
			></FixedElements>
		</>
	);
}
