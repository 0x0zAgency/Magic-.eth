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
	let temperature = parseFloat(req.body.temp) || 0.6;

	if (req.body.prompt === undefined)
		return userError(res, 'No prompt provided');

	if (isNaN(temperature)) temperature = 0.6;
	if (temperature > 3) temperature = 3;

	let n = parseInt(req.body.n) || 2;
	if (isNaN(n)) n = 2;
	if (n > 6) n = 6;
	if (n < 0) n = 1;

	try {
		const completion = await server.openAI.createCompletion({
			model: 'text-davinci-003',
			prompt: req.body.prompt,
			temperature,
			n,
			max_tokens: 2048,
			top_p: 1,
			frequency_penalty: 0,
			presence_penalty: 0,
		});
		return success(res, completion.data);
	} catch (error) {
		return userError(
			res,
			'Sorry, OpenAI is not responding right now. Please try again later.'
		);
	}
};
