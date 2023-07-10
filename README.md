
# Ho11y Method: Accessible Color Palette Generator

Accessible monochromatic color palette generator.
Created by designer [Marta Hollingsworth](https://github.com/holly-hh).

if you want to use this method manually instead of programatically, visit https://www.accessiblecolorpalette.com/

Given a valid hex color and a background/theme color ('white' or 'black'), it generates an easily combinable 6-shades monochromatic color palette that meets WCAG contrast requirements.

The 6 shades are: 100, 300, 600, 700, 800 and 900.

The palette also includes the compatibilities between different colors for small text and large text. 
According to the [WCAG contrast minimum success criterion](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html), the visual presentation of small text (16px) and images of text needs to have a contrast ratio of at least 4.5:1 with the background color. In the case of large text (18px), the contrast ratio between text and background should be at least 3.1:1.

**Small text:** 16px [at least 4.5:1]

**Large text:** from 18px on [at least 3.1:1]

## Installation

```bash
  npm i accessible-color-palette
```
    
## Usage/Examples

```javascript
AccessibleColorPalette.generatePalette('#1c734e', 'black')

{
    "100": {
        "compatibilities": {
            "largeText": ["#b83700"],
            "smallText": ["#e64500", "#ffa680", "#ffdbcc"]
        },
        "name": "100",
        "rgb": {"r": 41, "g": 12, "b": 0},
        "hex": "#290c00",
        "hsl": {"h": 18, "s": 100, "l": 8},
        "info": "(4.5:1 on 700)"
    },
    "300": {
        "compatibilities": {
            "largeText": ["#e64500"],
            "smallText": ["#ffa680", "#ffdbcc"]
        },
        "name": "300",
        "rgb": {"r": 97, "g": 29, "b": 0},
        "hex": "#611d00",
        "hsl": {"h": 18, "s": 100, "l": 19},
        "info": "(3.1:1 on 700)"
    },
    "600": {
        "compatibilities": {
            "largeText": ["#000000", "#290c00", "#ffa680"],
            "smallText": ["#ffdbcc"]
        },
        "name": "600",
        "rgb": {"r": 184, "g": 55, "b": 0},
        "hex": "#b83700",
        "hsl": {"h": 18, "s": 100, "l": 36},
        "info": "(3.1:1 on 100)"
    },
    "700": {
        "compatibilities": {
            "largeText": ["#611d00", "#ffdbcc"],
            "smallText": ["#290c00", "#000000"]
        },
        "name": "700",
        "rgb": {"r": 230, "g": 69, "b": 0},
        "hex": "#e64500",
        "hsl": {"h": 18, "s": 100, "l": 45},
        "info": "(5.2:1 on background)"
    },
    "800": {
        "compatibilities": {
            "largeText": ["#b83700"],
            "smallText": ["#611d00", "#290c00", "#000000"]
        },
        "name": "800",
        "rgb": {"r": 255, "g": 166, "b": 128},
        "hex": "#ffa680",
        "hsl": {"h": 18, "s": 100, "l": 75},
        "info": "(3.1:1 on 600)"
    },
    "900": {
        "compatibilities": {
            "largeText": ["#e64500"],
            "smallText": ["#000000", "#290c00", "#611d00", "#b83700"]
        },
        "name": "900",
        "rgb": {"r": 255, "g": 219, "b": 204},
        "hex": "#ffdbcc",
        "hsl": {"h": 18, "s": 100, "l": 90},
        "info": "(3.1:1 on 700)"
    }
}


```


## Explanation
### What does the method do?
The method creates a monochromatic color palette of a reference color. This reference color can or cannot be included in the results: this will depend on if this reference color meets our method's calculations. If this reference color isn't suitable to be included in the generated palette, the algorithm will find the closest shade to it and replace it.
#### But... what if I have a brand color that I NEED to keep?
The creation of this palette doesn't mean you shouldn't use your reference or brand's color. What The Ho11y Method aims to do is creating a palette from a main color that provides us with a 100% guaranteed and proved way of combining colors in digital environments. If your brand's main color isn't accessible with your background color, this tool can provide you with a shades palette that is close enough to it so you have enough resources to navigate your way accessibly through the designs. You can also use this tool to create a palette from a secondary color to your brand, etc.
### What uses does method cover?
The Ho11y Method was ideated as a way to accessibly cover the following uses:

- Colored backgrounds
- Default state of a component
- Hover state of a component
- Active state of a component
This method does **NOT** cover **inactive states** since the WCAG doesn't ask for a minimum contrast ratio.

### How it works
This library makes use of [colosys](https://github.com/netbeast/colorsys) and [@mdhnpm/color-contrast-ratio-calculator](https://www.npmjs.com/package/@mdhnpm/color-contrast-ratio-calculator)

[The whole process is documented in this Figjam file.](https://www.figma.com/file/HgfOCeDFniUzSsSIbEZ0Uy/accessible-color-palette?type=whiteboard&node-id=0%3A1&t=8qomKmo3w7qkixKP-1)


The palette generator takes two arguments: a **valid hex color** and a **background** or theme color 'black' or 'white.

The final palette will have 6 shades: 100, 300, 600, 700, 800 and 900.

1. **The first step is getting the shadow 700**, which will be our base color for building the rest of the palette. 
Our shade 700 is required to have a contrast ratio of 5.1 (or very close but never less) with the background color. 

Don't panic, this is the hardest one.

Therefore, the first thing we do is check the contrast ratio between the valid hex color given as the first argument and the background color. If that ratio equals 5.2, then we have our 700.

If not, we will consider the background color and if the current contrast ratio is lower of higher than we need to remove or add light to the HSL version of the color, until we get a color that has a contrast ratio of 5.2 with the background.

2. **Get shade 100.**

To find it, we need to find a color that has a contrast ratio of 4.5:1 with our base color, shade 700. 

To do this, if the background/theme color is white, we will add light to the HSL version of our 700 shade until it has a contrast ratio with itself of 4.5:1.

If the background/theme color is black, we will remove light.

3. **Get shade 300**

300 needs to have a contrast ratio of 3.1:1 with shade 700.

If the background/theme is white, we add light until 700 has a contrast ratio of 3.1:1 on the new color. If the background is black, we remove light until desired ratio.

4. **Get shade 600**
600 needs to have a contrast ratio of 3.1:1 with shade 100.

If the background is white we remove light from the HSL version of shade 100, if the background is black we add light.

5. **Get shade 800**
800 needs to have a contrast ratio of 3.1:1 with shade 600.

If the background color is white, we remove light from 600 until we have a contrast ratio of 3.1:1 with 600. If the background is black, we add light until so.

6. **Get shade 900**
900 needs to have a contrast ratio of 3.1:1 with shade 700.

If the background is white we remove light from 700 and if it's black we add light until the contrast ratio is 3.1:1.
## Contributing

Contributions are always welcome!

Before contributing read the explanation above, where you have a link to a Figjam with diagrams explaining the process and functions.

After you've read it, proceed as follows:
- Open an issue explaining the bug/feature
- Upadte the tests if needed
- Open a PR and link it to the issue and wait for approval 🤗

Please adhere to this project's `code of conduct`.

