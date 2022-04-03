// TODO JAVASCRIPT BASIC FUNCTIONALITY:
// Function to display background image credit when updating background
// Function to allow user to lock background image
// Naming saved palettes
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
        'rgb': [200, 26, 21],
        'locked': false
    },
    {
        'rgb': [254, 249, 233],
        'locked': false
    },
    {
        'rgb': [125, 204, 203],
        'locked': false
    },
    {
        'rgb': [75, 152, 153],
        'locked': false
    },
    {
        'rgb': [39, 47, 42],
        'locked': false
    },
    {
        'hero': undefined,
    },
    {
        'sortedHsl': [[143, 9, 17], [2, 81, 43], [181, 34, 45], [179, 44, 65], [46, 91, 95]]
    }
];

var paletteID = 1;
var savedPalettes = [];

// Array will populate with HSL values, not RGB values
// Colors are sorted darkest to lightest
let hslPalette = {
    unsorted: [],
    sorted: [[143, 9, 17], [2, 81, 43], [181, 34, 45], [179, 44, 65], [46, 91, 95]]
};

// Remove dom element from view but not the consumed space
const hideElement = function (element) {
    $(element).removeClass( "visible" ).addClass( "invisible" );
};

// Remove dom element from view but not the consumed space
const hideContent = function (element) {
    $(element).removeClass( "visible" ).addClass( "hidden" );
};

// Make the targeted element visible
const showContent = function (element) {
    $(element).removeClass( "hidden invisible" ).addClass( "visible" );
};

//Remove the Dom element with the matching selector
const removeElement = function (selector) {
    var element = document.querySelector(selector);
    if(element){
        element.remove();
    }
};

// Save Array of Palettes to local storage
const updateLocalStorage = function () {
    localStorage.setItem("savedPalettes", JSON.stringify(savedPalettes));
};

// Load saved content from local storage back to the app
const loadLocalStorage = function () {
    //Get saved palettes from localStorage.
    savedPalettes = localStorage.getItem("savedPalettes");
  
    if (savedPalettes === null) {
        savedPalettes = [];
    } else {  
        //Converts eventTasks from the string format back into an array of objects.
        savedPalettes = JSON.parse(savedPalettes);
    }
};

//convert hex color to rgb
//Function from https://convertingcolors.com/blog/article/convert_hex_to_rgb_with_javascript.html
String.prototype.convertToRGB = function(){
    if(this.length != 6){
        throw "Only six-digit hex colors are allowed.";
    }

    var aRgbHex = this.match(/.{1,2}/g);
    var aRgb = [
        parseInt(aRgbHex[0], 16),
        parseInt(aRgbHex[1], 16),
        parseInt(aRgbHex[2], 16)
    ];
    return aRgb;
};

// Display saved palettes
// Function call commented out.  Still working on background color setting
const showSavedPalettes = function (updated) {
    var i=0

    //Save button was clicked
    if(updated) {
        i = savedPalettes.length - 1;
    }

    // Update each color block with a background color from our sorted array
    for (i; i < savedPalettes.length; i++) {
        var savedPal = savedPalettes[i];
        const heroColorHSL = savedPal[6].sortedHsl[3]
        const heroColorRgb = HSLToRGB(heroColorHSL[0], heroColorHSL[1], heroColorHSL[2])

        var savedPaletteEL = $("<div>")
        .attr("data-saved", i)
        // Background is hero image with color overlay
        .css('background', `linear-gradient(rgba(${heroColorRgb[0]}, ${heroColorRgb[1]}, ${heroColorRgb[2]}, 0.50), rgba(${heroColorRgb[0]}, ${heroColorRgb[1]}, ${heroColorRgb[2]}, 0.50)), url(${savedPal[5].hero.urls.thumb}) center center`)
        .css('backgroundSize', 'cover')
        // Class for further styling
        .addClass('savedPaletteContainer')

        $(savedPaletteEL).appendTo($("#savedPalettes"));
        for (var k= 0; k < 5; k++) {
            
            var tempBlock = savedPal[k];
            var savedBlockEl = $("<span>")
            .addClass("savedBlock")
            .attr("data-saved", i);
            
            var color = 'rgb(' + tempBlock.rgb[0] + ',' + tempBlock.rgb[1] + ',' +  tempBlock.rgb[2] + ')';
           $(savedBlockEl).css("backgroundColor", color);
           $(savedBlockEl).appendTo($(savedPaletteEL));
        }

        var deleteBtnEl = $("<button>")
        .addClass("deletePaletteBtn")
        .attr("data-saved", i);
        var imgEl = $("<img>")
        .addClass("svgTrash")
        .attr("src", "assets/images/trash-svgrepo-com.svg")
        .attr("alt", "");

        $(imgEl).appendTo($(deleteBtnEl));
        $(deleteBtnEl).appendTo($(savedPaletteEL));
    }
};

// Function to show user the locked status, calls from anonymous onclick function
const displayLockedStatus = function (locked, i) {
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

// Request a new color palette from Colormind API 
const requestColorPalette = function(userColor) {
    
    // CORS anywhere helps GitHub Pages accept http fetch requests
    // If this ever stops working, check out the console log for a link to follow to be granted temporary access again
    let corsAnywhereUrl = 'https://cors-anywhere.herokuapp.com/';
    var apiUrl = "http://colormind.io/api/";
    let url = corsAnywhereUrl + apiUrl;
    let data = {
        model : "default",
        input : ["N","N","N","N","N"]
    }

    if(userColor)    {
        for (let i=0; i < palette.length; i++) {
            if (!palette[i].locked) {
                // Update locked colors into data.input
                data.input[i] = userColor;
                console.log("input", data.input);
                break;
            }
        }
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
        }
    }

    http.open("POST", url, true);
    http.send(JSON.stringify(data));
}

// Updates palette object with new rgb values
const updatePalette = function(rgbColors) {
    for (let i=0; i < 5; i++) {
        palette[i].rgb = rgbColors[i];
    }

    // Empty out arrays prior to populating
    hslPalette.sorted = [];
    hslPalette.unsorted = [];

    // Update sorted HSL array
    let hslColorsSorted = sortColors(rgbColors);
    hslPalette.sorted = hslColorsSorted;

    // Update palette with sorted HSL array
    palette[6].sortedHsl = hslColorsSorted;

    // Update unsorted HSL array
    for (let i=0; i < 5; i++) {
        hslColor = rgbToHsl(rgbColors[i][0], rgbColors[i][1], rgbColors[i][2])
        hslPalette.unsorted.push(hslColor);
    }

    updateHexTextEls();

    return showNewColors();
}

// Displays colors ordered from darkest to lightest in color blocks
const showNewColors = function(fromSaved) {

    // Update each element with a class pertaining to the particular color
    for (let i=0; i < 5; i++) {

        let r = palette[i].rgb[0];
        let g = palette[i].rgb[1];
        let b = palette[i].rgb[2];

        let h = palette[6].sortedHsl[i][0];
        let s = palette[6].sortedHsl[i][1];
        let l = palette[6].sortedHsl[i][2];

        let updateClass = document.querySelectorAll(`.color${i+1}`);
        updateClass.forEach(function(element) {
            if (i != 4) {
                element.style.backgroundColor = `hsl(${h}, ${s}%, ${l}%)`;
                element.style.borderColor = `hsl(${h}, ${s}%, ${l}%)`;
            } else {
                element.style.color = `hsl(${h}, ${s}%, ${l}%)`;
            }            
        });

        if (i === 2 || i === 3) {
            updateText(i);
        }

        // Update SVG icons
        let svgIcon = document.getElementById(`color-block-${i+1}`);
        svgIcon.setAttribute('fill', `rgb(${r}, ${g}, ${b})`)
    }

    return updateBackground(fromSaved);
}

const updateText = function(i) {

    // Colors brightness
    let l = palette[6].sortedHsl[i][2];

    // Update button text
    let updateTextDark = document.querySelectorAll(`.color${i+1}`);
    updateTextDark.forEach(function(element) {
        // Particular color needs dark text
        if (parseInt(l) > 45) {
            let textH = palette[6].sortedHsl[0][0]
            let textS = palette[6].sortedHsl[0][1]
            let textL = palette[6].sortedHsl[0][2]

            element.style.color = `black`;
        }
        // Particular color needs light text
        else {
            let textH = palette[6].sortedHsl[4][0]
            let textS = palette[6].sortedHsl[4][1]
            let textL = palette[6].sortedHsl[4][2]

            element.style.color = `white`;
        }
    })
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

          return updateBackground();
      })
    })
}

// Update background from our backgroundImages array (preloaded upon opening of page by user)
const updateBackground = function(fromSaved) {

    let backgroundEl = document.querySelector('.background-img');
    let imageUrl;
    let color;
    let randomImage;

    // Background is being loaded from a saved palette
    if (fromSaved) {
        imageUrl = palette[5].hero.urls.raw;

        // Colors are taken from sorted HSL palette and then converted to RGB
        color = HSLToRGB(palette[6].sortedHsl[3][0], palette[6].sortedHsl[3][1], palette[6].sortedHsl[3][2])
    } 
    // Background is being generated randomly
    else {
        // Image object is selected
        randomImage = backgroundImages[randomNum(0, backgroundImages.length - 1)]
        // Image URL from object
        imageUrl = randomImage.urls.raw;

        // Background color is second to lightest color
        color = HSLToRGB(hslPalette.sorted[3][0], hslPalette.sorted[3][1], hslPalette.sorted[3][2]);

        // Update palette with hero
        palette[5].hero = randomImage;
    }

    // To overlay color onto background, linear-gradient is needed
    backgroundEl.style.background = `linear-gradient(rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.50), rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.50)), url(${imageUrl}) center center`;
    backgroundEl.style.backgroundSize = 'cover';

    /* LEAVE CODE HERE - WILL UNCOMMENT WHEN WE HAVE FOOTER STYLING
    // Attribute artist of background in footer
    let el = document.getElementById('~~~~~~UPDATE ME~~~~~~~')
    let artistUrl = randomImage.user.links.html;
    let artistName = randomImage.user.name;
    el.innerHTML = `<span>Photo by <a href="${artistUrl}?utm_source=I_made_you_a_palette&utm_medium=referral" target="_blank">${artistName}</a> on <a href="https://unsplash.com/?utm_source=I_made_you_a_palette&utm_medium=referral" target="_blank">Unsplash</a></span>`
    // Update all classes below separated by commas
    el.classList.add('ADD', 'CLASSES', 'HERE')
    */

    return checkBrightness(imageUrl);
}

// Checks if background image needs light or dark text
const checkBrightness = function(imageSrc) {
    getImageLightness(imageSrc, function(brightness) {

        // Light text
        if (brightness < 130) {
            darkMode = true;
            changeText(false);
        } 
        // Dark text
        else {
            changeText(true);
        }
    })
}

// Change text color based on dark mode status
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

// Display HEX value for colors in current palette
const updateHexTextEls = function() {

    for (let i=0; i < 5; i++) {
        let r = parseInt(palette[i].rgb[0]);
        let g = parseInt(palette[i].rgb[1]);
        let b = parseInt(palette[i].rgb[2]);

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

// Convert RGB color values to Hex
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

// Code from https://www.30secondsofcode.org/js/s/hsl-to-rgb
// Takes integers and returns integers
const HSLToRGB = (h, s, l) => {
    s /= 100;
    l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n =>
      l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return [255 * f(0), 255 * f(8), 255 * f(4)];
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

// Handler for generate palettes button
const generateHandler = function() {

    requestColorPalette([]);
}

// Event listener for the generate button
buttonEl.addEventListener('click', generateHandler);

loadBackgrounds();
loadLocalStorage();
showSavedPalettes(false);

// Event listener for palette save button
$(".saveBtn").on("click", function() {
    //add current palette to array of palettes
    // Deep copy made so that arrays don't point at same place in memory (so that when palette is updated savedPalettes isn't updated as well)
    let paletteDeepCopy = JSON.parse(JSON.stringify(palette));
    savedPalettes.push(paletteDeepCopy);
    showSavedPalettes(true);
    updateLocalStorage();
    if (!errorFlag) {
        hideElement($("#CORS"));
    } 
});

// Event listener for pPreviously saved palettes when clicked
$("#savedPalettes").on("click", "span", function() {
    //reload saved palette
    var index = this.getAttribute("data-saved");
    // Deep copy made so that arrays don't point at same place in memory (so that when savedPalettes is updated palette isn't updated as well)
    let savedPaletteDeepCopy = JSON.parse(JSON.stringify(savedPalettes));
    palette = savedPaletteDeepCopy[index];
    showNewColors(true);
    if (!errorFlag) {
        hideElement($("#CORS"));
    } 
});

// Event listener for delete button for a saved palette was clicked
$("#savedPalettes").on("click", "button", function(event) {
    //Delete saved palette

    let currentContainer = this.parentNode;
    let parentContainer = currentContainer.parentNode;
    let index = Array.prototype.indexOf.call(parentContainer.children, currentContainer);

    var dataSavedInt = this.getAttribute("data-saved");
    console.log("index", dataSavedInt);
    
    let selector = "div[data-saved=" + dataSavedInt + "]";
    $(selector).remove();

    console.log("savedPalettes.length", savedPalettes.length);
    let tempArray = [];
    for(let i = 0; i < savedPalettes.length; i++){
        if(i != index) {
            tempArray.push(savedPalettes[i]);
        }
    }

    savedPalettes = tempArray
    updateLocalStorage();
    console.log("savedPalettes.length", savedPalettes.length);
    if (!errorFlag) {
        hideElement($("#CORS"));
    } 
});

$("#submitColor").on("click", function(event) {
    event.preventDefault();
    console.log(this);
    let hexColor = $("#startColor").val();
    console.log("color", hexColor);
    let rgbConvert = hexColor.convertToRGB();
    console.log("converted color", rgbConvert);
    requestColorPalette(rgbConvert);

});