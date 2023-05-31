import server from '../../server.mjs';
import { isValidENS, success, userError } from '../../utils/helpers.mjs';

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
export const post = async (req, res) => {
	let { domainName } = req.body;
	if (!domainName) return userError(res, 'No domain name provided');

	if (!isValidENS(domainName))
		return console.log('Invalid domain name: ' + domainName);

	if (await server.prisma.eNS.findUnique({ where: { domainName } })) {
		//update the views
		let totalViews = 0;
		let previous = await server.prisma.stats.findUnique({
			where: { domainName },
		});
		totalViews = previous.totalViews;

		if (
			!(await server.prisma.history.findFirst({
				where: {
					domainName,
					address: req.session.siwe.address,
				},
			}))
		) {
			totalViews++;
			await server.prisma.history.create({
				data: {
					address: req.session.siwe.address,
					domainName,
				},
			});
		}

		await server.prisma.stats.upsert({
			where: { domainName },
			update: { totalViews },
			create: {
				totalViews,
				domainName,
			},
		});
	}

	//adds to the hourly views of this domain
	if (domainName) {
		let currentHourlyViews =
			(await server.redisClient.hGet('stats', domainName)) || 0;

		await server.redisClient.hSet(
			'stats',
			domainName,
			(parseInt(currentHourlyViews) + 1).toString()
		);
	}

	return success(res);
};
