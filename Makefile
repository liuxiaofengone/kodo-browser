NAME=kodo-browser

PKGER=node node_modules/electron-packager/cli.js
ZIP=node ../zip.js

i:
	yarn install
test:
	yarn test
dev:
	NODE_ENV=development electron .
run:
	yarn dev
clean:
	rm -rf dist node_modules build releases node/s3store/node_modules

prod:
	yarn prod
watch:
	yarn watch
build:
	yarn build

winarm64: build
	yarn build:winarm64
	yarn pkg:winarm64

all:winarm64
	@echo 'Done'

.PHONY:build i dev run clean prod watch winarm64 all
