// Import react and prop-types
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Renders HTML from a code object, each key in the code object is the language, so css, js, html, etc. Stylesheets refer to
 * @param code
 * @param stylesheets
 * @param meta
 * @param scripts
 * @param ensContext
 * @returns
 */
export const renderHTML = (
	code: any = {},
	stylesheets: any = [],
	meta: any = [],
	scripts: any = [],
	ensContext
) => {
	let safeCSS = code.css || '';
	// Remove html tags from savejs code
	safeCSS = safeCSS.replace(/<[^>]*>?/gm, '');

	const head = `
      <head>
        <!--Reflected by Magic🪞.eth Site Builder by 0x0z.xyz | The Magic of Web3-->
        ${stylesheets.map((sheet) => {
			return `<link href="${sheet}" rel="stylesheet" type="text/css" />`;
		})}
        ${meta.map((meta) => {
			return `<${meta.tag} ${meta.properties || ''}>${meta.children}</${
				meta.tag
			}>`;
		})}
        <script>
          window.ensContext = ${JSON.stringify(ensContext)};
        </script>
        <style>
          ::-webkit-scrollbar{
            direction: rtl; 
            overflow: auto; 
            width: 12px;
            padding: 6px;
          } 

          /* Track */
          ::-webkit-scrollbar-track {
            direction: rtl; 
            background: #f1f1f1; 
          }

          /* Handle */
          ::-webkit-scrollbar-thumb {
            direction: rtl; 
            background: #888; 
          }

          /* Handle on hover */
          ::-webkit-scrollbar-thumb:hover {
            direction: rtl; 
            background: #555; 
          }

          html, body {
            margin: 0;
            padding: 0;
          }
        </style>
        <style>
          ${safeCSS}
        </style>
        ${scripts.map((script) => {
			return `<script src="${script}"></script>`;
		})}
      </head>
  `;

	let safeJS = code.js || '';
	// Remove script tags from savejs code
	safeJS = safeJS.replace(/<\//g, '');

	return `
    <html>
      ${head}
      <body>
        <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); max-width: 600px; min-height: 400px; display: none; z-index: 50;" id="box">  
          <div style="border-radius: 15px; background-color: white;">
            <div style="background-color: #1a202c; border-radius: 15px 15px 0 0;">   
              <div style="padding: 1rem;">
                <div style="color: white; font-size: 1.5rem;">
                  <div style="font-weight: bold;">You have tried to navigate away...</div>
                </div>
              </div>
            </div>
            <div style="padding: 1rem;">
              <div style="font-size: 1.25rem;">
                <div style="font-weight: bold; color: black;">Are you sure you would like to goto <u><span id="location"></span></u>?
                </div>
                <div style="display: flex; flex-direction: row; justify-content: center; margin-top: 1rem;">
                  <button class="btn btn-primary" style="margin-right: 1rem;" onClick='window.location.href = document.getElementById("location").innerHTML'>Yes</button>
                  <button class="btn btn-error" style="margin-left: 1rem;" onClick='document.getElementById("box").style.display = "none"'>No</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </body>
      <script>
        window.ensContext = ${JSON.stringify(ensContext)};
        (() => {
          document.body.innerHTML = document.body.innerHTML + \`${
				code.html || ''
			}\`;
          //remove all href tags from all links in the body
          let _links = document.getElementsByTagName("a");
          for (var i = 0; i < _links.length; i++) {
            _links[i].onclick = (e) => {
              e.preventDefault();

              if (e.target?.getAttribute("href")[0] === "#")
                return;

              //show box
              let _box = document.getElementById("box");
              _box.style.display = "block";
              //set location
              let _location = document.getElementById("location");
              _location.innerHTML = e.target.getAttribute("href");
            }
          }
        })();
      </script>
      <script>
        ${safeJS}
      </script>
    </html>`;
};

// Create a react component that takes html code as a string and renders it
function HTMLRenderer({
	style,
	code = {} as any,
	implicit,
	ensContext = {},
	stylesheets = [],
	scripts = [],
	meta = [],
}: {
	style?: any;
	code?: any;
	implicit?: any;
	ensContext?: any;
	stylesheets?: string[];
	scripts?: string[];
	meta?: any;
}) {
	let html: string;

	if (!implicit)
		html = renderHTML(code, stylesheets, meta, scripts, ensContext);

	if (implicit)
		implicit = `
      <script>
        window.ensContext = ${JSON.stringify(ensContext)};
      </script>
      ${implicit}
      `;

	return (
		<iframe
			style={style}
			srcDoc={implicit || html || 'No Content'}
			seamless
			title="preview"
			sandbox="allow-scripts allow-same-origin allow-forms"
			className="w-full h-full block border-l-1 border-black overflow-y-scroll overflow-x-scroll"
		></iframe>
	);
}

HTMLRenderer.propTypes = {
	style: PropTypes.object,
	implicit: PropTypes.string,
	code: PropTypes.any,
};

export default HTMLRenderer;
