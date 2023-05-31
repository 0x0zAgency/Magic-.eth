import { InfinityMintProject } from '@app/interfaces';

const magicmirror: InfinityMintProject = {
	name: 'magicmirror',
	price: '$0.69',
	modules: {
		random: 'SeededRandom',
		assets: 'SimpleSVG',
		minter: 'DefaultMinter',
		royalty: 'DefaultRoyalty',
	},
	information: {
		tokenSymbol: '†',
		tokenSingular: 'Example',
	},
	permissions: {
		all: [],
	},
	paths: [
		{
			name: 'Magic Ticket',
			fileName: '/imports/ticket.svg',
			settings: true,
			content: {
				background: {
					fileName: '/imports/backgrounds/0x0z.png',
					name: 'Background Image',
				},
			},
		},
	],
};

export default magicmirror;
