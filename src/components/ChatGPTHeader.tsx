import React from 'react';
import PropTypes from 'prop-types';

export default function ChatGPTHeader({
	hidden = false,
	children: children = null,
	bg = 'bg-info',
}) {
	return (
		<div className="hero pt-4" hidden={hidden}>
			<div className={'hero-content border-2 text-center w-full ' + bg}>
				<div className="flex flex-col md:flex-row lg:flex-row gap-2 w-full pt-2">
					{children ? (
						children
					) : (
						<>
							<div className="p-2 w-full mt-4">
								<h1 className="text-3xl md:text-5xl lg:text-6xl text-black text-center md:text-right lg:text-right mb-4">
									Command the 🤖
									<u>ARMY.ETH</u>
								</h1>
								<div className="block">
									<p className="text-black text-1xl lg:text-2xl text-right">
										By your command, use the army to create{' '}
										<u>anything</u> you like. Create your
										decentralized websites, marketplaces,
										and dApps.
									</p>
								</div>
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
}

ChatGPTHeader.propTypes = {
	hidden: PropTypes.bool,
};
