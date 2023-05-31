import server from '../../server.mjs';
import { success, userError } from '../../utils/helpers.mjs';

export const settings = {
	requireLogin: true,
};

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const post = async (req, res) => {
	let domainName = req.body.domainName;
	let registry = req.body.registry;
	if (!domainName) return userError(res, 'No domain name provided');
	if (!registry) return userError(res, 'No registry provided');

	//check if the ENS exists
	let ens = await server.prisma.eNS.findUnique({
		where: {
			domainName,
		},
	});

	if (!ens)
		return userError(
			res,
			'ENS not found in our servers. Please fetch your ENS through the property manager.'
		);

	//update or create the fake registry
	let fakeRegistry = await server.prisma.fakeRegistry.upsert({
		where: {
			domainName,
		},
		update: {
			registry,
			ownerAddress: ens.ownerAddress,
		},
		create: {
			domainName,
			registry,
			ownerAddress: ens.ownerAddress,
		},
	});

	//update the ENS
	await server.prisma.eNS.update({
		where: {
			domainName,
		},
		data: {
			FakeRegistry: fakeRegistry,
		},
	});

	//return success
	return success(res, {
		fakeRegistry,
	});
};
