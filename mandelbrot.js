/*
 * Worker, so mandelbrot calculation happens behind the main thread
 * and doesnt prevent the user from toying around between drawings
*/

self.onmessage = msg => {

    let {dimension, center, scale, maxIter} = msg.data;
    
    let img = new ImageData(dimension, dimension);
    function putPixel(x, y, color) { //put a pixel in final img, Color is array [R,G,B,A]
        let pos = y * dimension * 4 + x * 4;
        img.data[pos] = color[0];
        img.data[pos + 1] = color[1];
        img.data[pos + 2] = color[2];
        img.data[pos + 3] = color[3];
    }
    
    function bwHistogram(n) {
        if(n >= 1) return [0,0,0,255];
        
        let shade = n * 255;
        return [shade, shade, shade, 255];
    }
    function blueHistogram(n) {
        if(n >= 1) return [0,0,0,0];

        let shade = n * 255;
        if(n > 0.5) return [shade, shade, 255, 255]; //IF close, fade to white, if not, fade to black
        else return [0, 0, shade, 255];
    }
    
    //reverse scale to match outer canvas
    scale = 1/scale;
    for(let dy = 0; dy <= dimension; dy++) {
        for(let dx = 0; dx <= dimension; dx++) {
            let x_0 = scale * (dx + center.x - dimension/2) * 4/dimension, //map pixel into a 4x4 ([-2,2] per axis) plane scaled and translated, y is flipped to match real coordinate system
                y_0 = scale * -(dy + center.y - dimension/2) * 4/dimension,
                x = 0, y = 0;

            let i = 0;
            while(x*x + y*y < 4 && i < maxIter) {
                let xTemp = x*x - y*y + x_0;
                y = 2*x*y + y_0;
                x = xTemp;
                i++;
            }
            putPixel(dx, dy, bwHistogram(i/maxIter));
        }
    }

    self.postMessage(img);
}