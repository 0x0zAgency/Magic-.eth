import { success } from '../../utils/helpers.mjs';
import server from '../../server.mjs';

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const post = async (req, res) => {
  const cid = req.body.cid;
  const links = [];

  if (!cid) return userError(res, 'Bad CID');

  try {
    for await (const link of server.ipfs.ls(cid)) {
      if (links.length > 32) break;

      if (link.type === 'file') {
        const stats = await server.ipfs.object.stat(link.path);
        link.size = stats.CumulativeSize;

        if (!link.name) continue;

        const extension = link.name.split('.').pop();

        if (!server?.config?.allowedExtensions?.includes(extension)) continue;

        if (link.size < 1024 * 1024 * 10) {
          const resp = server.ipfs.cat(link.path);
          let content = [];
          for await (const chunk of resp) {
            content = [...content, ...chunk];
          }
          link.content = content;
        }
        links.push(link);
        continue;
      }

      // is dir
      links.push(link);
    }
  } catch (error) {
    console.log(error);
    return userError(res, 'Bad CID');
  }

  success(res, {
    cid,
    files: links,
  });
};
