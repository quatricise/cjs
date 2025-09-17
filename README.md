# CJS - C-style JavaScript [^1]

JS framework that takes inspiration from the purely procedural style of old C programming and tries to offer simple features which can be modularized at will.
Any custom logic may be injected into this system, styles, transitions, animations, net code, anything can be well integrated since CJS is just functions and objects.

CJS includes a Ticker which may or may not be used to control and sync visual changes such as animations. This way you can treat the program more like a game.

The reason CJS exists is because it is an attempt to patch over the annoyance of having to deal with 3 toy languages stitched together.

CJS is not a builder. It's just front-end code that runs when you open a webpage.

## No dependencies

CJS is only TypeScript code. It has no dependencies whatsoever and it not installed via any package manager. It's just code that you put into your project. 

I am building CJS in TypeScript and use a simple builder called static-kit (https://github.com/vojtaholik/static-kit) that uses Vite.
HOWEVER! this does not mean that CJS will require any of this. It won't - it's TS and you compile it. That's it.

It's early for this project so I do not yet know how this could be distributed, but ideally, to keep things simple - no package managers.

## Error handling

CJS tracks existing markup and styles and tells you when you have made a mistake. The level of strictness is fairly high:
- no element ID duplicates - every markup defined in CJS is tracked via its id, yes, each element requires an ID.
- each style can be locked, during development CJS checks the resulting styles using getComputedStyle() and can throw when the resulting style is not what you expected.
- each style has to target something, otherwise CJS throws. - there is a global flag that disables this if it annoys you

## How it works

Create an HTML file and include a script tag that points to your app - you're done.

## No style polyfills

You have to do this yourself, unfortunately. The reasoning here is that in order to do this properly I would have to begin flirting with Sass or Tailwind and other CSS frameworks and
the integration work would be super annoying. Unless I change my mind, this goes against the philosophy of this project, which is to have a single file and that's it.

That philosophy is based on that of (read: stolen from) Sean Barrett's who created his `nothings` in order to create a general file he can always use in a project without having to worry about whether it works and the file was merely just a bunch of useful stuff that replaces or augments some problems of the C language.

[^1] It's just about the philosophy. Not literally like C.