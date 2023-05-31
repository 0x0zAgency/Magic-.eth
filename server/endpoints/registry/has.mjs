import server from '../../server.mjs';
import { success, userError } from '../../utils/helpers.mjs';

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const get = async (req, res) => {
	let domainName = req.query.domainName;

	if (!domainName) return userError(res, 'No domain name provided');

	let fakeRegistry = await server.prisma.fakeRegistry.findUnique({
		where: {
			domainName,
		},
	});
	if (!fakeRegistry)
		return success(res, {
			has: false,
		});

	if (!fakeRegistry.registry || !fakeRegistry.registry.length)
		return success(res, {
			has: false,
		});

	return success(res, {
		has: true,
	});
};
