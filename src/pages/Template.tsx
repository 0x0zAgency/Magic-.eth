import React from 'react';
// Page Routing
import { withRouter } from 'react-router-dom';
//Storage Controller & Config
import storage from '../storage';
import config from '../config';

function Template() {
	return (
		<div
			data-theme={
				storage.getGlobalPreference('defaultTheme') ||
				config.defaultTheme ||
				'forest'
			}
		></div>
	);
}

export default withRouter(Template);
