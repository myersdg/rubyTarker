// TODO JAVASCRIPT BASIC FUNCTIONALITY:
// (DONE?) Function to update elements on page to new colors, take RGB values from palette
// (DONE?) How do we target the SVG files and update the colors for the above function?
// (DONE?) What are the class names that are being targeted for each color specifically?
// (DONE?) Function to fetch request from Unsplash on page load, returns data to a black and white background image
// (DONE?) After fetch request from Unsplash, update a variable with fetch data so that when the user generates a new background it doesn't have to fetch every time (we have a limit on fetches)
// (DONE?)Function to display background image credit when updating background
// Function to allow user to lock background image
// Need to know what element to update with artist credit words
// What color is the background receiving?
// (DONE?) Update anonymous onclick function to disable locking
// Function to update global array variable for saved design(s), executes on page load and after user clicks save design
// Function to save saved designs global variable (palette and hero) to local storage, retain order from palette as elements will always update the same given the same order
   // Done:  palette saved to local storage
// (Done) Function to update saved favorites on the sidebar, 
// (Done) What class or ID specifically needs to be targeted on the DOM to update the sidebar?
// TODO JAVASCRIPT EXTRA FUNCTIONALITY (NOT APART OF MVP):
// (DONE?) Function to check background image for lightness (so that a predominantly dark backgrounds aren't selected) (potentially could use - https://stackoverflow.com/questions/13762864/image-brightness-detection-in-client-side-script)
// If background image is too dark for dark text, change to light text

const buttonEl = document.getElementById('generate-colors');
let backgroundImages = [];
let darkMode = false;
let errorFlag = true;

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
var hideElement = function (element) {
    $(element).removeClass( "visible" ).addClass( "invisible" );
};

// Remove dom element from view but not the consumed space
var hideContent = function (element) {
    $(element).removeClass( "visible" ).addClass( "hidden" );
};

// Make the targeted element visible
var showContent = function (element) {
    $(element).removeClass( "hidden invisible" ).addClass( "visible" );
};

// Array of P
var updateLocalStorage = function () {
    localStorage.setItem("savedPalettes", JSON.stringify(savedPalettes));
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

// Display saved palettes
// Function call commented out.  Still working on background color setting
var showSavedPalettes = function (updated) {
    var i=0

    //Save button was clicked
    if(updated) {
        i = savedPalettes.length - 1;
    }

    // Update each color block with a background color from our sorted array
    for (i; i < savedPalettes.length; i++) {
        var savedPaletteEL = $("<div>")
        .attr("data-saved", i);
 
        var savedPal = savedPalettes[i];

        $(savedPaletteEL).appendTo($("#savedPalettes"));
        for (var k= 0; k < savedPal.length; k++) {
            
            var tempBlock = savedPal[k];
            var savedBlockEl = $("<span>")
            .addClass("savedBlock")
            .attr("data-saved", i);
            
            var color = 'rgb(' + tempBlock.rgb[0] + ',' + tempBlock.rgb[1] + ',' +  tempBlock.rgb[2] + ')';
           $(savedBlockEl).css("backgroundColor", color);
           $(savedBlockEl).appendTo($(savedPaletteEL));
        }
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
    
    if (!errorFlag) {
        hideElement($("#CORS"));
    } 
    displayLockedStatus(palette[position].locked, id[i]);
});

// Random number generation - used for selecting background image
const randomNum = function(min, max) {
    let num = Math.floor(Math.random() * (max + 1 - min)) + min;
    return num;
  }

const requestColorPalette = function() {
    
    // CORS anywhere helps GitHub Pages accept http fetch requests
    // If this ever stops working, check out the console log for a link to follow to be granted temporary access again
    let corsAnywhereUrl = 'https://cors-anywhere.herokuapp.com/';
    var apiUrl = "http://colormind.io/api/";
    let url = corsAnywhereUrl + apiUrl;
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
            errorFlag = false;
            hideElement($("#CORS"));
            return updatePalette(rgbColors);
        }
        else {
            console.log(`${http.readyState} - readyState`);
            console.log(`${http.status} - http status`);
            if (errorFlag) {
                showContent($("#CORS"));
            } 
            console.log(`Click me - https://cors-anywhere.herokuapp.com/corsdemo`)
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

    // Update each element with a class pertaining to the particular color
    for (let i=0; i < 5; i++) {

        let r = palette[i].rgb[0];
        let g = palette[i].rgb[1];
        let b = palette[i].rgb[2];

        let updateClass = document.querySelectorAll(`.color${i+1}`);
        updateClass.forEach(function(element) {
            if (i != 4) {
                element.style.backgroundColor = `rgb(${r}, ${g}, ${b}`;
            } else {
                element.style.color = `rgb(${r}, ${g}, ${b}`;
            }            
        });

        // Update SVG icons
        let svgIcon = document.getElementById(`color-block-${i+1}`);
        svgIcon.setAttribute('fill', `rgb(${r}, ${g}, ${b})`)
    }

    return true;
}

// Fetches around 28 background images from Unsplash and loads them into backgroundImages array
// Every time generate is clicked by the user, the background will be pulled randomly from backgroundImages array
const loadBackgrounds = function() {
    const apiUrl = 'https://api.unsplash.com/search/photos/?client_id=twHOIsQ9Yvbs3xzZqvod32i4hlZVRGHDt8kmNmVQP-E&query=background&color=black_and_white&orientation=landscape&per_page=100';
    
    fetch(apiUrl).then(function(response) {
      response.json().then(function(data) {
          // For every image in the data that isn't a sponsored image, add it to the backgroundImages array
          for (let i=0; i < data.results.length; i++) {
            if (data.results[i].sponsorship === null) {
                backgroundImages.push(data.results[i]);
            }
          }
          console.log(data);

          return updateBackground();
      })
    })
}

// Update background from our backgroundImages array (preloaded upon opening of page by user)
const updateBackground = function() {
    let backgroundEl = document.querySelector('.background-img');
    // Image object is selected
    let randomImage = backgroundImages[randomNum(0, backgroundImages.length - 1)]
    // Image URL from object
    let randomImageUrl = randomImage.urls.raw;
    backgroundEl.style.backgroundImage = `url(${randomImageUrl})`;
    backgroundEl.style.backgroundRepeat = 'no-repeat';
    backgroundEl.style.backgroundSize = 'cover';
    backgroundEl.style.backgroundPosition = 'center center';

    /* LEAVE CODE HERE - WILL UNCOMMENT WHEN WE HAVE FOOTER STYLING
    // Attribute artist of background in footer
    let el = document.getElementById('~~~~~~UPDATE ME~~~~~~~')
    let artistUrl = randomImage.user.links.html;
    let artistName = randomImage.user.name;
    el.innerHTML = `<span>Photo by <a href="${artistUrl}?utm_source=I_made_you_a_palette&utm_medium=referral" target="_blank">${artistName}</a> on <a href="https://unsplash.com/?utm_source=I_made_you_a_palette&utm_medium=referral" target="_blank">Unsplash</a></span>`
    // Update all classes below separated by commas
    el.classList.add('ADD', 'CLASSES', 'HERE')
    */

    return checkBrightness(randomImageUrl);
}

// Checks if background image needs light or dark text
const checkBrightness = function(imageSrc) {
    getImageLightness(imageSrc, function(brightness) {
        console.log(`This image has a lightness of ${brightness} on a scale of 0 (darkest) to 255 (brightest)`);

        if (brightness < 130) {
            darkMode = true;
            console.log('This background image should probably have light text');
            changeText(false);
        } else {
            console.log('This background image should probably have dark text');
            changeText(true);
        }
    })
}

const changeText = function(isDark) {
    let hexTextEls = document.querySelectorAll('.displayHex');
    hexTextEls.forEach(function(element) {
        if (isDark) {
            element.style.color = 'black';
        } else {
            element.style.color = 'white';
        }
    })
}

const updateHexTextEls = function() {

    for (let i=0; i < 5; i++) {
        let r = parseInt(palette[i].rgb[0]);
        let g = parseInt(palette[i].rgb[1]);
        let b = parseInt(palette[i].rgb[2]);

        console.log(r, g, b)

        let inputEl = document.getElementById(`hex${i+1}`);
        let hex = ConvertRGBtoHex(r, g, b);
        inputEl.value = hex;
    }
}

// Below two functions from https://www.delftstack.com/howto/javascript/rgb-to-hex-javascript/
function ColorToHex(color) {
    var hexadecimal = color.toString(16);
    return hexadecimal.length == 1 ? "0" + hexadecimal : hexadecimal;
}

function ConvertRGBtoHex(red, green, blue) {
    return "#" + ColorToHex(red) + ColorToHex(green) + ColorToHex(blue);
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

// Function from https://stackoverflow.com/questions/13762864/image-brightness-detection-in-client-side-script
// Returns brightness in the callback function given an image source and a callback function
const getImageLightness = function(imageSrc,callback) {
    var img = document.createElement("img");
    img.src = imageSrc;
    img.style.display = "none";
    img.crossOrigin = "anonymous";
    document.body.appendChild(img);

    var colorSum = 0;

    img.onload = function() {
        // create canvas
        var canvas = document.createElement("canvas");
        canvas.width = this.width;
        canvas.height = this.height;

        var ctx = canvas.getContext("2d");
        ctx.drawImage(this,0,0);

        var imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
        var data = imageData.data;
        var r,g,b,avg;

        for(var x = 0, len = data.length; x < len; x+=4) {
            r = data[x];
            g = data[x+1];
            b = data[x+2];

            avg = Math.floor((r+g+b)/3);
            colorSum += avg;
        }

        var brightness = Math.floor(colorSum / (this.width*this.height));
        img.remove();
        callback(brightness);
    }
}

const generateHandler = function() {
    requestColorPalette();
    updateBackground();
    updateHexTextEls();
}

buttonEl.addEventListener('click', generateHandler);

loadBackgrounds();
loadLocalStorage();
showSavedPalettes(false);

$(".saveBtn").on("click", function() {
    //add current palette to array of palettes
    savedPalettes.push(palette);
    showSavedPalettes(true);
    updateLocalStorage();
    if (!errorFlag) {
        hideElement($("#CORS"));
    } 
});

// Previously saved palette was clicked
$("#savedPalettes").on("click", "span", function() {
    //reload saved palette
    var index = this.getAttribute("data-saved");
    palette = savedPalettes[index];
    showNewColors();
    if (!errorFlag) {
        hideElement($("#CORS"));
    } 
});