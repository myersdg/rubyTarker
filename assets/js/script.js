
var palette =[
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

var color= {
    'rgb': [133, 42, 244],
    'locked': false
};

console.log(color.lock);

var url = "http://colormind.io/api/";
var data = {
	model : "default",
	input : [[44,43,44],[90,83,82],"N","N","N"]
};

var http = new XMLHttpRequest();

http.onreadystatechange = function() {
	if(http.readyState == 4 && http.status == 200) {
		var palette = JSON.parse(http.responseText).result;
    console.log(palette);
	}
};

http.open("POST", url, true);
http.send(JSON.stringify(data));

// Sets locked to true
// Any function that updates colors will need to check if locked before updating the color
$(".colorBlock").on("click", function() {
    //search for position id
    var position = this.getAttribute("data-color-id") - 1;
    console.log(position);

    palette[position].locked = true;
    console.log(palette[position]);
});