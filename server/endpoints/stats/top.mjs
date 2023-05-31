import server from '../../server.mjs';
import { exclude, success, userError } from '../../utils/helpers.mjs';

export const settings = {
	requireLogin: false,
	requireTicket: false,
	admin: false,
};

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const get = async (req, res) => {
	let parameter = req.query.parameter;
	let order = req.query.order;
	order = order || 'desc';
	parameter = parameter || 'totalViews';

	if (order !== 'desc' && order !== 'asc')
		return userError(res, 'Invalid order');

	if (
		parameter !== 'totalViews' &&
		parameter !== 'lastHourViews' &&
		parameter !== 'lastDayViews' &&
		parameter !== 'lastWeekViews' &&
		parameter !== 'lastMonthViews' &&
		parameter !== 'lastYearViews'
	)
		return userError(res, 'Invalid parameter');

	//return top 100 domains by total views
	let top = await server.prisma.stats.findMany({
		orderBy: { [parameter]: order },
		take: 100,
	});
	top = top.filter((x) => x[parameter] > 0);
	top = top.map((x) => {
		return exclude(x, ['ENS']);
	});
	return success(res, top);
};
