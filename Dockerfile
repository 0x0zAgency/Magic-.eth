# To copy & run our main React build-
FROM node:18-alpine AS base
WORKDIR /

COPY . .

RUN npm i -g pnpm


FROM base AS deps
WORKDIR /

COPY package.json pnpm-lock.yaml ./

RUN pnpm install


FROM base AS build

COPY . .
COPY --from=deps /node_modules ./node_modules

RUN pnpm build
RUN pnpm prune --prod


FROM base as deploy

WORKDIR /

COPY --from=build . .

CMD ["npm", "run", "start"]
