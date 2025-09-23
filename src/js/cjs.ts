/** Query the document to get a single element matching the query (standard querySelector) */
function $h(query: string): HTMLElement {
  const element = document.querySelector(query);
  if (!element || element instanceof HTMLElement === false) {
    throw new Error("$h: No HTMLElement found by query: " + query);
	}
  return element as HTMLElement;
}

/** Query the document to get a single element matching the query (similar to querySelectorAll, but returns an array, instead of Nodelist) */
function $ha(query: string, throwError: boolean = true): HTMLElement[] {
  const elements = Array.from(document.querySelectorAll(query));

  if (!elements || elements.length === 0) {
    if (throwError) {
      console.error("$ha: Error", elements)
      throw new Error("$ha: No HTMLElements found by query: ${query}. \n Maybe you wanted to look for MathMLElement or SVGElement? If so, use $m/$ma or $s/$sa functions instead.");
    } 
    else {
      return [];
    }
  }
    
  if(elements.every((e) => e instanceof HTMLElement) === false) {
    if(throwError) {
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

/**
 * Bounce easing function.
 * @param t Normalized time (0 to 1)
 * @returns Eased value (0 to 1)
*/
function ease_OutBounce(t: number): number {
    const n1 = 7.5625;
    const d1 = 2.75;

    if (t < 1 / d1) {
        return n1 * t * t;
    } else if (t < 2 / d1) {
        t -= 1.5 / d1;
        return n1 * t * t + 0.75;
    } else if (t < 2.5 / d1) {
        t -= 2.25 / d1;
        return n1 * t * t + 0.9375;
    } else {
        t -= 2.625 / d1;
        return n1 * t * t + 0.984375;
    }
}

function ease_Lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function ease_Hold(a: number, b: number, t: number): number {
  return a
}

type PartialExcept <T, K extends keyof T> = Partial<T> & Pick<T, K>;

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
  flags: {
    debugStyles: false,
  }
}

type CJS_Flags = typeof CJS_State.flags



/* TYPES */
// Capture,       // reacts to scroll and uses the scroll hooks
// EventDriven,   // reacts to events, event-driven
// Sequence,      // sequence of various keyframes
interface CJS_Animation {
  type:             "Capture" | "EventDriven" | "Sequence",
  elementId:        string
  timeTotal:        number

  /** This number is calculated linearly.  */
  timeCurrent:      number

  /** Eased time Current, used to actually calculate values for the styles. */
  timeCurrentEased: number

  /** Changes how fast it goes. Can be used to smoothly slow down or speed up or to do a tape-stop effect instead of dead-reversing it when you want it to go backwards, for instance. */
  timeRemap:        number

  easeFn:           Function

  // for EventDriven
  triggerEvent:    keyof GlobalEventHandlersEventMap
  triggerEventOut: keyof GlobalEventHandlersEventMap //for transitions this is just the event that causes the animation to run backwards

  //for Capture only
  scrollHeight:     number
  scrollCurrent:    number

  keyframes:        CJS_AnimationKeyframe[]
  keyframeIndex:    number

  ended:      boolean
  running:    boolean
  paused:     boolean
  reversed:   boolean
}

type CJS_Animation_InitialData = PartialExcept<CJS_Animation, "type" | "elementId" | "timeTotal" | "keyframes">

// I fucking hate this but interfaces suck so much
function CJS_Create_Animation(initial: CJS_Animation_InitialData): CJS_Animation {
  return {
    type:             initial.type,
    elementId:        initial.elementId,
    timeTotal:        initial.timeTotal,
    timeCurrent:      initial.timeCurrent ?? 0,
    timeCurrentEased: 0,
    timeRemap:        1,
    easeFn:           initial.easeFn ?? ease_Lerp,
    triggerEvent:     initial.triggerEvent ?? "mouseenter",
    triggerEventOut:  initial.triggerEventOut ?? "mouseleave",
    scrollHeight:     initial.scrollHeight ?? 0,
    scrollCurrent:    initial.scrollCurrent ?? 0,
    keyframes:        initial.keyframes ?? 0,
    keyframeIndex:    0,
    ended:            false,
    running:          false,
    paused:           false,
    reversed:         false,
  }
}

interface CJS_AnimationTimeline {
  keyframes: CJS_AnimationKeyframe[]
  duration: number
}

interface CJS_AnimationKeyframe {
  style: CJS_StyleAnimated,

  /** This is a fraction, so if your timeline has [1, 1, 2], these total to 4 and will stretch across the `duration` of the AnimationTimeline */
  duration: number,
}

interface CJS_AnimationValue {
  type: "%" | "vw" | "vh" | "px" | "vmin" | "vmax"
  value: number
}

/** @todo this should be something akin to an API so that users can explicitly redefine what is allowed if they truly dislike the restrictions placed here */
type CJS_Style = Omit<Partial<CSSStyleDeclaration>, "margin" | "padding" | "border" | "transition" | "animation" >;

// this shit might be necessary. I simply have to define my own style for animating and use that instead of the general style, 
// cos I need the number math available at all places without removing "px" | "vw" etc. from a string each fucking time I wanna blend numbers.
type CJS_StyleAnimated = {

  // these all compile down to a singular transform: this would be in the final blending phase of all animation changes. That is done in the update loop.
  // they go in this order, as it felt sensible to me
  scaleX?: number
  scaleY?: number
  scaleZ?: number
  rotateX?: number
  rotateY?: number
  rotateZ?: number
  translateX?: number
  translateY?: number
  translateZ?: number

  top?: number
  right?: number
  bottom?: number
  left?: number
  
  paddingTop?: number
  paddingRight?: number
  paddingBottom?: number
  paddingLeft?: number

  marginTop?: number
  marginRight?: number
  marginBottom?: number
  marginLeft?: number

  borderRadius?: number
}

/**
 * Creates an HTMLElement.
 * 
 * Data: a = attributes, c = classnames, d = dataset, s = style, h = innerHTML.
 * 
 * **Notes:**
 * 
 * `data.h: innerHTML`: the unified way to handle element contents. Please only use innerText when dealing with user input. It is not advisable to add innerHTML in most circumstances, but it's okay for including a paragraph full of <br>'s and special characters and style tags such as <i> or <b>.
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

function CJS_Ids(elementIds: string[]): HTMLElement[] {
  const elements: HTMLElement[] = []
  elementIds.forEach(id => {
    const element = CJS_State.elements.get(id) as HTMLElement

    //this check should still work cos it's runtime, and the "as HTMLElement" is just for the compiler
    assert(element instanceof HTMLElement, `No element found by ID '${id}'.`)
    elements.push(element)
  })
  return elements as HTMLElement[]
}

function CJS_Append(parentId: string, children: HTMLElement[]) {
  assert(children.every(c => c.isConnected === false && c.parentElement === null), `Some of the children are part of the DOM or connected to other nodes. This function does not allow replacing child positions; if you want that, call CJS_Reappend.`)

  const parent = CJS_Id(parentId)
  parent.append(...children)
}

function CJS_Reappend(newParent: HTMLElement, children: HTMLElement[]) {
  newParent.append(...children)
}


















function CJS_Animate_Hover(initial: CJS_Animation_InitialData): CJS_Animation {
  const element = CJS_Id(initial.elementId)
  const anim = CJS_Create_Animation(initial)

  // what if this function let you omit the first keyframe, because it seems natural you'd wanna go back to "no changes"
  // but it also removes flexibility, so no, now it stays as it is
  // anim.keyframes.unshift({style: {}, duration: 1,})

  anim.triggerEvent =     "mouseenter"
  anim.triggerEventOut =  "mouseleave"

  element.addEventListener(anim.triggerEvent, () => {
    console.log("Transition ✅")
    
    //@bug - weird...if this isn't here, sometimes the anim gets stuck at the last frame and never winds back down
    // anim.timeCurrent = 0

    anim.reversed = false
    anim.ended = false
    anim.paused = false

    CJS_State.animationsInactive = CJS_State.animationsInactive.filter(a => a !== anim)
    CJS_State.animationsActive.push(anim)
  })

  element.addEventListener(anim.triggerEventOut, () => {
    console.log("Transition ❌")

    // invert the animation keyframes
    // the keyframes stay the same so modification to them would ideally translate to the inverted anim too.
    anim.reversed = true
    anim.ended = false
    anim.paused = false

    CJS_State.animationsInactive = CJS_State.animationsInactive.filter(a => a !== anim)
    CJS_State.animationsActive.push(anim)
  })

  CJS_State.animationsInactive.push(anim)
  return anim
}

function CJS_Animate_Sequence(animations: CJS_Animation_InitialData[]) {

}

// mockup of a updater function for an animation
// this would run each frame
function updateAnimationObjectOrSomething() {
  // once we compute styleNew, we just do this
  for(const key in styleNew) {
    element.style[key] = String(styleNew[key])
  }
  for(const key in styleNew) {
    element.style[key] = old[key]
  }
}

function CJS_Expect(elementId: string, style: CJS_Style) {
  const element = CJS_Id(elementId)
  const computed = window.getComputedStyle(element)
  const changes: string[] = []
  
  for(const key in style) {
    if(style[key] !== computed[key]) {
      changes.push(`--${key} \nExpected: ${style[key]},\nGot: ${computed[key]}`)
    }
  }
  const errorMessage = `\nStyle for element #${elementId} has changed from expected values.\n\n${changes.join("\n\n")}\n`
  assert(changes.length === 0, errorMessage)
}

function CJS_SetFlags(flags: Partial<CJS_Flags>) {
  for(const key in flags) {
    if(key in CJS_State.flags) {
      CJS_State.flags[key as keyof CJS_Flags] = flags[key as keyof CJS_Flags]!;
    }
  }
}
















function CJS_Tick(timeCurrent: number) {
  timeDelta = timeCurrent - timeLast;
  timeLast = timeCurrent;

  /* Update all animations here */
  CJS_State.animationsActive.forEach(anim => {
    if(anim.ended || anim.paused) return

    anim.timeCurrent += timeDelta * anim.timeRemap * (anim.reversed ? -1 : 1)

    const timeNormalized = anim.timeCurrent / anim.timeTotal
    const timeNormalizedEased = anim.easeFn(0, 1, timeNormalized)
    console.log(`timeNormalized: ${timeNormalized} \n timeNormalizedEased: ${timeNormalizedEased}`)
    anim.timeCurrentEased = ease_Lerp(0, anim.timeTotal, timeNormalizedEased)

    // probably very slow calculation
    anim.keyframeIndex = getCurrentKeyframe(anim.timeCurrentEased, anim.keyframes.map(k => k.duration), anim.timeTotal)
    console.log(`Keyframe index: ${anim.keyframeIndex}`)
  })

  /* second pass where we combine certain props, such as transform */
  CJS_State.animationsActive.forEach(anim => {
    if(anim.ended || anim.paused) return

    const element =                 CJS_Id(anim.elementId)
    const keyframe =                anim.keyframes[anim.keyframeIndex]
    const transformPropsRotate =    ["rotateX", "rotateY", "rotateZ"]           as (keyof CJS_StyleAnimated)[]
    const transformPropsScale =     ["scaleX", "scaleY", "scaleZ"]              as (keyof CJS_StyleAnimated)[]
    const transformPropsTranslate = ["translateX", "translateY", "translateZ"]  as (keyof CJS_StyleAnimated)[]
    let transformString: string = ""

    transformPropsRotate.forEach(prop => {
      if(prop in keyframe.style) {
        if(keyframe.style[prop] !== undefined) {
          transformString += `${prop}(${keyframe.style[prop]}deg) `
        }
      }
    })
    transformPropsScale.forEach(prop => {
      if(prop in keyframe.style) {
        if(keyframe.style[prop] !== undefined) {
          transformString += `${prop}(${keyframe.style[prop]}) `
        }
      }
    })
    transformPropsTranslate.forEach(prop => {
      if(prop in keyframe.style) {
        if(keyframe.style[prop] !== undefined) {
          transformString += `${prop}(${keyframe.style[prop]}px) `
        }
      }
    })

    element.style.transform = transformString

    console.log(transformString)

    if(
      (anim.timeCurrent >= anim.timeTotal && !anim.reversed) || 
      (anim.timeCurrent < 0 && anim.reversed)
    ) {
      anim.ended = true
      CJS_State.animationsActive = CJS_State.animationsActive.filter(a => a !== anim)
      CJS_State.animationsInactive.push(anim)
      console.log("Ended animation")
    }
  })

  window.requestAnimationFrame(CJS_Tick)
}

function getCurrentKeyframe(
  elapsed: number,
  segmentLengths: number[],
  totalDuration: number
): number {
  const totalUnits = sum(...segmentLengths)
  const msPerUnit = totalDuration / totalUnits;

  let accumulated = 0;
  for (let i = 0; i < segmentLengths.length; i++) {
    accumulated += segmentLengths[i] * msPerUnit;
    if (elapsed < accumulated) {
      return i;
    }
  }
  return segmentLengths.length - 1; // if elapsed >= totalDuration
}

window.addEventListener("load", () => {
  CJS_Tick(0)
})

















let calculatorFrameStyle: CJS_Style = {}

function Component_Calculator() {
  const gap = "6px"
  const borderRadius = "8px"
  const fontFamilyDefault = "monospace"
  const colors = {
    bg0:    "rgb(243, 237, 234)",
    bg1:    "rgb(206, 199, 196)",
    text:   "rgb(36, 36, 36)",
    accent: "rgb(254, 128, 32)",
  }
  calculatorFrameStyle = {
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
    fontFamily:           fontFamilyDefault,
  }

  const calculatorFrame = CJS_H("calculator-frame", "div", {s: calculatorFrameStyle})

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
    const buttonId = `calculator-button-generic-${i}`
    const button = CJS_H(buttonId, "button", {h: texts[i], s: {
      ...buttonStyleBase,
      backgroundColor: colors.bg1,
    }})

    CJS_Append("calculator-frame", [button])

    
  CJS_Animate_Hover({
    type: "EventDriven",
    elementId: buttonId,
    timeTotal: 750,
    keyframes: [
    {
      duration: 1,
      style: {}
    },
    {
      duration: 1,
      style: {
        translateX: Math.random() * 20,
        scaleX: 1.1,
        scaleY: 1.1,
      }
    },
    {
      duration: 1,
      style: {
        scaleX: 1.2,
        scaleY: 1.2,
        translateX: 15,
        translateY: 15,
        rotateZ: 2,
      }
    },
    {
      duration: 1,
      style: {
        scaleX: 1.35,
        scaleY: 1.35,
        translateX: 20,
        translateY: 20,
        rotateZ: 5,
      }
    },
    {
      duration: 1,
      style: {
        scaleX: 1.42,
        scaleY: 1.42,
        translateX: 24,
        translateY: 24,
        rotateZ: 15,
      }
    },
  ]})
  }

  const equalsButton = CJS_H(`calculator-button-equals`, "button", {h: "=", s: {
    ...buttonStyleBase,
    backgroundColor: colors.accent,
  }})
  CJS_Append("calculator-frame", [equalsButton])
  CJS_Animate_Hover({
    type: "EventDriven",
    elementId: "calculator-button-equals",
    timeTotal: 150,
    keyframes: [
      {
        duration: 1,
        style: {scaleX: 1}
      },
      {
        duration: 1,
        style: {scaleX: 2}
      },
    ]
  })

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


















// //just a showcase of using the bounce function 
// function animateBounce(durationMS: number, callback: (value: number) => void, onend?: () => void) {
//   const start = performance.now();

//   function tick(now: number) {
//     const elapsed = now - start;
//     const t = Math.min(elapsed / durationMS, 1);
//     callback(ease_OutBounce(t));
//     if (t < 1) {
//       requestAnimationFrame(tick)
//     } else {
//       onend?.()
//     };
//   }

//   requestAnimationFrame(tick);
// }