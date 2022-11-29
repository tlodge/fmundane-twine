## twinejs

by Chris Klimas, Leon Arnott, Daithi O Crualaoich, Ingrid Cheung, Thomas Michael
Edwards, Micah Fitch, Juhana Leinonen, Michael Savich, and Ross Smith.  Modified by
Tom Lodge for the Experiencing the Future Mundane Project

### INSTALL

Run `npm install` at the top level of the directory to install all goodies.

### BUILDING

Run `npm start` to begin serving a development version of Twine locally. This
server will automatically update with changes you make.

Run `npm run start:electron` to run a development version of the Electron app.
**Running this can damage files in your Twine storied folder. Take a backup copy
of this folder before proceeding.** Most of the app will automatically update as
you work, but if you want the app to read story files initially again, you will
need to restart the process.

Run `npm run start:electron-prod` to run the Electron app locally. Unlike `npm
run start:electron`, this packages the application as closely to final release
as possible. As a result, code will be minified and debugging will be more
difficult.

To create a release, run `npm run build`. Finished files will be found under
`dist/`. In order to build Windows apps on OS X or Linux, you will need to have
[Wine](https://www.winehq.org/) and [makensis](http://nsis.sourceforge.net/)
installed. A file named `2.json` is created under `dist/` which contains
information relevant to the autoupdater process, and is currently posted to
https://twinery.org/latestversion/2.json.

To run the app in an Electron context, run `npm run electron`. `npm run
electron-dev` is a bit faster as it skips minification.

`npm test` will test the source code respectively.

`npm run clean` will delete existing files in `electron-build/` and `dist/`.

### Future Mundane Modifications to core twine

* src/components/rules 

the files that deal with the rule creation interface

* src/components/onstart 

the files that deal with the onstart creation interface

* src/util/caravan 

the code that translated between twine and the format required by the future mundane state machine

* src/routes/story-list/toolbar/story/export-stories-button 

the code for the ui that handles exporting to the caravan

* src/routes/story-list/toolbar/story/story-actions

downloads and attempts to export to caravan: 
            
```await request.post('/author/save').set('Content-Type', 'application/json').send({name,layer:_stories});```

* NB - not using choosetype anymore as this is selected in the rules interface 

## Building for static twine site (i.e. on github pages)

Run the following:

```
npm run build:web
```

This will build minimised files in dist and copy them to the ../twineweb directory.  The twineweb directory is the dirstibution of a static twine web site that can be hosted on, for example github pages.  To push to github pages:

```
cd ../twineweb
git add .
git commit -m 'my commit message'
git push
```
