# Build the static bundle, then serve it from nginx. Two stages so the runtime
# image carries neither node_modules nor the toolchain.

# ---- build ----------------------------------------------------------------
FROM node:20-alpine AS build

WORKDIR /app

# The repo's lockfile is yarn's, so install with yarn and let --frozen-lockfile
# fail the build if package.json and yarn.lock have drifted apart.
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .

# Vite bakes VITE_* in at build time, so the API host has to be known here
# rather than at container start.
ARG VITE_API_BASE_URL=http://localhost:9091
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN yarn build

# ---- runtime --------------------------------------------------------------
FROM nginx:1.27-alpine AS runtime

# try_files sends unknown paths to index.html, without which a reload on a
# client-side route (/login/google/callback, /userdashboard) would 404.
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -qO- http://localhost/ >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
