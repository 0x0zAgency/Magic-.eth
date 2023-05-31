import server from '../../server.mjs';
import { exclude, userError, success } from '../../utils/helpers.mjs';

export const settings = {
	requireLogin: false,
	requireTicket: false,
	admin: false,
};

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const get = async (req, res) => {
	let { domainName } = req.query;

	if (!domainName) return userError(res, 'No domain name');

	let stats = await server.prisma.stats.findFirst({
		where: { domainName },
	});
	if (!stats) return userError(res, 'No stats found');
	stats = exclude(stats, ['ENS']);
	return success(res, stats);
};
