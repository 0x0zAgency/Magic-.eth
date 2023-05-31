import EventEmitter from 'events';

export interface WebEmitterEvents {
	gotoDestination: Function;
	walletError: Function;
	reload: Function;
	reloadENS: Function;
}

export declare interface WebEventEmitter {
	on: (eventName: keyof WebEmitterEvents, cb: Function) => any;
	emit: (eventName: keyof WebEmitterEvents, ...args: any[]) => any;
}

/**
 * WARNING: Hacky bullshit below
 */
// eslint-disable-next-line no-redeclare
export class WebEventEmitter extends EventEmitter {}
const WebEvents = new WebEventEmitter();

export default WebEvents;
