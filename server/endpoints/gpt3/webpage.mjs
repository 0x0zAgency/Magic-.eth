import server from '../../server.mjs';
import { success, userError } from '../../utils/helpers.mjs';

/**
 *
 * @param {import('express').Request} request
 * @param {import('express').Response} response
 */
export const post = async (request, response) => {
	if (request.body.prompt === undefined)
		return userError(response, 'No prompt provided');

	if (request.body.ensAddress.split('.').pop() !== 'eth')
		return userError('response', 'not an ens address');

	try {
		let prompt = `Using HTML, create a site with an idea for ${request.body.ensAddress}.
      Return only valid HTML. Do not explain your thought process.`;

		if (server.redisClient.hGet(request.body.ensAddress)) {
			let data = server.redisClient.hGet(request.body.ensAddress);

			if (
				data.generated &&
				data.generate > Date.now() - 1000 * 60 * 60 * 24
			)
				return success(response, data);

			server.redisClient.del(request.body.ensAddress);
		}

		if (server.redisClient.hGet(request.body.ensAddress + '_pending')) {
			return success({
				status: 'pending',
				message:
					'This request is already being processed. Please check back in a few minutes',
			});
		}

		server.redisClient.hSet(request.body.ensAddress + '_pending', true);

		try {
			let completion = await server.openAI.createCompletion({
				model: 'text-davinci-003',
				prompt,
				temperature: 0.6,
				n: 4,
				max_tokens: 2_048,
				top_p: 1,
				frequency_penalty: 0,
				presence_penalty: 0,
			});

			let html =
				completion.data.choices[
					Math.floor(Math.random() * completion.data.choices.length)
				].text;

			let obj = {
				generated: Date.now(),
				prompt,
				status: 'generated',
				html: html,
			};

			server.redisClient.hSet(request.body.ensAddress, obj);
			return success(response, obj);
		} catch (error) {
			console.log('OpenAI Error', error);
			return userError(
				response,
				'Sorry, OpenAI is not responding right now. Please try again later.'
			);
		} finally {
			server.redisClient.hSet(
				request.body.ensAddress + '_pending',
				false
			);
		}
	} catch (error) {
		console.log('OpenAI Error', error);
		return userError(
			response,
			'Sorry, OpenAI is not responding right now. Please try again later.'
		);
	}
};
