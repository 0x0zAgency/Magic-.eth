import React, { useRef, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import storage from '../storage';
import ChatGPTHeader from '../components/ChatGPTHeader';
import defaultTemplates from '../templates';
import config from '../config';

function NewProjectModal({ hidden, onHide, tabs = {}, setCode }) {
	const [selectedTemplate, setSelectedTemplate] = useState(null);
	const [templates, setTemplates] = useState([]);
	const [hasCode, setHasCode] = useState(false);

	useEffect(() => {
		setTemplates(Object.values(defaultTemplates));
	}, []);

	// Disables scrolling while this modal is active
	useEffect(() => {
		if (!hidden) document.body.style.overflow = 'hidden';
		else document.body.style.overflow = 'auto';
	}, [hidden]);

	/**
	 * Checks if any of the tabs have code
	 */
	useEffect(() => {
		let _hasCode = false;
		for (let key in tabs) {
			if (tabs[key].code !== '') {
				_hasCode = true;
				break;
			}
		}
		setHasCode(_hasCode);
	}, []);

	return (
		<div
			data-theme={
				storage.getGlobalPreference('defaultTheme') ||
				config.defaultTheme ||
				'forest'
			}
			className="mx-auto sm:w-3/5 md:w-3/5 lg:w-4/5 fixed inset-0 flex items-center overflow-y-auto z-50 bg-transparent"
			hidden={hidden}
		>
			<div className="bg-white rounded-md w-full overflow-y-auto max-h-screen shadow shadow-lg border-2">
				<div className="flex flex-col w-full">
					<div className="bg-secondary p-2 text-black text-3xl">
						<b>⚙️</b>
					</div>
					<ChatGPTHeader
						bg="bg-secondary"
						children={
							<>
								<div className="p-2 w-full mt-4">
									<h1 className="text-3xl md:text-4xl lg:text-5xl text-black text-center md:text-center lg:text-right mb-4">
										Dream🎨.eth
									</h1>
									<div className="block">
										<p className="text-black text-1xl text-center lg:text-2xl lg:text-right">
											Welcome to the Dream🎨.eth Magic
											dWeb Studio.
										</p>
										<p className="text-black text-1xl text-center lg:text-2xl  lg:text-right">
											You can use it to create{' '}
											<u>anything</u> you like.
										</p>
										<p className="text-black text-1xl text-center lg:text-2xl  lg:text-right">
											Your imagination is the limit.
										</p>
										<p className="text-black text-1xl text-center lg:text-2xl lg:text-right">
											You can start by selecting a
											template.
										</p>
									</div>
								</div>
							</>
						}
					/>
					<div className="flex flex-col flex-1 p-3">
						{hasCode ? (
							<div className="bg-red-500 text-white p-2 rounded-md">
								<p className="font-bold">Warning</p>
								<p>
									Your current project will be lost if you
									continue. You might want to save!
								</p>
								<p
									style={{
										fontSize: 10,
									}}
								>
									You can save your project by clicking the
									'💾' button.
								</p>
							</div>
						) : (
							<></>
						)}
						<div className="flex flex-row items-center justify-between mt-2">
							<p className="text-black text-2xl">Templates</p>
							<div className="flex flex-row items-center">
								<div className="flex flex-row items-center justify-center ml-2 gap-2">
									<div
										hidden={selectedTemplate === null}
										className="flex flex-row items-center justify-center p-2 rounded-md border-2 border-gray-400 cursor-pointer hover:bg-gray-200"
										onClick={() => {
											//create new project using template
											if (selectedTemplate.onSelection) {
												selectedTemplate.onSelection(
													tabs,
													setCode
												);
											}
										}}
									>
										<p className="text-black">
											Use Template
										</p>
									</div>
									<div
										className="flex flex-row items-center justify-center p-2 rounded-md border-2 border-red-400 cursor-pointer hover:bg-red-500"
										onClick={() => {
											onHide();
										}}
									>
										<p className="text-black hover:text-white">
											Cancel
										</p>
									</div>
								</div>
							</div>
						</div>

						<div className="flex flex-col flex-1 mt-4 gap-2">
							{templates.map((template, index) => (
								<div
									key={index}
									className="flex flex-row items-center justify-between p-2 rounded-md border-2 border-gray-400 cursor-pointer hover:bg-gray-200"
									onClick={() => {
										setSelectedTemplate(template);
									}}
								>
									<div className="flex flex-col">
										<p className="text-black">
											{template.name}
										</p>
										<p className="text-gray-400">
											{template.description}
										</p>
									</div>
									<div className="flex flex-row items-center">
										<h2 className="text-black">
											{selectedTemplate === template
												? '✅'
												: ''}
										</h2>
									</div>
								</div>
							))}
						</div>
						<div className="flex flex-row items-center justify-between mt-2  hidden lg:block">
							<p className="text-black text-2xl">
								{selectedTemplate === null
									? ''
									: selectedTemplate.name}
								<span
									className="text-gray-400"
									style={{
										fontSize: '0.5em',
									}}
								>
									{selectedTemplate === null
										? ''
										: ` - ${selectedTemplate.description}`}
								</span>
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

NewProjectModal.propTypes = {
	hidden: PropTypes.bool,
	onHide: PropTypes.func,
	setCode: PropTypes.func,
};

export default NewProjectModal;
