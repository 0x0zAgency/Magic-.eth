import React from 'react';
import { useHistory } from 'react-router-dom';

export default function Navbar() {
	const history = useHistory();

	return (
		<div className="max-w-full overflow-x-scroll md:overflow-x-hidden  text-sm lg:text-base mx-auto px-4 sm:px-6 lg:px-8 bg-gray-700 p-2">
			<div className="mx-auto text-black">
				<div className="flex flex-row justify-start md:justify-center gap-2">
					<button
						className="hover:bg-accent hover:text-black text-white font-bold py-2 px-4 rounded"
						data-selected={history.location.pathname === '/'}
						onClick={() => {
							history.push('/');
						}}
					>
						MAGIC🪞.ETH
					</button>
					<button
						className="hover:bg-accent hover:text-black text-white font-bold py-2 px-4 rounded"
						data-selected={history.location.pathname.includes(
							'/utilities/'
						)}
						onClick={() => {
							history.push('/utilities/');
						}}
					>
						🧰TIME.ETH
					</button>
					<button
						className="hover:bg-info hover:text-black text-white font-bold py-2 px-4 rounded"
						data-selected={
							history.location.pathname === '/properties/'
						}
						onClick={() => {
							history.push('/properties/');
						}}
					>
						🍬LAND.eth
					</button>
					<button
						className="hover:bg-info hover:text-black text-white font-bold py-2 px-4 rounded"
						data-selected={
							history.location.pathname === '/leaderboard/top'
						}
						onClick={() => {
							history.push('/leaderboard/top');
						}}
					>
						🔥️1️⃣0️⃣0️⃣.eth
					</button>
					<button
						className="hover:bg-info hover:text-black text-white font-bold py-2 px-4 rounded"
						data-selected={history.location.pathname === '/history'}
						onClick={() => {
							history.push('/history');
						}}
					>
						📍egps.eth
					</button>
					<button
						className="hover:bg-info hover:text-black text-white font-bold py-2 px-4 rounded"
						data-selected={history.location.pathname === '/ide/'}
						onClick={() => {
							history.push('/ide');
						}}
					>
						DREAM🎨.ETH STUDIO
					</button>
				</div>
			</div>
		</div>
	);
}
