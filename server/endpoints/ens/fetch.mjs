import { success, userError } from '../../utils/helpers.mjs';
import server from '../../server.mjs';
import { ethers } from 'ethers';

export const settings = {
	requireLogin: true,
	admin: false,
};

export const get = async (req, res) => {
	await post(req, res);
};

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const post = async (req, res) => {
	let address = req.session.siwe.address;

	if (!address) return userError(res, 'Missing address');
	if (!ethers.utils.isAddress(address))
		return userError(res, 'Invalid address');

	let lastFetched = await server.prisma.lastFetched.findFirst({
		where: {
			address: address,
		},
	});

	//if last fetched less than an hour ago, return
	if (
		lastFetched &&
		lastFetched.lastFetched &&
		lastFetched.lastFetched >
			(lastFetched.isPowerUser
				? Date.now() - 1000 * 60 * 60
				: Date.now() - 1000 * 60 * 5)
	)
		return userError(
			res,
			lastFetched.isPowerUser
				? 'You must wait at least 1 hour before fetching again'
				: 'You must wait at least 5 minutes before fetching again'
		);

	try {
		let totalCount = 0;
		let fetchNFTS = async (currentAddress, pageKey) => {
			let nfts = await server.alchemy.nft.getNftsForOwner(
				process.env.BE_THE_WIZARD === 'true'
					? '0xDFF917ab602e8508b6907dE1b038dd52B24A2379'
					: address,
				{
					contractAddresses: [
						'0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85',
					],
					pageKey: pageKey,
				}
			);

			for (let i = 0; i < nfts.ownedNfts.length; i++) {
				let nft = nfts.ownedNfts[i];

				totalCount++;

				if (!nft.title || nft.title.length === 0)
					nft.title = '#' + nft.tokenId;

				if (
					!(await server.prisma.stats.findUnique({
						where: { domainName: nft.title },
					}))
				)
					await server.prisma.stats.create({
						data: { domainName: nft.title, totalViews: 0 },
					});

				await server.prisma.eNS.upsert({
					where: {
						tokenId: nft.tokenId,
					},
					update: {
						tokenId: nft.tokenId,
						ownerAddress: currentAddress,
						ensContractAddress: nft.contract.address,
						domainName: nft.title,
						nftUri: nft.tokenUri,
						nftName: nft.title,
						nftDescription: nft.description,
						nftMedia: nft.media,
					},
					create: {
						tokenId: nft.tokenId,
						ownerAddress: currentAddress,
						ensContractAddress: nft.contract.address,
						domainName: nft.title,
						nftUri: nft.tokenUri,
						nftName: nft.title,
						nftDescription: nft.description,
						nftMedia: nft.media,
					},
				});
			}

			if (nfts.pageKey) await fetchNFTS(currentAddress, nfts.pageKey);
		};

		await fetchNFTS(address);

		if (totalCount > 0)
			await server.prisma.lastFetched.upsert({
				where: {
					address: address,
				},
				update: {
					lastFetched: new Date(),
					isPowerUser: totalCount > 100,
				},
				create: {
					address: address,
					lastFetched: new Date(),
					isPowerUser: totalCount > 100,
				},
			});

		return success(res, {
			success: true,
			totalCount: totalCount,
		});
	} catch (error) {
		console.log(error);
		return userError(res, 'Failed to fetch: ' + error.message);
	}
};
