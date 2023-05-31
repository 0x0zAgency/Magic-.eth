import siwe from 'siwe';
import server from '../../server.mjs';
import { success, userError } from '../../utils/helpers.mjs';
//siwe stuff
const { SiweMessage, ErrorTypes } = siwe;
/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const post = async (req, res) => {
	try {
		if (!req.body.message) return userError(res, 'Missing message.');

		let SIWEObject = new SiweMessage(req.body.message);
		let { data: message } = await SIWEObject.verify({
			signature: req.body.signature,
			nonce: req.session.nonce,
		});

		req.session.siwe = message;
		req.session.cookie.expires = new Date(message.expirationTime);

		//add them to the database if they don't exist
		if (
			!(await server.prisma.user.count({
				where: {
					address: message.address,
				},
			}))
		)
			await server.prisma.user.create({
				data: {
					address: message.address,
				},
			});

		//fetch the user
		let user = await server.prisma.user.findUnique({
			where: {
				address: message.address,
			},
			select: {
				role: true,
			},
		});

		req.session.role = user.role;

		if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')
			req.session.admin = true;

		//set the current address to equal the current sessionId, we do this to prevent session hijacking and if they switch wallet
		await server.redisClient.set(message.address, req.sessionID);
		//save the session
		await new Promise((resolve) => req.session.save(resolve));

		return success(res, {
			verified: true,
			address: message.address,
		});
	} catch (err) {
		req.session.siwe = null;
		req.session.nonce = null;
		req.session.role = null;
		req.session.admin = null;
		await new Promise((resolve) => req.session.save(resolve));
		// Log the error.
		console.error(err);
		// Very specifc error handling.
		switch (err) {
			case ErrorTypes.EXPIRED_MESSAGE:
				return userError(res, 'Expired message.');

			case ErrorTypes.INVALID_SIGNATURE:
				return userError(res, 'Invalid signature.');
			default:
				return userError(res, err.message);
		}
	}
};
