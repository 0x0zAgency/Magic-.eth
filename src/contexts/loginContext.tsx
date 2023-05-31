import React, { createContext, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useLogin } from '../effects/useLogin';

export interface loginContextType {
	login: Function;
	isSignedIn: boolean;
	loaded: boolean;
	error: Error;
	address: string;
	destroy: Function;
	isIncorrectAddress: boolean;
	checkLogin: Function;
}

export const LoginContext = createContext({
	login: null,
	isSignedIn: false,
	loaded: false,
	error: null,
	address: null,
	destroy: null,
	isIncorrectAddress: false,
	checkLogin: null,
});

function LoginContextProvider({ children }) {
	const {
		login,
		isSignedIn,
		loaded,
		error,
		address,
		isIncorrectAddress,
		destroy,
		checkLogin,
	} = useLogin();

	return (
		<LoginContext.Provider
			value={
				{
					login,
					isSignedIn,
					loaded,
					error,
					address,
					destroy,
					isIncorrectAddress,
					checkLogin,
				} as loginContextType
			}
		>
			<>{children}</>
		</LoginContext.Provider>
	);
}

LoginContextProvider.propTypes = {
	children: PropTypes.any,
};

export default LoginContextProvider;
