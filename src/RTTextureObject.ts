import { vec4 } from "gl-matrix";

export class RTTextureObject {
    private data: Uint8ClampedArray;
    private name: string;
    private width: number;
    private height: number;

    public constructor(name: string) {
        this.name = name;
        this.width = 0;
        this.height = 0;
        this.data = null;
    }


    public init(textureURL: string): Promise<void> {
        return new Promise<void>((resolve) => {
            const image = new Image();
            image.src = textureURL;
            image.addEventListener("load", () => {
                //capture raw data
                let canvas: HTMLCanvasElement = document.createElement("canvas");
                let context: CanvasRenderingContext2D = canvas.getContext("2d");
                canvas.width = image.width;
                canvas.height = image.height;
                context.drawImage(image, 0, 0);
                this.data = context.getImageData(0, 0, image.width, image.height).data;
                this.width = canvas.width;
                this.height = canvas.height;
                resolve();
            });
        });
    }

    public getName(): string {
        return this.name;
    }


    /**
     * Get the color at the given location. The location is assumed to be a texture coordinate. When the location exceeds [0,1], we repeat the texture
     * @param x the x coordinate of the location
     * @param y the y coordinate of the location
     */
    public getColor(x: number, y: number): vec4 {
        let x1: number, y1: number, x2: number, y2: number;

        x = x - Math.trunc(x); //REPEAT
        y = y - Math.trunc(y); //REPEAT

        x1 = Math.trunc(x * this.width);
        y1 = Math.trunc(y * this.height);

        x1 = (x1 + this.width) % this.width;
        y1 = (y1 + this.height) % this.height;

        x2 = x1 + 1;
        y2 = y1 + 1;

        if (x2 >= this.width)
            x2 = this.width - 1;

        if (y2 >= this.height)
            y2 = this.height - 1;

        let one: vec4 = this.lookup(x1, y1);
        let two: vec4 = this.lookup(x2, y1);
        let three: vec4 = this.lookup(x1, y2);
        let four: vec4 = this.lookup(x2, y2);

        let inter1: vec4, inter2: vec4, inter3: vec4;

        inter1 = vec4.lerp(vec4.create(), one, three, y - Math.trunc(y));
        inter2 = vec4.lerp(vec4.create(), two, four, y - Math.trunc(y));
        inter3 = vec4.lerp(vec4.create(), inter1, inter2, x - Math.trunc(x));

        return inter3;
    }

    private lookup(x: number, y: number): vec4 {
        return vec4.fromValues(
            this.data[4 * (y * this.width + x)],
            this.data[4 * (y * this.width + x) + 1],
            this.data[4 * (y * this.width + x) + 2],
            this.data[4 * (y * this.width + x) + 3]);
    }
}