import server from '../../server.mjs';
import { ethers } from 'ethers';

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
	let address = req.session.siwe.address;

	if (!address) return userError(res, 'Missing address');
	if (!ethers.utils.isAddress(address))
		return userError(res, 'Invalid address');

	let erc721 = await server.infinityConsole.getProjectERC721();
	//then we call balance of
	let balance = await erc721.balanceOf(address);

	return success(res, {
		has: balance > 0,
		count: balance,
	});
};
