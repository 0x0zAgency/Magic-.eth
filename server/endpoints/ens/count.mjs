import { success, userError } from '../../utils/helpers.mjs';
import server from '../../server.mjs';
import { ethers } from 'ethers';

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const get = async (req, res) => {
	let { address } = req.query;

	if (!address) return userError(res, 'Missing address');
	if (!ethers.utils.isAddress(address))
		return userError(res, 'Invalid address');

	let count = await server.prisma.eNS.count({
		where: {
			ownerAddress: address,
		},
	});

	return success(res, {
		count,
		pages: Math.ceil(count / server.config.magicMirror.pageMax),
		pageMax: server.config.magicMirror.pageMax,
	});
};
