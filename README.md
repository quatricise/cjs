# CJS - C-style JavaScript

JS framework that takes inspiration from the purely procedural style of old C programming and tries to offer simple features which can be modularized at will.
Any custom logic may be injected into this system, styles, transitions, animations, net code, anything can be well integrated since CJS is just functions and structs (objects).

CJS includes a Ticker which may or may not be used to control and sync visual changes such as animations. It outputs HTML CSS and JS.

CJS is not a builder. It's just front-end code that runs when you open a webpage.

## No dependencies

CJS is only TypeScript code. It has no dependencies whatsoever and it not installed via any package manager. It's just code that you put into your project. I am building CJS in TypeScript and build it using a simple builder that uses Vite and static-kit (https://github.com/vojtaholik/static-kit), this does not mean that CJS will require any of this.

It's early for this project so I do not yet know how this could be distributed, but ideally, to keep to the spirit of C - no package managers.