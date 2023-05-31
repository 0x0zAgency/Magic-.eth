import prettier from 'html-prettify';
import { ethers } from 'ethers';
import { prepareAvatar } from './effects/useENSContext';
import contentHash from 'content-hash';
import { CID } from 'multiformats';
import { resolveIPNS } from './ipfs';

/**
 * Will fetch content from a given URL and return the parsed HTML, script and style
 * @param contentIndex
 * @returns
 */
export const fetchContent = async (contentIndex: string = 'audio.html') => {
	if (contentIndex[0] !== '/') contentIndex = '/' + contentIndex;
	// Get the default content
	const defaultContent = await fetch(contentIndex);
	const html = await defaultContent.text();
	//take everything inbetween script tags
	let script = html.match(/<script>(.*?)<\/script>/s);
	let fScript = (script[1] as any) || '';
	//take everything inbetween style tags
	let style = html.match(/<style>(.*?)<\/style>/s);
	let fStyle = (style[1] as any) || '';

	//remove script tags from html
	let parsedHTML = html.replace(/<script>(.*?)<\/script>/s, '');

	//also remove script tags that have attributes in the tag
	parsedHTML = parsedHTML.replace(/<script(.*?)>(.*?)<\/script>/s, '');

	//remove style tags
	parsedHTML = parsedHTML.replace(/<style>(.*?)<\/style>/s, '');

	return { parsedHTML, script: fScript, style: fStyle };
};

/**
 *
 * @param fileHash
 * @param text
 * @returns
 */
export const fetchIPFSFromEndpoint = async (
	fileHash: string,
	text: boolean = true
) => {
	let result = await fetch(`https://ipfs.io/ipfs/${fileHash}`);

	if (result.status === 200) {
		if (text) return await result.text();
		else return await result.blob();
	}
	return null;
};

/**
 * Will check if the potential cid is an ipfs or ipns hash and resolve it to a CID always
 * @param potentialCID
 * @param abortController
 * @returns
 */
export const resolvePotentialCID = async (
	potentialCID: string,
	abortController?: AbortController
) => {
	if (potentialCID.includes('ipfs://'))
		potentialCID = potentialCID.split('ipfs://')[1];
	else if (potentialCID.includes('ipns://')) {
		potentialCID = potentialCID.split('ipns://')[1];
		potentialCID = await resolveIPNS(potentialCID, abortController);
	}

	if (potentialCID.includes('ipfs/'))
		potentialCID = potentialCID.split('ipfs/')[1];

	potentialCID = potentialCID.split('/')[0];
	return potentialCID;
};

/**
 * NOTE: This will convert a CIDv1 to CIDv0 if you enter CIDv1, you can just updateCID to get the cid version back
 * @param hash
 * @returns
 */
export const encodeContentHash = (hash: string) => {
	let _hash: string;
	hash = hash.trim();
	if (hash.startsWith('bafy')) {
		_hash = CID.parse(hash).toV0().toString();
	} else _hash = hash;
	return contentHash.fromIpfs(_hash);
};

/**
 * Will try and convert a base56/base32 hash to V1, if it can't it will return the original hash (assuming its v0)
 * @param hash
 * @returns
 */
export const upgradeCID = (hash: string) => {
	let tempHash = hash;
	if (hash.indexOf('ipfs://')) tempHash = hash.replace('ipfs://', '');
	if (hash.indexOf('ipns://')) tempHash = hash.replace('ipns://', '');

	try {
		let result = CID.parse(tempHash).toV1().toString();
		if (hash.indexOf('ipfs://') !== -1) return `ipfs://${result}`;
		if (hash.indexOf('ipns://') !== -1) return `ipns://${result}`;
		return result;
	} catch (error) {
		return hash;
	}
};

/**
 * Will try and convert a hash to V1, if it can't it will return the original hash
 * @param hash
 * @returns
 */
export const decodeContentHash = (hash: string) => {
	let decoded = contentHash.decode(hash);
	return upgradeCID(decoded);
};

export const getFastAvatar = async (address: string, web3Provider) => {
	const resolver = await web3Provider.getResolver(address);

	if (resolver === null) {
		return '/img/0x0z.jpg';
	}

	try {
		return await prepareAvatar(resolver, web3Provider, null, null);
	} catch (error) {
		return '/img/0x0z.jpg';
	}
};

export const setEnsTextRecord = async (
	ensDomain: string,
	resolverAddress: string,
	text: string,
	provider: ethers.providers.Provider,
	signer: ethers.Signer,
	record: string = 'contentHash'
) => {
	let node = ethers.utils.namehash(ensDomain);
	let abi = ['function setText(bytes32 node, string key, string value)'];
	const contract = new ethers.Contract(resolverAddress, abi, provider);
	const contractWithSigner = contract.connect(signer);
	const tx = await contractWithSigner.setText(node, record, text);
	return tx;
};

export const setENSContentHash = async (
	ensDomain: string,
	resolverAddress: string,
	ipfsContentHash: string,
	provider: ethers.providers.Provider,
	signer: ethers.Signer
) => {
	let node = ethers.utils.namehash(ensDomain);
	let abi = ['function setContenthash(bytes32 node, bytes hash)'];
	let encodedHash = encodeContentHash(ipfsContentHash);
	const contract = new ethers.Contract(resolverAddress, abi, provider);
	const contractWithSigner = contract.connect(signer);
	const tx = await contractWithSigner.setContenthash(
		node,
		'0x' + encodedHash
	);
	return tx;
};

/**
 *
 * @param currentCode
 * @param codeFormat
 * @returns
 */
export const prettifyCode = (currentCode: string, codeFormat = 'html') => {
	if (codeFormat === 'html') {
		currentCode = prettier(currentCode);
		//remove double spaces
		currentCode = currentCode.replace(/  /g, ' ');
		//prettify the code
		return currentCode;
	}

	if (codeFormat === 'js' || codeFormat === 'css') {
		//remove all tabs
		currentCode = currentCode.replace(/\t/g, '');
		//remove the white space before the first character on each line
		currentCode = currentCode.replace(/^\s+/gm, '');
		//if the line ends with a curly brace then add a new line
		currentCode = currentCode.replace(/}\s*$/gm, '\n}');
		//if the line ends with a curly brace then add a new line
		currentCode = currentCode.replace(/{\s*$/gm, '{\n');
		//loop through each line, adding tabs where necessary

		if (
			currentCode.indexOf('}') !== -1 &&
			currentCode.indexOf('{') !== -1
		) {
			let lines = currentCode.split('\n');
			let newLines = [];
			let tabCount = 0;
			for (let i = 0; i < lines.length; i++) {
				let line = lines[i];
				if (line.includes('}')) {
					tabCount--;
				}

				if (tabCount < 0) tabCount = 0;
				newLines.push('\t'.repeat(tabCount) + line);
				if (line.includes('{')) {
					tabCount++;
				}
			}
			currentCode = newLines.join('\n');
		}

		//remove empty lines
		currentCode = currentCode.replace(/^\s*[\r\n]/gm, '');

		return currentCode;
	}

	if (codeFormat === 'json' || codeFormat == '.xens') {
		currentCode = JSON.stringify(JSON.parse(currentCode), null, 2);
		return currentCode;
	}

	return currentCode;
};

/**
 *
 * @param str
 * @returns
 */
export const base64Encode = (str: string) => {
	return Buffer.from(str).toString('base64');
};

/**
 *
 * @param str
 * @param encoding
 * @returns
 */
export const base64Decode = (str: string, encoding?: BufferEncoding) => {
	return Buffer.from(str, 'base64').toString(encoding || 'utf8');
};
