import server from '../../server.mjs';
import { success, userError } from '../../utils/helpers.mjs';

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
	let { domainName, address } = req.query;
	address = address || req.session.siwe.address;

	if (!address) return userError(res, 'No address provided');

	if (!domainName) return userError(res, 'No domain name provided');

	let ens = await server.prisma.eNS.findFirst({
		where: {
			domainName: domainName,
		},
	});
	if (ens.ownerAddress === address) return success(res, { approved: true });
	let manager = await server.prisma.manager.findFirst({
		where: {
			domainName: domainName,
			address: address,
		},
	});
	if (manager) return success(res, { approved: manager.approved });

	return success(res, { approved: false });
};
