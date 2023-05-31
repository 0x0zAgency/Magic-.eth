# Magic🪞

[**Magic🪞**](https://magicmirror.one) is a self-contained Web3 browser that can be instantiated inside of any typical browser or application browser view, making it an incredibly versatile tool.

Think of this as the Google moment of Web3. The interface is incredibly intuitive, much like the search/address bar of Google. By simply inputting an ETH domain such as 0x0z.eth, or Vitalik.eth, users can easily access the active content for that ENS domain. But that’s not all, with Magic🪞, users can even skip the .eth and directly jump into marketplaces like ens.vision by typing 0x0z.vision. And this is just the beginning.

Magic🪞 means to normalize consent based browsing for a reconnecting world and reset the foundation of the internet.

But what truly sets Magic🪞 apart is its dream🎨.eth dWeb Studio, the most magical way to create your own decentralized websites and add more power to your Web3 domains. It's a powerful tool that makes digital content creation incredibly easy and seamless. With the 🤖Army.eth building along side you, Websites, Landing Pages, Marketplaces via [♾Mint.eth](https://www.magicmirror.one/infinitymint.eth) Integration, and vast monetization methods enabled by our Ethereum Ads Service ([EADS.eth](https://magicmirror.one/eads.eth)), a new Web is at our fingertips!

Futhermore, Magic🪞 is home to the ⭐️atlas.eth Virtual Registry that unifies all name service domains into one portable and localized service. This allows builders to create and modify any Web3 name service metadata so it can be previewed in Magic🪞 by all of the users before committing the fix to the blockchain. This should help save gas and create a trusted live environment for the development of Web3.

# Features / Tools:

:gear:settings.eth - Manage your Magic:mirror: experience and settings such as your decentralized storage options such as IPFS, Web3.Storage, NFT.Storage, your mirror’s theme or Frame, authorized wallets and many more.

Dream🎨.eth Studio - The most magical way to create your own decentralized websites and add more power to your Web3 domains. It’s a powerful tool that makes digital content creation incredibly easy and seamless by simply selecting what template you want to execute and fill in the blanks!

:robot:Army.eth - Magic:mirror: integrates the power of AI building along side you, Websites, Landing Pages, Marketplaces via :infinity:Mint.eth 1 Integration, and vast monetization methods enabled by our Ethereum Ads Service (:placard:EADS.eth), a new Web is at our fingertips!

:candy:Land.eth - Web3 Landscaping and Property Management Services! Manage all of the builds, on all of your properties, all in one place.

:toolbox:time.eth - An evolving set of powertools for your Web3 browsing and ENS MGMT experience.

:fire::one::zero::zero:.eth - The fairest domains of them all. See whos rising above the stars with our ENS Leaderboards!

:round_pushpin:egps.eth - In Web3 :vulcan_salute: marks the spot. Keep track of your journey, your assets and your favorite things both IRL and URL. (History)

## 🗿 Requirements

-   MacOSX, Windows (XP, Vista, 7, 8, 10, 11), Debian 10, Ubuntu 20.04
-   Node **18.12.1** ~~or higher~~
-   Bash / ZSH. Either & any will do (as long as it's a POSIX-compliant shell.)
-   Redis
-   Any database of your choice (compatible with Prisma ORM)

> It is **imperative** for your sanity you follow these requirements to the letter!!!
> Web3 development is in development.

## 🗿 Setup

The project requires [Redis](https://redis.io) as a dependency to be installed for caching.

> **NOTE:** If `npx infinitymint` returns an error, put this in an index.ts in the root of your repository:

```js
import { load } from 'infinitymint';
load();
```

### MACOS 🍎

`brew install redis-cli`

### LINUX (Ubuntu / Debian) 🐧

This can (and should be in most circumstances) obtained from your package manager.
In the case of apt - based distros,

`sudo apt install -y redis`

### WINDOWS 🪟

You'll have to use docker. See the [setup instructions on the Redis website](https://redis.io/download/#redis-downloads)

### SETUP

Your `.env` will require a few extra keys for the Web2 endpoints.
These include:

-   OPENAI_KEY
-   JWT_KEY
-   SIWE_SECRET
-   DATABASE_URL

Your OpenAI key is your API token retrieved from [your dashboard on OpenAI's platform](https://platform.openai.com).

The JWT key is any string, or a valid SHA512 key that is used to sign your JWT tokens. Make sure this is an **extremely** strong phrase!

The `SIWE_SECRET` is used for generating your Sign in with Ethereum sessions. This should also be a secure key!

Finally, the database URL should be a Prisma valid string used for connecting to your database layer. This is determined by you.

In summary, the bottom of your end should resemble something like this:

```dotenv
OPENAI_KEY="MYVERYSECRETSECUREKEYHERE"
JWT_KEY="80HSODJKFLH340OHJKLDSFIHUKJLKHDKLH)£U$)£($)HR£HKJDKSJHLK"
SIWE_SECRET="*KJSDFKALH34908OIHUJK0*(&^&%${ERFTGSHDKAIUHF)"
DATABASE_URL="postgresql://user:user@localhost:5432/mydb?schema=public"
```

## 🗿 Installation

Follow the setup instructions for your chosen database of choice.

It's also recommended you follow the instructions in the [Redis documentation](https://redis.io/docs/management/config/) to allow Redis to act as an [LRU] cache.

## Server instructions

To set up server-side, follow the following instructions **to the letter**. They are written in blood, sweat and tears.

-   Install a fresh copy of **Ubuntu 20.04**. No other version has been successfully tested.
-   Run the following commands:

```bash
# Update and upgrade your system.
apt update && apt upgrade -y --no-recommends
# Install Redis for the cache, Nginx to host your frontend (unless you're hosting it in another manner.)
# You should also install a database of your choice, this is used for SIWE authentication sessions for the *FakeRegistry* contracts feature.
apt install -y redis nginx ufw <your_db_of_choice>
# Install specifically NodeJS 18.12.1. Nothing else works. Do this in any manner you please.
sudo add-apt-repository -y -r ppa:chris-lea/node.js
sudo apt install curl
KEYRING=/usr/share/keyrings/nodesource.gpg
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource.gpg.key | gpg --dearmor | sudo tee "$KEYRING" >/dev/null

# if using wget
sudo apt install wget
wget --quiet -O - https://deb.nodesource.com/gpgkey/nodesource.gpg.key | gpg --dearmor | sudo tee "$KEYRING" >/dev/null

VERSION=node_18.x
KEYRING=/usr/share/keyrings/nodesource.gpg
DISTRO="$(lsb_release -s -c)"
echo "deb [signed-by=$KEYRING] https://deb.nodesource.com/$VERSION $DISTRO main" | tee /etc/apt/sources.list.d/nodesource.list
echo "deb-src [signed-by=$KEYRING] https://deb.nodesource.com/$VERSION $DISTRO main" | tee -a /etc/apt/sources.list.d/nodesource.list

# Update your system package list again.
apt update

# Finally, install NodeJS.
apt install -y --no-recommends nodejs

```

> **WARNING!!** If you're trying to build your project and are stuck at downloading the `solc` compiler during an npm install, check your node version!! It **must** be on 18.12.1.
> Check this with: `node -v`.

Within your repository, ensure you have your `.env` variables set and run `npm run server`.
This should start your API server with `pm2`.

Your Nginx config should look something like this:

```nginx
server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
        proxy_pass http://127.0.0.1:9090;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

You'll want to secure this with HTTPS. To do so, you'll need Certbot.
Do this through Snap.

`snap install certbot --classic`

Finally, once you confirmed your API server is running, your DNS for your domain name is pointing to your server and you see a "Cannot GET" page when you enter your API server IP in your browser, run:

`certbot --nginx -d api.example.com`

Congratulations! You've set up your API server with InfinityMint.

## Using this template

For developer convenience, [TailwindCSS](https://tailwindcss.com) is already plugged in with PostCSS.
If you do not wish to use PostCSS, simply uninstall & remove the following lines within your `webpack.config.js`

```js
// Starts at line 119
loader: require.resolve('postcss-loader'),
    options: {
     postcssOptions: {
      // Necessary for external CSS imports to work
      // https://github.com/facebook/create-react-app/issues/2677
      ident: 'postcss',
      config: true,
			// And so on..
```

## 🗿 Documentation

[Official Documentation](https://docs.infinitymint.app)

[TypeDoc Documentation](https://typedoc.org/)
