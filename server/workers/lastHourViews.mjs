import server from '../server.mjs';
import { isValidENS } from '../utils/helpers.mjs';

//runs every 1 hour, takes the stats from the redis db and saves them to the prisma db
export const settings = {
	runEvery: 60 * 60 * 1000,
};

export const run = async () => {
	let domainStats = await server.redisClient.hGetAll('stats');

	for (let domainName in domainStats) {
		let lastHourViews = parseInt(domainStats[domainName]);

		if (!isValidENS(domainName)) {
			await server.redisClient.hDel('stats', domainName);
			console.log('Invalid domain name: ' + domainName);
			continue;
		}

		//if the domain name is not in ENS Table, do a further chec
		if (!(await server.prisma.eNS.findUnique({ where: { domainName } }))) {
			//make it lower case
			domainName = domainName.toLowerCase();
			//check if ENS exists in the blockchain
			let provider = server.infinityConsole.getProvider();
			let ens = await provider.getResolver(domainName);

			if (!ens) {
				await server.redisClient.hDel('stats', domainName);
				console.log(
					'Domain name not found in blockchain or no resolver set: ' +
						domainName
				);
				continue;
			}
		}

		let stats = await server.prisma.stats.findUnique({
			where: { domainName },
		});

		await server.prisma.stats.upsert({
			where: { domainName },
			update: {
				lastHourViews,
				lastDayViews: (stats?.lastDayViews || 0) + lastHourViews,
				totalViews: (stats?.totalViews || 0) + lastHourViews,
			},
			create: {
				lastHourViews,
				lastDayViews: lastHourViews,
				domainName,
				totalViews: lastHourViews,
			},
		});

		await server.redisClient.hSet('stats', domainName, '0');
	}
};
