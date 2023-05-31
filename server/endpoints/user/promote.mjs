//import server from '../../server.mjs';

import server from '../../server.mjs';
import { success, userError } from '../../utils/helpers.mjs';

export const settings = {
	requireLogin: true,
	admin: true,
};

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const post = async (req, res) => {
	let address = req.body.address;
	let group = req.body.group;

	if (!address) return userError(res, 'Missing address');
	if (!ethers.utils.isAddress(address))
		return userError(res, 'Invalid address');

	let user = await server.prisma.user.findUnique({
		where: {
			address,
		},
	});

	if (!user) return userError(res, 'User not found');

	if (user.role === 'ADMIN' && req.session.role !== 'SUPER_ADMIN')
		return userError(res, 'Only super admins can promote or demote admins');

	await server.prisma.user.update({
		where: {
			address,
		},
		data: {
			role: group.toUpperCase(),
		},
	});

	return success(res);
};
