import glob from 'glob';

/**
 *
 * @param {import('express').Response} res
 * @param {object | string} data
 * @returns
 */
export const success = (res, data) => {
	if (!data) data = {};

	if (res.locals === undefined)
		throw new Error(
			'you have forgot to pass the express Response as the first argument to success()'
		);

	if (typeof data === 'string') data = { message: data };
	if (data.ok === undefined) data.ok = true;
	res.status(200).json(data);
};

/**
 * Excutes keys on a row, also works on an object of course :)
 * @param {*} row
 * @param {*} keys
 * @returns
 */
export const exclude = (row, keys) => {
	for (let key of keys) {
		delete row[key];
	}
	return row;
};

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('../server.mjs').Server} server
 * @returns
 */
export const isLoggedIn = async (req, server) => {
	if (!req?.session?.siwe) return 'You are not signed in with SIWE!';

	if (
		req?.sessionID !==
		(await server.redisClient.get(req.session?.siwe?.address))
	)
		return 'Security Issue: SessionID is attached to different address';

	return true;
};

/**
 * Returns true if the string is a valid ENS domain
 * @param {string} ens
 * @returns
 */
export const isValidENS = (ens) => {
	if (ens.length > 253) return false;
	if (!ens.endsWith('.eth')) return false;

	return true;
};

/**
 *
 * @param {import('express').Response} res
 * @param {string | object} message
 * @returns
 */
export const userError = (res, message) => {
	if (message?.error !== undefined) message = message.error;
	res.status(400).json({
		ok: false,
		error: message,
	});
	return false;
};

/**
 * @param {import('infinitymint/dist/app/interfaces').InfinityMintConfig} config
 * @returns
 */
export const getEndpointPath = (config) => {
	let endpointPath = config?.magicMirror?.endpointPath || 'server/endpoints';
	if (endpointPath[endpointPath.length - 1] !== '/') endpointPath += '/';
	return process.cwd() + '/' + endpointPath;
};

/**
 * Fetches all endpoints
 * @returns
 */
export const findEndpoints = async (endpointPath) => {
	return await new Promise(async (resolve, reject) => {
		glob(endpointPath + '**/*.mjs', (err, files) => {
			if (err) {
				reject(err);
			}
			resolve(files);
		});
	});
};
