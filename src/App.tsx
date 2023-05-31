import React from 'react';
import Web3ContextProvider from './contexts/web3Context';
import ENSContextProvider from './contexts/ensContext';
import IDE from './pages/IDE';
import Index from './pages/Index';
import Viewer from './pages/Viewer';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import NotFound from './pages/NotFound';
import LoginContextProvider from './contexts/loginContext';
import Converter from './pages/utilities/Converter';
import ContentHash from './pages/utilities/ContentHash';
import NameHash from './pages/utilities/NameHash';
import Dashboard from './pages/utilities/Dashboard';
import ENSLookup from './pages/utilities/ENSLookup';
import User from './pages/utilities/User';
import Logout from './pages/utilities/Logout';
import Properties from './pages/Properties';
import Leaderboard from './pages/Leaderboard';
import HistoryCapture from './components/HistoryCapture';
import History from './pages/History';
import ClientProvider from 'infinitymint-client/dist/src/contexts/clientProvider';
import VirtualRegistry from './pages/VirtualRegistry';
import ENS from './pages/ENS';
import config from './infinitymint.client.config';

function App() {
	return (
		<ClientProvider config={config}>
			<Web3ContextProvider>
				<LoginContextProvider>
					<ENSContextProvider>
						<BrowserRouter>
							<HistoryCapture>
								<Switch>
									<Route path="/ide">
										<IDE />
									</Route>
									<Route exact path="/">
										<Index />
									</Route>
									<Route exact path="/index">
										<Index />
									</Route>
									<Route path="/view/:token">
										<Viewer />
									</Route>
									<Route path="/viewer/:token">
										<Viewer />
									</Route>
									<Route path="/🧱/:token">
										<Viewer />
									</Route>
									<Route path="/registry/:domain">
										<VirtualRegistry />
									</Route>
									<Route path="/ens/:domain">
										<ENS />
									</Route>
									<Route exact path="/utilities/converter">
										<Converter />
									</Route>
									<Route exact path="/utilities/contenthash">
										<ContentHash />
									</Route>
									<Route exact path="/utilities/ens">
										<ENSLookup />
									</Route>
									<Route exact path="/utilities/">
										<Dashboard />
									</Route>
									<Route exact path="/utilities/namehash">
										<NameHash />
									</Route>
									<Route exact path="/utilities/user">
										<User />
									</Route>
									<Route exact path="/utilities/logout">
										<Logout />
									</Route>
									<Route exact path="/properties">
										<Properties />
									</Route>
									<Route exact path="/leaderboard/top">
										<Leaderboard />
									</Route>
									<Route exact path="/history">
										<History />
									</Route>
									<Route exact path="*">
										<NotFound />
									</Route>
								</Switch>
							</HistoryCapture>
						</BrowserRouter>
					</ENSContextProvider>
				</LoginContextProvider>
			</Web3ContextProvider>
		</ClientProvider>
	);
}

export default App;
