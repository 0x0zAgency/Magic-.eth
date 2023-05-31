import React, { createContext, useEffect } from 'react';
import Header from '../components/Header';
import useWeb3Context from '../effects/useWeb3Context';
import { ethers } from 'ethers';
import PropTypes from 'prop-types';
import WebEvents from '../webEvents';

export interface Web3ContextType {
	balance: number;
	accounts: string[];
	ensAddresses: string[];
	walletInstalled: boolean;
	walletConnected: boolean;
	walletAddress: string;
	web3Provider:
		| ethers.providers.Web3Provider
		| ethers.providers.JsonRpcProvider;
	walletError: Error;
	chainId: number;
	loaded: boolean;
	refreshEvent: {
		current: Function;
	};
	walletChangedEvent: {
		current: Function;
	};
	signer: ethers.Signer;
}

export const Web3Context = createContext({
	balance: null,
	accounts: [],
	ensAddresses: [],
	signer: null,
	walletInstalled: false,
	walletConnected: false,
	walletAddress: null,
	web3Provider: null,
	walletError: null,
	chainId: -1,
	refreshEvent: null,
	loaded: false,
	walletChangedEvent: null,
});

function Web3ContextProvider({ children }) {
	const {
		accounts,
		walletInstalled,
		walletConnected,
		walletAddress,
		chainId,
		loaded,
		web3Provider,
		signer,
		walletError,
		ensAddresses,
		balance,
		refreshEvent,
		walletChangedEvent,
	} = useWeb3Context();

	//in order to avoid the events being deleted on every update to the context, we need to use a cleanup function and define events here here not in the context
	useEffect(() => {
		if (!loaded) return;

		if ((window as any).ethereum !== undefined) {
			(window as any).ethereum.on(
				'accountsChanged',
				walletChangedEvent.current
			);
			(window as any).ethereum.on(
				'chainChanged',
				walletChangedEvent.current
			);
		}

		//do the reload event
		WebEvents.on('reload', refreshEvent.current);

		return () => {
			WebEvents.off('reload', refreshEvent.current);
			if ((window as any).ethereum !== undefined) {
				(window as any).ethereum.removeListener(
					'accountsChanged',
					walletChangedEvent.current
				);
				(window as any).ethereum.removeListener(
					'chainChanged',
					walletChangedEvent.current
				);
			}
		};
	}, [loaded]);

	return (
		<Web3Context.Provider
			value={
				{
					accounts,
					walletInstalled,
					walletConnected,
					walletAddress,
					chainId,
					loaded,
					ensAddresses,
					web3Provider,
					signer,
					walletError,
					balance,
					refreshEvent,
					walletChangedEvent,
				} as Web3ContextType
			}
		>
			{loaded ? (
				<>{children}</>
			) : (
				<Header
					theme="acid"
					initialText="Initializing Web3 Connection..."
					showFinder={false}
				/>
			)}
		</Web3Context.Provider>
	);
}

Web3ContextProvider.propTypes = {
	children: PropTypes.any,
};

export default Web3ContextProvider;
