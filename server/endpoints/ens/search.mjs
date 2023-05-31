import server from '../../server.mjs';
import { exclude, success, userError } from '../../utils/helpers.mjs';

export const settings = {
	requireLogin: true,
	admin: false,
};

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const get = async (req, res) => {
	let { page, domainName } = req.query;
	page = parseInt(page) || 0;

	if (!domainName) return userError(res, 'No domain name provided');
	//search for the address in the database
	let enses = await server.prisma.eNS.findMany({
		where: {
			domainName: {
				contains: domainName,
			},
		},
		skip: page * server.config.magicMirror.pageMax,
		take: server.config.magicMirror.pageMax + 1, //+1 to see if there is a next page
		include: {
			Stats: true,
			Manager: true,
		},
	});

	//if there is a next page, remove the last element
	let nextPage = false;
	if (enses.length > server.config.magicMirror.pageMax) {
		nextPage = true;
		enses.pop();
	}

	if (enses)
		enses = enses.map((ens) => {
			if (ens.Manager) ens.managerCount = Object.keys(ens.Manager).length;
			return exclude(ens, ['User', 'History', 'Manager']);
		});

	return success(res, {
		nfts: enses,
		nextPage,
	});
};
