import server from '../../server.mjs';
import { success, userError } from '../../utils/helpers.mjs';

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const post = async (req, res) => {
	if (!req.session.siwe) return userError(res, 'Missing session');
	try {
		await server.redisClient.del(req.session.siwe.address);
		req.session.destroy();
		return success(res, {
			destroyed: true,
		});
	} catch (err) {
		return userError(res, 'Internal server error, you may never leave');
	}
};
