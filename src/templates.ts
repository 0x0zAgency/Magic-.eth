import { fetchContent } from './helpers';

/**
 * These are the default tabs which are added to the Dream Studio template creator
 */
export const defaultTabs = {
	html: {
		name: '📃',
		icon: 'code',
		language: 'html',
		code: '',
	},
	css: {
		name: '🖌️',
		icon: 'code',
		language: 'css',
		code: '/* custom css code */',
	},
	js: {
		name: '🧩',
		icon: 'code',
		language: 'javascript',
		code: '//custom javascript code',
	},
	'.xens': {
		name: '📜',
		icon: 'code',
		language: 'json',
		code: '',
	},
};

/**
 * These are the templates which are added to the Dream Studio template creator
 */
const defaultTemplates: any = {};

/**
 * @name basic
 * @description Start with nothing and build your own project
 */
defaultTemplates.basic = {
	name: 'Start From Scratch',
	description: 'Start with nothing and build your own project',
	onSelection: (tabs: any, setCode: any) => {
		//should do stuff and set up the project
		let result = {
			...defaultTabs,
		};

		result['.xens'] = {
			...result['.xens'],
			code: JSON.stringify(
				{
					name: 'Magic Mirror',
					description: 'A Magic Mirror',
					author: 'Magic Mirror',
					version: '0.0.1',
					direct: false,
				},
				null,
				2
			),
		};

		setCode({
			...result,
		});
	},
};

/**
 * @name advanced
 * @description Start with some JavaScript and HTML demonstrating how to use the Magic🪞 API
 */
defaultTemplates.advanced = {
	name: 'Scripting Example',
	description:
		'Start with some JavaScript and HTML demonstrating how to use the Magic🪞 API',
	onSelection: (tabs: any, setCode: any) => {
		//should do stuff and set up the project
		let result = {
			...defaultTabs,
		};

		result.html.code = `
        <html>
            <head>
                <title>🧙‍♂️.Magic🪞.eth</title>
            </head>
            <body>
                <p id='ens'>NO ENS</p>
                <p id='address'>NO ADDRESS</p>
            </body>
        </html>
    `;

		result.js.code = `
        const {currentEnsAddress, owner } = window.ensContext;
        document.getElementById('ens').innerText = currentEnsAddress;
        document.getElementById('address').innerText = owner;
    `;

		result['.xens'] = {
			...result['.xens'],
			code: JSON.stringify(
				{
					name: 'Magic🪞(XENS)',
					description:
						'A simple example of how to use the Magic🪞 API',
					author: 'Magic Mirror',
					version: '0.0.1',
					direct: false,
				},
				null,
				2
			),
		};

		setCode(result);
	},
};

defaultTemplates.redirect = {
	name: 'Magic🪞.eth Reflection',
	description: 'Set up a 🪞 to redirect to another domain',
	onSelection: (tabs: any, setCode: any) => {
		//should do stuff and set up the project
		let result = {
			...defaultTabs,
		};

		result['.xens'] = {
			...result['.xens'],
			code: JSON.stringify(
				{
					name: 'Magic🪞.eth Reflection',
					description: 'A simple redirect to another website',
					author: 'Magic🪞',
					version: '0.0.1',
					direct: true,
				},
				null,
				2
			),
		};

		result.js.code = `   
      setTimeout(() => {
        window.location.href = 'https://magicmirror.one';
        }, 1000);
    `;

		result.html.code = `
        <html>
            <head>
                <title>Magic🪞.eth Reflecting</title>
            </head>
            <body>
                <p>Reflecting...</p>
            </body>
        </html>
    `;

		setCode(result);
	},
};

defaultTemplates.web3Mirror = {
	name: 'Magic🪞.eth Web2<>ENS Refraction',
	description:
		'Set up a your 🪞 to refract the light of your web2 site into your ENS domain',
	onSelection: (tabs: any, setCode: any) => {
		//should do stuff and set up the project
		let result = {
			...defaultTabs,
		};

		result['.xens'] = {
			...result['.xens'],
			code: JSON.stringify({
				name: 'Magic🪞.eth Refraction',
				description: 'A refraction to a web2 website',
				author: '0x0z.Agency',
				version: '0.0.1',
				direct: true,
			}),
		};

		result.html.code = `
        <html>
            <head>
                <title>Magic🪞.eth</title>
            </head>
            <body>
                <iframe src="https://pod.infinitymint.app" style="width: 100vw; height: 100vh; border: none;" 
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals allow-popups-to-escape-sandbox"
                ></iframe>
            </body>
        </html>
      `;

		setCode(result);
	},
};

defaultTemplates.embeded = {
	name: 'Magic🪞.eth Embedding',
	description: 'Example of how to embed content into Magic🪞.eth',
	onSelection: (tabs: any, setCode: any) => {
		//should do stuff and set up the project
		let result = {
			...defaultTabs,
		};

		result['.xens'] = {
			...result['.xens'],
			code: JSON.stringify({
				name: 'Magic🪞.eth',
				description:
					'An example of how to embed content into Magic🪞.eth',
				version: '0.0.1',
				direct: false,
			}),
		};

		result.html.code = `
        <html>
            <head>
                <title>Magic🪞.eth Embedding</title>
            </head>
            <body>
                <iframe width="560" height="315" src="https://www.youtube.com/embed/z62_AwLC7-g" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
            </body>
        </html>
        `;

		setCode(result);
	},
};

defaultTemplates.music = {
	name: '🎧Club.eth',
	description:
		'Setup a basic music project using your own music. You can choose to use our own theme for the website or work on your own.',
	onSelection: (tabs: any, setCode: any) => {
		//fetch the default music template
		let result = {
			...defaultTabs,
		};

		(async () => {
			let { parsedHTML, script, style } = await fetchContent(
				'audio.html'
			);
			result['.xens'] = {
				...result['.xens'],
				code: JSON.stringify(
					{
						name: 'Magic🪞.eth',
						description:
							'Setup a basic music project using your own music. You can choose to use our own theme for the website or work on your own.',
						version: '0.0.1',
						libs: {
							bootstrap: '4',
						},
						direct: false,
					},
					null,
					2
				),
			};
			result.html.code = parsedHTML;
			result.js.code = script;
			result.css.code = style;
			setCode(result);
		})();
	},
};

defaultTemplates.video = {
	name: 'NewTube.eth',
	description:
		'Setup a basic video project using your own video. You can choose to use our own theme for the website or work on your own.',
	onSelection: (tabs: any, setCode: any) => {
		//fetch the default music template
		let result = {
			...defaultTabs,
		};

		(async () => {
			let { parsedHTML, script, style } = await fetchContent(
				'video.html'
			);
			result['.xens'] = {
				...result['.xens'],
				code: JSON.stringify(
					{
						name: 'Magic🪞.eth',
						description:
							'Setup a basic video project using your own videos. You can choose to use our own theme for the website or work on your own.',
						version: '0.0.1',
						libs: {
							bootstrap: '4',
						},
						direct: false,
					},
					null,
					2
				),
			};
			result.html.code = parsedHTML;
			result.js.code = script;
			result.css.code = style;
			setCode(result);
		})();
	},
};

defaultTemplates.image = {
	name: 'Image',
	description:
		'Setup a basic image project using your own image. You can choose to use our own theme for the website or work on your own.',
	onSelection: (tabs: any, setCode: any) => {
		//fetch the default music template
		let result = {
			...defaultTabs,
		};

		(async () => {
			let { parsedHTML, script, style } = await fetchContent(
				'images.html'
			);
			result['.xens'] = {
				...result['.xens'],
				code: JSON.stringify(
					{
						name: 'Magic🪞.eth',
						description:
							'Setup a basic image project using your own images. You can choose to use our own theme for the website or work on your own.',
						version: '0.0.1',
						libs: {
							bootstrap: '4',
						},
						direct: false,
					},
					null,
					2
				),
			};
			result.html.code = parsedHTML;
			result.js.code = script;
			result.css.code = style;
			setCode(result);
		})();
	},
};

defaultTemplates.links = {
	name: '♾️links.eth',
	description: 'Set up your own free and infinite links page.',
	onSelection: (tabs: any, setCode: any) => {
		//should do stuff and set up the project
		let result = {
			...defaultTabs,
		};

		result['.xens'] = {
			...result['.xens'],
			code: JSON.stringify({
				name: '♾️links.eth',
				description: 'A free and infinite links page',
				author: '0x0z.Agency',
				version: '0.0.1',
				direct: true,
			}),
		};

		result.html.code = `
    
    <!DOCTYPE html>
		<html lang="en">
		<head>
			<title>My InfinityLinks</title>
			
			<!--- THEMES: in settings.json change 'glitch' to 'gallery', 'menu', or any other theme in the layout/themes folder --->
			<link rel="icon" type="image/png" href="https://cdn.glitch.global/20ae658d-f2cd-4f54-8582-809a3659c90d/888081218418130966.gif?v=1680273695023">
			<link rel="icon" type="image/jpg" href="https://cdn.glitch.global/20ae658d-f2cd-4f54-8582-809a3659c90d/Blood_Moon.jpg?v=1680273043224">
			
			<!--   Meta Tags!   -->
			<meta name="description" content={{ settings.metaDescription }}>
		</head>
		<body>
			<main class="bg-[#11111d]">
			<div class="flex flex-col">
				<div class="justify-center items-center flex flex-col gap-8">
				
					<div class="pt-8 text-2xl italic">
						My ♾️Links!
					</div>

					
					<img
					class="rounded-full w-24"
					src="https://www.npmjs.com/npm-avatar/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdmF0YXJVUkwiOiJodHRwczovL3MuZ3JhdmF0YXIuY29tL2F2YXRhci81MTQ3YzVlOTg4MWNhZTJkZmM3YzNlN2E2M2E2ZGM5Zj9zaXplPTQ5NiZkZWZhdWx0PXJldHJvIn0.dRPInXEWrciilXfMeoIIrGCjimEYKtp81jKZQlqb2KY"/>

                    <div class='gap-4 w-full flex flex-col justify-center items-center'>
					<div class="w-3/4 text-center bg-base-300 rounded-md bold border-2 border-slate-600 hover:bg-base-100 transition-colors">

					My First ♾️int
					
					</div>
					<div class="w-3/4 text-center bg-base-300 rounded-md bold border-2 border-slate-600 hover:bg-base-100 transition-colors">

					My Second Infinitymint
					
					</div>
					<div class="w-3/4 text-center bg-base-300 rounded-md bold border-2 border-slate-600 hover:bg-base-100 transition-colors">

					My Twitter
					
					</div>
					</div>
				</div>

			  <footer class="pt-24">
			    Copyright 2023 InfinityMint.
			  </footer>
			
			</main>
		</body>
		</html>
      
    
      `;

		setCode(result);
	},
};

defaultTemplates.blog = {
	name: 'Blog',
	description: 'Set up a blog with your own content.',
	onSelection: (tabs: any, setCode: any) => {
		let result = {
			...defaultTabs,
		};

		result['.xens'] = {
			...result['.xens'],
			code: JSON.stringify({
				name: '♾️links.eth',
				description: 'A free and infinite links page',
				author: '0x0z.Agency',
				version: '0.0.1',
				direct: true,
			}),
		};

		result.html.code = `
	  <!DOCTYPE html>
		<html lang="en">

		<body class="bg-[#11111d]">
			<header class="flex justify-between m-auto px-4">
			<h1 class="text-4xl">My Blog</h1>
			<div class="my-auto gap-4 inline-flex">
			<a href="#">
				About
			</a>
			<a href="#">
				Contact
			</a>
			<a href="#">
				Posts
			</a>
			</div>
			</header>
			<article class="my-12 px-8">
			<section class="flex-col inline-flex gap-8">
				<li class="inline-flex flex-col">
				<div class="inline-flex my-auto">
					<h1 class="text-2xl text-white">
					My first post
					</h1>
					<small class="mt-auto inline-flex px-2">2023-05-05</small>
				</div>
				<p class="my-auto">What I like to write about</p>
				</li>
				<li class="inline-flex flex-col">
				<div class="inline-flex my-auto">
					<h1 class="text-2xl text-white">
					My second post
					</h1>
					<small class="mt-auto inline-flex px-2">2023-05-05</small>
				</div>
				<p class="my-auto">What I like to write about</p>
				</li>
				<li class="inline-flex flex-col">
				<div class="inline-flex my-auto">
					<h1 class="text-2xl text-white">
					My third post
					</h1>
					<small class="mt-auto inline-flex px-2">2023-05-05</small>
				</div>
				<p class="my-auto">What I like to write about</p>
				</li>
				<li class="inline-flex flex-col">
				<div class="inline-flex my-auto">
					<h1 class="text-2xl text-white">
					My fourth post
					</h1>
					<small class="mt-auto inline-flex px-2">2023-05-05</small>
				</div>
				<p class="my-auto">What I like to write about</p>
				</li>
			</section>
			</article>
			<footer class="mt-12 px-4">
			Created by 0x0zAgency
			</footer>
		</body>
		</html>
	  `;
		setCode(result);
	},
};

defaultTemplates.portfolio = {
	name: 'Portfolio',
	description: 'Set up a portfolio with your own content.',
};

export default defaultTemplates;
