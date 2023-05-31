import React, { useRef, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import storage from '../storage';
import ChatGPTHeader from '../components/ChatGPTHeader';
import HeartIcon from '../components/Icons/HeartIcon';
import ViewIcon from '../components/Icons/ViewIcon';
import Loading from '../components/Loading';
import { fetchPrompt } from '../gpt3';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-json';
import 'prismjs/themes/prism-dark.css';
import config from '../config';

function ChatGPTModal({ hidden, onHide, onSetHTML = (code) => {}, tabs = {} }) {
	const [loading, setLoading] = useState(false);
	const [hasCode, setHasCode] = useState(false);
	const [percentage, setPercentage] = useState(0);
	const [hasInput, setHasInput] = useState(false);
	const [gptResult, setGptResult] = useState(
		storage.getPagePreference('gptResult') || null
	);
	const [gptPrompt, setGptPrompt] = useState(
		storage.getPagePreference('gptPrompt') || null
	);

	const [gptError, setGptError] = useState(null);
	const abortRef = useRef(null);
	const inputElement = useRef(null);
	const tempElement = useRef(null);
	const nElement = useRef(null);
	const libraryElement = useRef(null);

	/**
	 * Called when the user clicks the "Generate" button
	 */
	const onPrompt = async () => {
		setPercentage(0);
		if (hasInput) {
			setLoading(true);
			setGptError(null);
			setPercentage(50);

			if (abortRef.current !== null) abortRef.current.abort();
			abortRef.current = new AbortController();

			let prompt = inputElement.current.value;

			//fixes some prompts breaking, will find a WAY better method for this LOL
			prompt = prompt.replace(' Tailwind,', '');
			prompt = prompt.replace(' css3,', '');
			prompt = prompt.replace(' JQuery,', '');
			prompt = prompt.replace(' javascript,', '');
			prompt = prompt.replace(' Javascript,', '');
			prompt = prompt.replace(' svg', '');
			prompt = prompt.replace(' SVG', '');
			prompt = prompt.replace(' jquery,', '');
			prompt = prompt.replace(' canvas,', '');
			prompt = prompt.replace(' Canvas,', '');
			prompt = prompt.replace(' bootstrap4,', '');
			prompt = prompt.replace(' Bootstrap4,', '');
			prompt = prompt.replace(' bootstrap5,', '');
			prompt = prompt.replace(' Bootstrap5,', '');
			prompt = prompt.replace(' bootstrap 4,', '');
			prompt = prompt.replace(' Bootstrap 4,', '');
			prompt = prompt.replace(' bootstrap 5,', '');
			prompt = prompt.replace(' Bootstrap 5,', '');
			prompt = prompt.replace('Using HTML, ', '');

			let stub = 'Using HTML, ' + libraryElement.current.value + ', ';
			let end =
				". Don't reference any local files. Don't include HTML opening and closing tag. Finish your answer.";

			prompt = prompt.trim().replace('  ', ' ');
			prompt = prompt.replace(stub, '');
			prompt = prompt.replace(end, '');

			//add create
			if (
				prompt
					.split(' ')
					.filter(
						(word: string) =>
							word.toLowerCase() === 'create' ||
							word.toLowerCase() === 'make' ||
							word.toLowerCase() === 'draw' ||
							word.toLowerCase() === 'embed'
					).length === 0
			)
				prompt = 'create ' + prompt;

			storage.setPagePreference('gptPrompt', prompt);
			storage.saveData();
			//update
			inputElement.current.value = prompt;

			prompt = stub + prompt + end;

			setPercentage(75);
			const result = await fetchPrompt(prompt, abortRef.current, {
				n: nElement?.current.value || 1,
				temp: tempElement?.current.value || 0.6,
			})
				.catch((error) => {
					setGptError(error);
					setLoading(false);
				})
				.finally(() => {
					abortRef.current = null;
				});

			storage.setPagePreference('gptPrompt', prompt);
			storage.setPagePreference('gptResult', result);
			storage.saveData();

			setGptPrompt(prompt);
			setPercentage(100);
			setGptResult(result);
			setLoading(false);
		}
	};

	/**
	 * Hack
	 */
	useEffect(() => {
		if (inputElement?.current?.value?.length > 0 && !hasInput)
			setHasInput(true);
	}, [inputElement?.current?.value]);

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

	// disables scrolling while this modal is active
	useEffect(() => {
		if (!hidden) document.body.style.overflow = 'hidden';
		else document.body.style.overflow = 'auto';
	}, [hidden]);

	return (
		<div
			data-theme={
				storage.getGlobalPreference('defaultTheme') ||
				config.defaultTheme ||
				'forest'
			}
			className="mx-auto sm:w-full md:w-full lg:w-5/6 fixed inset-0 flex items-center overflow-y-auto z-50 bg-transparent"
			hidden={hidden}
		>
			<div className="bg-white rounded-md w-full overflow-y-auto max-h-screen shadow-lg border-2">
				<div className="flex flex-col w-full">
					<div className="bg-info p-2 text-black text-3xl">
						<b>🤖Army.eth</b>
					</div>
					<div className="flex flex-col p-2 w-full mt-2">
						<p className="text-1 mb-2 text-black">
							Command the power of an AI Army to help you craft
							the pages and product you want to see on Web3.
						</p>
						<p className="text-2xl mb-2 text-black">
							<b>GPT-3 Stats</b>
						</p>
						<div className="stats shadow">
							<div className="stat">
								<div className="stat-figure text-primary">
									<HeartIcon />
								</div>
								<div className="stat-title">Prompt Usage</div>
								<div className="stat-value text-primary">
									{gptResult?.usage?.prompt_tokens || 0}
								</div>
								<div
									className="stat-desc"
									hidden={!gptResult?.usage?.prompt_tokens}
								>
									{parseInt(
										gptResult?.usage?.prompt_tokens || 0
									) < 64
										? 'Acceptable'
										: 'Unacceptable'}
								</div>
							</div>
							<div className="stat">
								<div className="stat-figure text-primary">
									<ViewIcon />
								</div>
								<div className="stat-title">Solutions</div>
								<div className="stat-value text-primary">
									{gptResult?.choices?.length || 0}
								</div>
								<div
									className="stat-desc"
									hidden={
										(gptResult?.choices?.length || 0) === 0
									}
								>
									Temperature:{' '}
									{tempElement?.current?.value || 0.6}
								</div>
							</div>
						</div>
						{hasCode ? (
							<div className="bg-red-500 text-white p-2 rounded-md mt-2">
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
						{!loading ? (
							<ChatGPTHeader hidden={gptResult !== null} />
						) : (
							<Loading loadingPercentage={percentage} />
						)}

						{gptError !== null ? (
							<div className="alert alert-error mt-4 w-full">
								{gptError?.message}
							</div>
						) : (
							<></>
						)}
						<div className="flex flex-row mt-4">
							<div className="form-control w-full">
								<label className="input-group w-full text-center h-full">
									<p className="bg-gray-200 text-black hidden md:block lg:block">
										<span className="label-text h-full">
											Using
										</span>
									</p>
									<select
										className="input select"
										disabled={loading}
										data-loading={loading}
										ref={libraryElement}
									>
										<option selected>Tailwind</option>
										<option value="jquery">JQuery</option>
										<option value="bootstrap4">
											Bootstrap 4
										</option>
										<option value="bootstrap5">
											Bootstrap 5
										</option>
										<option value="javascript">
											Javascript
										</option>
										<option value="css3">CSS3</option>
										<option value="svg">SVG</option>
										<option value="canvas">Canvas</option>
									</select>
									<input
										type="text"
										data-loading={loading}
										disabled={loading}
										ref={inputElement}
										maxLength={200}
										onKeyDown={(e) => {}}
										onInput={() => {
											setHasInput(
												inputElement.current.value
													.length > 0
											);
										}}
										placeholder="by your command...tell us how to serve!"
										className="input input-bordered w-full relative "
									/>
									<input
										type="number"
										data-loading={loading}
										disabled={loading}
										ref={tempElement}
										maxLength={2}
										min={0.1}
										step={0.1}
										max={2}
										onChange={(e) => {
											if (parseFloat(e.target.value) > 2)
												e.target.value = '2';
											setHasInput(true);
										}}
										placeholder="0.6"
										className="input input-bordered w-25"
									/>
									<input
										type="number"
										data-loading={loading}
										disabled={loading}
										ref={nElement}
										maxLength={2}
										onChange={(e) => {
											if (parseInt(e.target.value) > 6)
												e.target.value = '6';
											setHasInput(true);
										}}
										max={6}
										min={1}
										placeholder="1"
										className="input input-bordered"
									/>
									<button
										data-loading={loading}
										type="submit"
										disabled={loading || !hasInput}
										onClick={onPrompt}
										className="btn bg-success text-black hover:bg-black hover:text-yellow-500"
									>
										Ask
									</button>
								</label>
							</div>
						</div>
						{!loading && gptResult !== null ? (
							<div className="flex flex-col gap-2 mt-4">
								<p
									className="break-words"
									hidden={gptPrompt === null}
								>
									<span className="badge badge-lg mr-2 text-white h-full w-full rounded-none p-2">
										🤖 {gptPrompt || ''}
									</span>
								</p>
								{gptResult?.choices?.map((choice, index) => {
									return (
										<div
											key={index}
											className="flex flex-col md:flex-row lg:flex-row gap-2 w-full"
										>
											<div className="w-full lg:max-w-[88%] md:max-w[88%] ">
												<p className="text-2xl bg-info text-white p-2">
													<span className="badge mb-2">
														{index + 1}
													</span>
												</p>
												<div className="max-h-[12rem] overflow-y-scroll border-2 mb-2">
													<div className="p-2 bg-black">
														<Editor
															className="w-full text-wrap overflow-scroll"
															onValueChange={(
																code
															) => {}}
															value={choice.text}
															highlight={(code) =>
																highlight(
																	code,
																	languages.html
																)
															}
														/>
													</div>
												</div>
											</div>
											<div className="w-25">
												<button
													className="btn btn-success w-full"
													onClick={() => {
														onSetHTML(choice.text);
													}}
												>
													Use
												</button>
												<button className="btn btn-dark w-full mt-2">
													Preview
												</button>
											</div>
										</div>
									);
								})}
							</div>
						) : (
							<></>
						)}
						<div className="btn-group w-full mt-2">
							<button
								className="btn btn-error"
								onClick={() => {
									if (abortRef.current !== null) {
										abortRef.current.abort();
										abortRef.current = null;
										return;
									}
									if (onHide) onHide();
								}}
							>
								Exit
							</button>
							<button
								disabled={!loading}
								className="btn btn-error"
								onClick={() => {
									if (abortRef.current !== null) {
										abortRef.current.abort();
										abortRef.current = null;
										return;
									}
									if (onHide) onHide();
								}}
							>
								Cancel
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

ChatGPTModal.propTypes = {
	onSetHTML: PropTypes.func,
	savedData: PropTypes.any,
	hidden: PropTypes.bool,
	tabs: PropTypes.object,
	onHide: PropTypes.func,
};

export default ChatGPTModal;
