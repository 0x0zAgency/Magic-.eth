import { exclude, success, userError } from '../../utils/helpers.mjs';
import server from '../../server.mjs';
import { ethers } from 'ethers';
/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const get = async (req, res) => {
	let { address, page, justDomainNames } = req.query;
	page = parseInt(page) || 0;
	justDomainNames = justDomainNames === 'true';

	if (!address) return userError(res, 'Missing address');
	if (!ethers.utils.isAddress(address))
		return userError(res, 'Invalid address');

	let statement = {
		where: {
			ownerAddress: address,
		},
		skip: page * server.config.magicMirror.pageMax,
		take: server.config.magicMirror.pageMax,
	};
	if (justDomainNames)
		statement.select = {
			domainName: true,
		};
	let enses = await server.prisma.eNS.findMany(statement);

	if (enses)
		enses = enses.map((ens) => {
			return exclude(ens, ['Manager', 'User']);
		});

	return success(res, {
		nfts: enses,
	});
};
