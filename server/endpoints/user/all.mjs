import server from '../../server.mjs';

export const settings = {
	requireLogin: true,
	requireTicket: false,
	admin: true,
};

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const get = async (req, res) => {
	let { page } = req.query;
	page = parseInt(page) || 0;
	let users = await server.prisma.user.findMany({
		skip: server.config.magicMirror.pageMax * page,
		take: server.config.magicMirror.pageMax,
	});

	users = users.map((user) => {
		return exclude(user, ['ENS']);
	});

	return success(res, {
		users,
	});
};
