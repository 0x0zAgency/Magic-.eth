import { success, userError } from '../../utils/helpers.mjs';
import server from '../../server.mjs';

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const get = async (req, res) => {
	let { domainName, approved } = req.query;
	if (approved !== undefined) approved = approved === 'true' ? true : false;
	else approved = true;

	if (!domainName) return userError(res, 'No domain name');

	let managers = await server.prisma.manager.findMany({
		where: {
			domainName: domainName,
			approved: approved,
		},
	});

	return success(res, {
		managers,
	});
};
