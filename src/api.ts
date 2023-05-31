import config from './config';

type Routes = typeof config.routes;
type Keys = keyof Routes;

/**
 *
 * @returns
 */
export const getEndpointHref = () => {
	const isLocalhost = window.location.href.includes('localhost');
	if (isLocalhost && config.useLocalApi) return config.localApiEndpoint;
	else return config.apiEndpoint;
};

/**
 *
 * @param type
 * @returns
 */
export const getEndpoint = (type: Keys) => {
	if (config.routes[type] === undefined)
		throw new Error('invalid api type: ' + type);

	let route = config.routes[type];

	if (route[route.length - 1] !== '/') route += '/';
	return getEndpointHref() + route;
};

/**
 *
 * @param type
 * @param method
 * @param data
 * @param requestMethod
 * @param abortController
 * @returns
 */
export const apiFetch = async (
	type: Keys,
	method: string,
	data: any,
	requestMethod: 'GET' | 'POST' = 'GET',
	abortController?: AbortController
) => {
	let endPoint = getEndpoint(type);
	requestMethod = requestMethod || 'GET';
	endPoint = endPoint + method;
	if (requestMethod === 'GET' && data)
		endPoint += '?' + new URLSearchParams(data).toString();

	const result = await fetch(endPoint, {
		method: requestMethod,
		headers: { 'Content-Type': 'application/json' },
		signal: abortController?.signal,
		body:
			requestMethod === 'GET'
				? undefined
				: data
				? JSON.stringify(data)
				: JSON.stringify({}),
		credentials: 'include',
	});

	if (result.status !== 200) {
		let message = await result.json();

		if (message.message) message = message.message;
		if (message.error) message = message.error;
		throw new Error(message);
	}

	return await result.json();
};
