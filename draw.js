// Draw a coordinate system on the canvas element
// Receive the canvas element as a parameter and a array of float data 
// The array of float data is the data to be drawn on abssis
export default function draw(canvas,data) {
    // Get the 2D context for the canvas
    
    var ctx = canvas.getContext("2d");
    var hFont = 15;

    // Set the origin at the bottom-left corner of the canvas
    ctx.translate(0, canvas.height);
    ctx.scale(1, -1);

    // Set the text baseline to the top of the text
    ctx.textBaseline = "bottom";
    ctx.font = `${hFont}px Arial`;

    // Find the minimum and maximum values in the data array
    // var minValue = Math.min.apply(null, data);
    var minValue = 0;
    var maxValue = Math.max.apply(null, data);

    // Calculate the scaling factor for the data values
    var scaleFactor = (canvas.height / (maxValue - minValue)) ;

    // Draw the x-axis with tick marks and labels
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(canvas.width, 0);
    for (var i = 0; i < data.length; i++) {
        var x = i * canvas.width / (data.length - 1);
        var height = (data[i] - minValue) * scaleFactor;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
        ctx.save();
        ctx.translate(x, height);
        ctx.scale(1, -1);
        ctx.rotate(-Math.PI/2); // -pi/2
        if (i === 0) ctx.fillText(data[i], -height/2, hFont);
        if (i !== 0 && i !== data.length - 1) ctx.fillText(data[i], 1, 0);        
        if (i === data.length - 1){
            if (data[i - 1] > 0) ctx.fillText(data[i-1] + ' & ' + (data[i]-data[i-1]) , -height/2, 0)
            else ctx.fillText(data[i], -height/2, 0)
        }
        // i === 0 ? ctx.fillText(data[i], 1, hFont): ctx.fillText(data[i], 1, 0) ;
        ctx.restore();
    }

    // Draw the y-axis
    // ctx.beginPath();
    ctx.moveTo(0, 0);
    // ctx.lineTo(0, canvas.height);
    ctx.stroke();
}