import { generateNonce } from 'siwe';
import { success, userError } from '../../utils/helpers.mjs';

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns
 */
export const get = (req, res) => {
	if (req.session.siwe)
		return userError(
			res,
			'You are already logged in. Please log out to generate a new nonce to login with.'
		);

	//generate the nonce required for the login step
	req.session.nonce = generateNonce();
	return success(res, { nonce: req.session.nonce });
};
