import { vec4 } from "gl-matrix";

export class Ray {
    public start: vec4;
    public direction: vec4;

    public constructor() {
        this.start = vec4.fromValues(0, 0, 0, 1);
        this.direction = vec4.fromValues(0, 0, 0, 0);
    }
}