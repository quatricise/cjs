/** Query the document to get a single element matching the query (standard querySelector) */
function $h(query: string): HTMLElement {
  const element = document.querySelector(query);
  if (!element || element instanceof HTMLElement === false) {
    throw new Error("$h: No HTMLElement found by query: " + query);
	}
  return element as HTMLElement;
}

/** Query the document to get a single element matching the query (similar to querySelectorAll, but returns an array, instead of Nodelist) */
function $ha(query: string, errors: boolean = true): HTMLElement[] {
  const elements = Array.from(document.querySelectorAll(query));

  if (!elements || elements.length === 0) {
    if (errors) {
      console.error("$ha: Error", elements)
      throw new Error("$ha: No HTMLElements found by query: ${query}. \n Maybe you wanted to look for MathMLElement or SVGElement? If so, use $m/$ma or $s/$sa functions instead.");
    } 
    else {
      return [];
    }
  }
    
  if(elements.every((e) => e instanceof HTMLElement) === false) {
    if(errors) {
      console.error("$ha: Error", elements)
      throw new Error("$ha: Not every element found is an HTMLElement.")
    } 
    else {
      return []
    }
  }
  return elements;
}

/** Query the document to get a single element matching the query (standard querySelector) */
function $s(query: string): SVGElement {
  const element = document.querySelector(query)
  if(!element || element instanceof SVGElement === false) throw new Error("No SVGElement found by query: " + query)
  return element as SVGElement
}

/** Query the document to get a single element matching the query (standard querySelector) */
function $m(query: string): MathMLElement {
  const element = document.querySelector(query)
  if(!element || element instanceof MathMLElement === false) throw new Error("No MathMLElement found by query: " + query)
  return element as MathMLElement
}

/** Note: for performance, this does not guard against min being larger than max, but don't be an idiot and make sure your inputs are correct */
function clamp(value: number, min: number, max: number) {
  return Math.max(Math.min(value, max), min)
}

function sum(...values: number[]): number {
  let accumulator = 0;
  values.forEach(v => accumulator += v)
  return accumulator
}

function assert(predicate: boolean, errorMsg: string) {
  if(!predicate) throw new Error(errorMsg)
}

function entries<T>(obj: Partial<T>): [keyof T, T[keyof T] | undefined][] {
  return Object.entries(obj) as [keyof T, T[keyof T] | undefined][]
}

function camelToDashed(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

interface Vector2 {
  x: number,
  y: number
}

let timeLast = 0
let timeDelta = 0

const CJS_State = {
  elements: new Map()     as Map<string, HTMLElement>,
  layers: []              as string[],
  animationsActive: []    as CJS_Animation[],
  animationsInactive: []  as CJS_Animation[],
}


/* TYPES */
// Capture,       // reacts to scroll and uses the scroll hooks
// EventDriven,   // reacts to events, event-driven
// Sequence,      // sequence of various keyframes

interface CJS_Animation {
  type:         "Capture" | "EventDriven" | "Sequence",
  elementId:    string,
  duration:     number,
  currentTime:  number,
  easing:       Function,
  keyframes:    CJS_AnimationKeyframe[],
}

interface CJS_AnimationKeyframe {
  style: CJS_Style,
}

/** @todo this should be something akin to an API so that users can explicitly redefine what is allowed if they truly dislike the restrictions placed here */
type CJS_Style = Omit<Partial<CSSStyleDeclaration>, "margin" | "padding" | "border" | "transition" | "animation" >;

/**
 * Creates an HTMLElement.
 * 
 * Data: a = attributes, c = classnames, d = dataset, s = style, h = innerHTML.
 * 
 * **Notes:**
 * 
 * `data.h: innerHTML`: the unified way to handle element contents. Please do not use innerText. It is not advisable to add innerHTML in most circumstances, but it's okay for including a paragraph full of <br>'s and special characters and style tags such as <i> or <b>.
 */
function CJS_H(id: string, tagname: string, data: {c?: [string, string][], a?: [string, string][], d?: [string, string][], s?: CJS_Style, h?: string}): HTMLElement {
  assert(CJS_State.elements.has(id) === false, `Element id '${id}' already exists. Choose a unique identifier for this <${tagname}> element.`)
  assert(tagname !== "", "Cannot use empty string for tagname.")

  const element = document.createElement(tagname)

  element.id = id

  data.a?.forEach(pair => element.setAttribute(pair[0], pair[1]))
  data.d?.forEach(pair => element.dataset[pair[0]] = pair[1])
  data.c?.forEach(pair => element.classList.add(pair[0], pair[1]))
  
  if(data.s) {
    for(const key in data.s) {
      element.style[key] = data.s[key] as string
    }
  }

  element.innerHTML = data.h ?? element.innerHTML

  CJS_State.elements.set(id, element)

  return element
}

function CJS_Id(elementId: string): HTMLElement {
  const element = CJS_State.elements.get(elementId)
  assert(element instanceof HTMLElement, `No element found by ID '${elementId}'.`)
  return element as HTMLElement
}

function CJS_Append(parentId: string, children: HTMLElement[]) {
  assert(children.every(c => c.isConnected === false), `Some of the children are part of the DOM. This function does not allow replacing child positions; if you want that, call CJS_Reappend.`)

  const parent = CJS_Id(parentId)
  parent.append(...children)
}

function CJS_Reappend(newParent: HTMLElement, children: HTMLElement[]) {
  newParent.append(...children)
}

function CJS_Animate(animation: CJS_Animation) {
  CJS_State.animationsActive.push(animation)
}



















function CJS_Animate_Transition(animationIn: CJS_Animation, animationOut: CJS_Animation) {
  const element =   CJS_Id(animationIn.elementId)

  //trigger the first anim
  element.onmouseenter = () => {
    const anim = animationIn
    CJS_State.animationsActive.push(anim)
    CJS_State.animationsInactive = CJS_State.animationsInactive.filter(a => a !== anim)
  }
  //trigger the second anim
  element.onmouseleave = () => {
    const anim = animationOut
    CJS_State.animationsActive.push(anim)
    CJS_State.animationsInactive = CJS_State.animationsInactive.filter(a => a !== anim)
  }

  CJS_State.animationsInactive.push(animationIn)
}


// mockup of a updater function for an animation
function updateAnimationObjectOrSomething() {
  // this sucks but lets just use the first keyframe lol
  const styleNew = animationIn.keyframes[0].style
  const styleOld =  {...element.style}

  for(const key in styleNew) {
    element.style[key] = String(styleNew[key])
  }
  for(const key in styleNew) {
    element.style[key] = old[key]
  }
}



















function CJS_Tick(timeCurrent: number) {
  timeCurrent *= 0.001;
  timeDelta = timeCurrent - timeLast;
  timeLast = timeCurrent;

  /* Update all animations here */
  CJS_State.animationsActive.forEach(anim => {
    
  })

  window.requestAnimationFrame(CJS_Tick)
}

window.addEventListener("load", () => {
  CJS_Tick(0)
})


function Component_Calculator() {
  const gap = "6px"
  const borderRadius = "8px"
  const fontFamilyDefault = "monospace"
  const colors = {
    bg0: "#f3edeaff",
    bg1: "#cec7c4ff",
    text: "#242424ff",
    accent: "#fe8020",
  }

  CJS_H("calculator-frame", "div", {s: {
    display:              "grid", 
    gridTemplateColumns:  "repeat(4, 1fr)",
    gridAutoRows:         "60px",
    gridAutoFlow:         "row",
    gap:                  gap,
    width:                "320px",
    paddingTop:           "24px",
    paddingRight:         "24px",
    paddingBottom:        "24px",
    paddingLeft:          "24px",
    borderRadius:         borderRadius,
    backgroundColor:      colors.bg0,
    color:                colors.text,
    font:                 fontFamilyDefault,
    
  }})

  CJS_H("calculator-screen", "div", {s: {
    display:          "flex",
    gridColumn:       "span 4",
    gridRow:          "span 2",
    paddingTop:       "12px",
    paddingRight:     "12px",
    paddingBottom:    "12px",
    paddingLeft:      "12px",
    borderRadius:     borderRadius,
    backgroundColor: "#32363bff",
  }})

  CJS_Append("calculator-frame", [
    CJS_Id("calculator-screen"),
  ])

  const texts: string[] = [
    "%",
    "CE",
    "C",
    "Del",

    `1/x`,

    `<math xmlns="http://www.w3.org/1998/Math/MathML">
      <msup>
        <mi>x</mi>
        <mn>2</mn>
      </msup>
    </math>`,

    `<math xmlns="http://www.w3.org/1998/Math/MathML">
      <mroot>
        <mi>x</mi>
        <mn>2</mn>
      </mroot>
    </math>`,

    `÷`,
    `7`,
    `8`,
    `9`,
    `×`,
    `4`,
    `5`,
    `6`,
    `-`,
    `1`,
    `2`,
    `3`,
    `+`,
    `+/-`,
    `0`,
    `.`,
  ]
  
  const buttonStyleBase: CJS_Style = {
      display:        "flex",
      alignItems:     "center",
      justifyContent: "center",
      gridColumn:     "span 1",
      borderRadius:   borderRadius,
      fontFamily:     fontFamilyDefault,
      borderStyle:    "none",
      fontWeight:     "700",
      fontSize:       "1rem",
      cursor:         "pointer",
      userSelect:     "none",
    }

  for(let i = 0; i < texts.length; ++i) {
    const button = CJS_H(`calculator-button-generic-${i}`, "button", {h: texts[i], s: {
      ...buttonStyleBase,
      backgroundColor: colors.bg1,
    }})

    CJS_Append("calculator-frame", [button])
  }

  const equalsButton = CJS_H(`calculator-button-equals`, "button", {h: "=", s: {
    ...buttonStyleBase,
    backgroundColor: colors.accent,
  }})
  CJS_Append("calculator-frame", [equalsButton])

  CJS_Animate_Transition({type: "EventDriven", elementId: "calculator-button-equals", duration: 500, currentTime: 0, easing: lerp, keyframes: [
    {style: {
      
    }}
  ]})

  return CJS_Id("calculator-frame")
}



(function App() {
  const calculator = Component_Calculator()
  const main = CJS_H("main", "main", {s: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }})

  // non-CJS code here for now, a bit of a mess
  document.body.style.margin = "0"
  document.body.style.width = "100%"
  CJS_Append("main", [calculator])

  document.body.append(main)
})();