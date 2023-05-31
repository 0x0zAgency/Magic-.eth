import { isValidENS, success, userError } from '../../utils/helpers.mjs';
import server from '../../server.mjs';

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const post = async (req, res) => {
	let { cid, domainName } = req.body;
	let links = [];

	if (!cid) return userError(res, 'Bad CID');
	try {
		for await (const link of server.ipfs.ls(cid)) {
			if (links.length > 32) break;

			if (link.type === 'file') {
				const stats = await server.ipfs.object.stat(link.path);
				link.size = stats.CumulativeSize;

				if (!link.name) continue;
				const extension = link.name.split('.').pop();

				if (
					!server?.config?.magicMirror.allowedExtensions?.includes(
						extension
					)
				)
					continue;
			}
			// is dir
			links.push(link);
		}
	} catch (error) {
		console.log(error);
		return userError(res, 'Bad CID');
	}

	const musicExtensions = ['mp3', 'wav', 'ogg', 'flac'];
	const videoExtensions = ['mp4', 'webm', 'mov'];
	const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'svg'];
	const hasXENS =
		links.filter(
			(link) => link.name && link.name.split('.').pop() === 'xens'
		).length > 0;
	const hasIndex =
		links.filter((link) => link?.name === 'index.html').length > 0;
	const hasReadme =
		links.filter((link) => link?.name === 'README.md').length > 0;
	const hasLicense =
		links.filter((link) => link?.name === 'LICENSE.md').length > 0;
	const hasPackage =
		links.filter((link) => link?.name === 'package.json').length > 0;
	const hasManifest =
		links.filter((link) => link?.name === 'manifest.json').length > 0;
	const hasSettings =
		links.filter((link) => link?.name === 'settings.json').length > 0;
	const hasCSS =
		links.filter((link) => link?.name === 'style.css').length > 0;
	const hasJS = links.filter((link) => link?.name === 'script.js').length > 0;
	const hasMusic =
		links.filter((link) => {
			return (
				link.name &&
				musicExtensions.includes(link.name.split('.').pop())
			);
		}).length > 0;
	const hasImages =
		links.filter((link) => {
			return (
				link.name &&
				imageExtensions.includes(link.name.split('.').pop())
			);
		}).length > 0;
	const hasVideos =
		links.filter((link) => {
			return (
				link.name &&
				videoExtensions.includes(link.name.split('.').pop())
			);
		}).length > 0;
	const videoCount = links.filter((link) => {
		return (
			link.name && videoExtensions.includes(link.name.split('.').pop())
		);
	}).length;
	const imageCount = links.filter((link) => {
		return (
			link.name && imageExtensions.includes(link.name.split('.').pop())
		);
	}).length;
	const musicCount = links.filter((link) => {
		return (
			link.name && musicExtensions.includes(link.name.split('.').pop())
		);
	}).length;
	const fileCount = links.filter((link) => link.type === 'file').length;
	const dirCount = links.filter((link) => link.type === 'dir').length;
	const hasPartialIndex =
		links.filter((link) => link?.name === 'index.partial').length > 0;
	const hasPartialCSS =
		links.filter((link) => link?.name === 'css.partial').length > 0;
	const hasPartialJS =
		links.filter((link) => link?.name === 'js.partial').length > 0;

	//adds to the hourly views of this domain
	if (
		domainName &&
		isValidENS(domainName) &&
		(await server.redisClient.hGet(req.ip, domainName)) !== 'true'
	) {
		let currentHourlyViews =
			(await server.redisClient.hGet('stats', domainName)) || 0;

		await server.redisClient.hSet(
			'stats',
			domainName,
			(parseInt(currentHourlyViews) + 1).toString()
		);

		await server.redisClient.hSet(req.ip, domainName, 'true', 'EX', 10);
	}
	success(res, {
		cid,
		files: links,
		dirs: links.filter((link) => link.type === 'dir'),
		dirCount,
		hasXENS,
		hasIndex,
		hasReadme,
		hasLicense,
		hasPackage,
		hasPartialIndex,
		hasPartialCSS,
		hasPartialJS,
		hasManifest,
		hasSettings,
		hasMusic,
		hasCSS,
		hasJS,
		hasImages,
		hasVideos,
		videoCount,
		imageCount,
		musicCount,
		fileCount,
	});
};
