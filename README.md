# CJS - C-style JavaScript

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
- each style has to target something, otherwise CJS throws.

## How it works

Modules:
@todo