## Future Mundane Twinejs

Original Twine code by Chris Klimas, Leon Arnott, Daithi O Crualaoich, Ingrid Cheung, Thomas Michael
Edwards, Micah Fitch, Juhana Leinonen, Michael Savich, and Ross Smith.  Modified by
Tom Lodge for the Experiencing the Future Mundane Project

### Getting started

Run `npm install` at the top level of the directory to install all goodies.

### Building

Run `npm start` to begin serving a development version of Twine locally. This
server will automatically update with changes you make.

To create a release, run `npm run build:web`. Finished files will be found under
`dist/`. 

When you push your changes, there is a `.github/workflow/deploy.yml` file that creates a gh-pages branch from the `dist/web` directory. 
If you go to `https://[githubusername].github.io/fmundane-twine` you should see the caravan authroing environment up and running.

### Future Mundane Modifications to core twine

The following is a brief summary of the files that were added to vanilla twine to support the caravan authroing extensions:

* src/components/rules 

the files that deal with the rule creation interface

* src/components/onstart 

the files that deal with the onstart creation interface

* src/util/caravan 

the code that translated between twine and the format required by the future mundane state machine

* src/routes/story-list/toolbar/story/export-stories-button 

the code for the ui that handles exporting to the caravan

* src/routes/story-list/toolbar/story/story-actions

For more info on using the authoring interface view the main Future Mundane project docs at:

http://tlodge.github.io/fmundane-engine


