# Important note
Please do not try to use this, this is experimental package and I will probably rewrite it many times.

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

You have to do this yourself, unfortunately. But it's only something you have to do for the cases where it matters - if you need not support old browsers, which most people don't. Just don't give a shit. 

The reasoning here is that in order to do this properly I would have to either:
- A: do this myself and maintain that capability so that other people can rely on it
- B: begin flirting with Sass or Tailwind and other CSS frameworks and the integration work to get them working with my system goes against the philosophy of this project, which is to have a single file.

That philosophy is based on that of (read: stolen from) Sean Barrett's who created his `nothings` in order to have general functionality he can always use and rely on in a project without having to worry about whether it works. His files are simple utilities, merely just a bunch of useful stuff that replaces or augments some features of the C language and the std library. CJS aims to be a simple utitility
allowing you to create any kind of website. You can totally just put custom markup into your pages and create whatever frankensteinian thing you want, I will just put my hands away and say "I don't like this.".

## Benefits and downsides of code over markup

People often talk about simplicity in programming, especially in the web. I am all for simplicity but only a specific kind. One that always allows a project to grow out of its initial state into something bigger, and I think any project should be allowed that from the start. HTML was not designed for the complex websites that we have today. Reading HTML is fun and easy if you have up to a few levels of nesting and there isn't much complicated logic driving the website. It is not fun and intuitive to read once you are 15-30 levels deep and any small change may break your program, while HTML remains permissive and won't error, leading to the much unnecessary hunt for the misplaced paragraph, closing tag or missing className.

Making changes to markup is deeply frustrating, leading often to a kind of hybrid approach where some markup is done as HTML, but some more complex things are defined procedurally. Why not just go full procedural then? Proper code can be very minimal and still allow you simple markup, while keeping all your definitions at the same place and allowing for error checking.

## Footnotes
[^1]: It's just about the philosophy. Not literally like C.