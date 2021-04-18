import { Scenegraph } from "./Scenegraph";

import { IVertexData } from "%COMMON/IVertexData";
import { Stack } from "%COMMON/Stack";
import { mat4, vec3, vec4 } from "gl-matrix";
import { ScenegraphRenderer } from "./ScenegraphRenderer";
import { ScenegraphRaytraceRenderer } from "./ScenegraphRaytraceRenderer";


export class RTView {
    private canvas: HTMLCanvasElement;
    private scenegraph: Scenegraph<IVertexData>;
    private renderer: ScenegraphRaytraceRenderer;
    private FOV: number;
    private background: vec4;

    public constructor(FOV: number, background: vec4) {
        this.canvas = <HTMLCanvasElement>document.querySelector("#raytraceCanvas");
        if (!this.canvas) {
            console.log("Failed to retrieve the <canvas> element");
            return;
        }
        //button clicks
        let button: HTMLButtonElement = <HTMLButtonElement>document.querySelector("#savebutton");
        button.addEventListener("click", ev => this.saveCanvas());

        this.FOV = FOV;
        this.background = background;
    }

    public initScenegraph(s: Scenegraph<IVertexData>): void {
        this.scenegraph = s;
    }

    public initRenderer(): Promise<void> {
        let width: number = Number(this.canvas.getAttribute("width"));
        let height: number = Number(this.canvas.getAttribute("height"));
        this.renderer = new ScenegraphRaytraceRenderer(width, height, this.FOV, this.background);
        return this.renderer.setScenegraph(this.scenegraph);
    }

    private saveCanvas(): void {
        let link = document.createElement('a');
        link.href = this.canvas.toDataURL('image/png');
        link.download = "result.png";
        link.click();
    }

    public draw(): void {
        let modelview: Stack<mat4> = new Stack<mat4>();

        modelview.push(mat4.create());
        mat4.lookAt(modelview.peek(), vec3.fromValues(-50, 120, 200), vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));

        this.renderer.draw(modelview).then(() => {
            let data: number[] = this.renderer.getImage();
            this.fillCanvas(data);
        });
    }

    private fillCanvas(data: number[]): void {
        let width: number = Number(this.canvas.getAttribute("width"));
        let height: number = Number(this.canvas.getAttribute("height"));

        if (data.length != 4 * width * height) {
            throw new Error("Data passed is not of the correct size.");
        }
        let imageData: ImageData = this.canvas.getContext('2d').createImageData(width, height);

        for (let i: number = 0; i < height; i++) {
            for (let j: number = 0; j < width; j++) {
                imageData.data[4 * ((height - 1 - i) * width + j)] = data[4 * (i * width + j)] * 255;
                imageData.data[4 * ((height - 1 - i) * width + j) + 1] = data[4 * (i * width + j) + 1] * 255;
                imageData.data[4 * ((height - 1 - i) * width + j) + 2] = data[4 * (i * width + j) + 2] * 255;
                imageData.data[4 * ((height - 1 - i) * width + j) + 3] = data[4 * (i * width + j) + 3] * 255;
            }
        }
        this.canvas.getContext('2d').putImageData(imageData, 0, 0);

        let context: CanvasRenderingContext2D = this.canvas.getContext('2d')
        //        context.fillStyle = 'red';
        //        context.fillRect(100, 100, 200, 100);
    }
}