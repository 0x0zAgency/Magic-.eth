import server from '../../server.mjs';
import { success, userError } from '../../utils/helpers.mjs';

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const post = async (req, res) => {
	let name = req.body.path;

	if (!name.includes('/ipns/')) name = '/ipns/' + name;

	if (!name) {
		return res.status(400).send({
			error: 'Missing name',
		});
	}

	let path;
	let result = await server.ipfs.name.resolve(name, {
		timeout: 2000,
	});

	for await (const name of result) {
		path = name;
	}

	if (path === undefined)
		return userError(res, 'eth address has bad IPNS resolution');

	return success(res, {
		cid: path,
	});
};
