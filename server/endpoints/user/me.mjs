import server from '../../server.mjs';
import { success } from '../../utils/helpers.mjs';
import { ethers } from 'ethers';

export const settings = {
	requireLogin: true,
};

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const get = async (req, res) => {
	let address = req.session.siwe.address;

	if (!address) return userError(res, 'Missing address');
	if (!ethers.utils.isAddress(address))
		return userError(res, 'Invalid address');

	let user = await server.prisma.user.findUnique({
		where: {
			address,
		},
		select: {
			address: true,
			createdAt: true,
			role: true,
		},
	});

	return success(res, {
		user,
	});
};
