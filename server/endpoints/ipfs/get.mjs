import { success, userError } from '../../utils/helpers.mjs';
import server from '../../server.mjs';

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const post = async (req, res) => {
	let cid = req.body.cid;
	let file;

	if (!cid) return userError(res, 'Bad CID');

	try {
		file = server.ipfs.get(cid);
		const stats = await server.ipfs.object.stat(link.path);
		link.size = stats.CumulativeSize;

		const extension = link.name.split('.').pop();

		if (
			!server?.config?.magicMirror.allowedExtensions?.includes(extension)
		) {
			throw new Error('File extension not allowed');
		}
	} catch (error) {
		console.log(error);
		return userError(res, 'Bad CID');
	}

	if (link.size > 1024 * 1024 * 10) throw new Error('File too big');

	let resp = server.ipfs.cat(cid);
	let content = [];
	for await (const chunk of resp) {
		content = [...content, ...chunk];
	}
	file.content = content;

	success(res, {
		cid,
		...file,
	});
};
