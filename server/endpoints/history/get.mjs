import { ethers } from 'ethers';
import server from '../../server.mjs';
import { userError, success } from '../../utils/helpers.mjs';

export const settings = {
	requireLogin: true,
	requireTicket: false,
	admin: false,
};

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const get = async (req, res) => {
	let order = req.query.order;

	if (!order) order = 'desc';
	if (order !== 'desc' && order !== 'asc')
		return userError(res, 'Invalid order');

	let address = req.session.siwe.address;

	if (!address) return userError(res, 'No address');
	if (!ethers.utils.isAddress(address))
		return userError(res, 'Invalid address');

	let history = await server.prisma.history.findMany({
		where: { address },
		orderBy: { createdAt: order },
	});
	return success(res, history);
};
