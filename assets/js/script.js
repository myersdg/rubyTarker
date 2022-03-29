// TODO JAVASCRIPT BASIC FUNCTIONALITY:
// Function to update elements on page to new colors, take RGB values from palette
// How do we target the SVG files and update the colors for the above function?
// What are the class names that are being targeted for each color specifically?
// Function to fetch request from Unsplash on page load, returns data to a black and white background image
// After fetch request from Unsplash, update a variable with fetch data so that when the user generates a new background it doesn't have to fetch every time (we have a limit on fetches)
// Function to update hero element on page after user clicks generate (Unsplash requires we display the artists URL somewhere on the page btw)
// What class or ID gets targeted to update the background? What color is the background receiving?
// (DONE?) Update anonymous onclick function to disable locking
// Function to update global array variable for saved design(s), executes on page load and after user clicks save design
// Function to save saved designs global variable (palette and hero) to local storage, retain order from palette as elements will always update the same given the same order
// Function to update saved favorites on the sidebar, 
// What class or ID specifically needs to be targeted on the DOM to update the sidebar?
// TODO JAVASCRIPT EXTRA FUNCTIONALITY (NOT APART OF MVP):
// Function to check background image for lightness (so that a predominantly dark backgrounds aren't selected) (potentially could use - https://stackoverflow.com/questions/13762864/image-brightness-detection-in-client-side-script)
// If background image is too dark for overlay color to appear, choose another picture

const buttonEl = document.getElementById('generate-colors');

// Colormind returns an array of 5 rgb colors as an array of 3 element arrays.
//  We can store as an array objects with rgb color and lock status
var palette = [
    {
        'rgb': [133, 42, 244],
        'locked': false
    },
    {
        'rgb': [33, 22, 44],
        'locked': false
    },
    {
        'rgb': [13, 52, 24],
        'locked': false
    },
    {
        'rgb': [20, 60, 48],
        'locked': false
    },
    {
        'rgb': [226,209,167],
        'locked': false
    }
];

var savedPalettes = [];

// Array will populate with HSL values, not RGB values
// Colors are sorted darkest to lightest
let hslPalette = {
    unsorted: [],
    sorted: [],
};

// Remove dom element from view but not the consumed space
var hideContent = function (element) {
    $(element).removeClass( "visible" ).addClass( "hidden" );
};

var showContent = function (element) {
    $(element).removeClass( "hidden" ).addClass( "visible" );
};

var updateLocalStorage = function () {
    localStorage.setItem("palette", JSON.stringify(palette));
};

var loadLocalStorage = function () {
    //Get saved palettes from localStorage.
    savedPalettes = localStorage.getItem("savedPalettes");
  
    if (savedPalettes === null) {
        savedPalettes = [];
    } else {  
        //Converts eventTasks from the string format back into an array of objects.
        savedPalettes = JSON.parse(savedPalettes);
    }
};

// Function to show user the locked status, calls from anonymous onclick function
var displayLockedStatus = function (locked, i) {
   var selector = "[data-locked=" + i + "]";
    var iconEL = $(selector);
    if(locked) {
        showContent(iconEL);
    } else {
        hideContent(iconEL);
    }
    
};

// Sets locked to true, if the color is not locked else unlocks and sets to false
// Any function that updates colors will need to check if locked before updating the color
$(".palette").on("click", "span", function() {
    //search for position id colBlock1
    var id = this.getAttribute("id");
    var i = id.length - 1;
    var position = id[i] - 1;

    if (palette[position].locked) {
        palette[position].locked = false;
    } else {
        palette[position].locked = true;
    }
    displayLockedStatus(palette[position].locked, id[i]);
});

const requestColorPalette = function() {
    
    var url = "http://colormind.io/api/";
    var data = {
        model : "default",
        input : ["N","N","N","N","N"]
    }

    // Check palette to see if any colors are locked
    for (let i=0; i < palette.length; i++) {
        if (palette[i].locked) {
            // Update locked colors into data.input
            data.input[i] = palette[i].rgb;
        }
    }

    var http = new XMLHttpRequest();

    http.onreadystatechange = function() {
        if(http.readyState == 4 && http.status == 200) {
            var rgbColors = JSON.parse(http.responseText).result;
            return updatePalette(rgbColors);
        }
    }

    http.open("POST", url, true);
    http.send(JSON.stringify(data));
}

// Updates palette object with new rgb values
const updatePalette = function(rgbColors) {
    for (let i=0; i < palette.length; i++) {
        palette[i].rgb = rgbColors[i];
    }

    // Empty out arrays prior to populating
    hslPalette.sorted = [];
    hslPalette.unsorted = [];

    // Update sorted HSL array
    let hslColorsSorted = sortColors(rgbColors);
    hslPalette.sorted = hslColorsSorted;

    // Update unsorted HSL array
    for (let i=0; i < 5; i++) {
        hslColor = rgbToHsl(rgbColors[i][0], rgbColors[i][1], rgbColors[i][2])
        hslPalette.unsorted.push(hslColor);
    }

    return showNewColors();
}

// Displays colors ordered from darkest to lightest in color blocks
const showNewColors = function() {

    // Update each color block with a background color from our unsorted array
    for (let i=0; i < palette.length; i++) {
        let colorBlockEl = document.querySelector(`[data-color-id="${i+1}"]`)
        colorBlockEl.style.backgroundColor = `hsl(${hslPalette.unsorted[i][0]}, ${hslPalette.unsorted[i][1]}%, ${hslPalette.unsorted[i][2]}%)`;
    }

    return true;
}

// Takes unsorted RGB colors from Colormind and sorts them from darkest to lightest into a new array
const sortColors = function(rgbColors) {
    let hsvColors = [];
    let sortedHsvColors = [];

    // Iterate through each RGB color, convert to HSL, populate HSV color array
    for (let index in rgbColors) {
        // Current RGB color being converted to HSL
        let colorValues = rgbColors[index]
        // Converted HSL color values
        let hsvColor = rgbToHsl(colorValues[0], colorValues[1], colorValues[2]);
        // Update HSV array with converted color values
        hsvColors.push(hsvColor);
    }

    // Sort the HSL values by their L (lightness)
    for (let index in hsvColors) {
        // If sorted array is empty, add first color
        if (sortedHsvColors[0] === undefined) {
            sortedHsvColors.push(hsvColors[index]);
            hsvColors.shift();
        }

        let highestIndex = 0;
        // Selects index at which unsorted color should be inserted into array (ordered darkest to lightest)
        for (let i=0; i < sortedHsvColors.length; i++) {
            // if value (lightness) of unsorted color is higher than sorted color, update the highestIndex
            if (hsvColors[index][2] > sortedHsvColors[i][2]) {
                highestIndex = i+1;
            }
        }
        // Insert unsorted color into sorted array at selected index
        sortedHsvColors.splice(highestIndex, 0, hsvColors[index]);
    }

    console.log(sortedHsvColors)
    return sortedHsvColors;
}

// Function from https://www.30secondsofcode.org/js/s/rgb-to-hsl
// Converts RBG values to HSL color values
// Expects integers as arguments, returns an array of integers
const rgbToHsl = function(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const l = Math.max(r, g, b);
    const s = l - Math.min(r, g, b);
    const h = s
      ? l === r
        ? (g - b) / s
        : l === g
        ? 2 + (b - r) / s
        : 4 + (r - g) / s
      : 0;
    return [
      60 * h < 0 ? 60 * h + 360 : 60 * h,
      100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0),
      (100 * (2 * l - s)) / 2,
    ];
  };

buttonEl.addEventListener('click', requestColorPalette);
