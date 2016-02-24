# html-banner-tools
A tool to help generate different resolutions of a HTML banner

This is a work in progress - with the eventual goal of turning into an NPM package. So far this has only been tried on a single project, and there are a multitude of TODOs and FIXMEs in the codebase right now. I would not recommend anyone use this project for commercial purposes just yet.

## To do list
* Allow passing of data json file as commandline param [DONE]
* Write up documentation
* Finish logger util
* Output better progress events in commandline
* Make a better way to override html assets - instead of processing whole folder, add each file individually so they can be overriden on a per file basis if certain ad units require different html assets - maybe keep current whole folder method also since its faster and most of the time this is all that is needed.
