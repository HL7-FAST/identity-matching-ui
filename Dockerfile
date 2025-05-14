FROM node:22-slim AS build

RUN mkdir /project
WORKDIR /project

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build --verbose

FROM build AS install
COPY --from=build /project/package.json /app/package.json
COPY --from=build /project/package-lock.json /app/package-lock.json
RUN npm ci --omit=dev


FROM node:22-slim
RUN mkdir /app
WORKDIR /app
COPY --from=build /project/dist /app/dist
COPY --from=build /project/config /app/config
COPY --from=build /project/drizzle /app/drizzle
COPY --from=install /project/node_modules /app/node_modules
ENV PORT=80
EXPOSE 80
CMD ["node", "/app/dist/fhir-client/server/server.mjs"]




# FROM oven/bun:1.2-slim AS build

# RUN mkdir /project
# WORKDIR /project

# COPY package.json ./
# RUN bun install

# COPY . .
# ENV NODE_OPTIONS="--max-old-space-size=4096"
# RUN bun run build --verbose

# FROM build AS install
# COPY --from=build /project/package.json /app/package.json
# COPY --from=build /project/bun.lock /app/bun.lock
# RUN bun install --frozen-lockfile --omit=dev --omit=peer --omit=optional


# FROM oven/bun:1.2-slim
# RUN mkdir /app
# WORKDIR /app
# COPY --from=build /project/dist /app/dist
# COPY --from=build /project/config /app/config
# COPY --from=build /project/drizzle /app/drizzle
# COPY --from=install /project/node_modules /app/node_modules
# ENV PORT=80
# EXPOSE 80
# CMD ["bun", "/app/dist/fhir-client/server/server.mjs"]

