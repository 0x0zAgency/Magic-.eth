import { isLoggedIn, success } from '../../utils/helpers.mjs';
import server from '../../server.mjs';

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const get = async (req, res) => {
	if ((await isLoggedIn(req, server)) !== true)
		return success(res, {
			verified: false,
			reason: await isLoggedIn(req, server),
		});

	return success(res, {
		verified: true,
		address: req.session.siwe.address,
	});
};
