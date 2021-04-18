import { IVertexData, VertexProducer } from "%COMMON/IVertexData";
import { vec4 } from "gl-matrix";

/**
 * This class represents the attributes of a single vertex, when the position, normal and texture 
 * coordinate of the vertex is known. It is useful in building PolygonMesh objects for many 
 * examples.
 *
 * It implements the IVertexData interface so that it can be converted into an
 * array of floats, to work with WebGL buffers
 */
export class VertexPNT implements IVertexData {
    private position: vec4;
    private normal: vec4;
    private texcoord: vec4;

    public constructor() {
        this.position = vec4.fromValues(0, 0, 0, 1);
        this.texcoord = vec4.fromValues(0, 0, 0, 1);
    }

    public hasData(attribName: string): boolean {
        switch (attribName) {
            case "position":
            case "normal":
            case "texcoord":
                return true;
            default:
                return false;
        }
    }

    public getData(attribName: string): number[] {
        let result: number[];
        switch (attribName) {
            case "position":
                result = [this.position[0], this.position[1], this.position[2], this.position[3]];
                break;
            case "normal":
                result = [this.normal[0], this.normal[1], this.normal[2], this.normal[3]];
                break;
            case "texcoord":
                result = [this.texcoord[0], this.texcoord[1]];
                break;
            default:
                throw new Error("No attribute: " + attribName + " found!");
        }
        return result;
    }

    public setData(attribName: string, data: number[]): void {
        switch (attribName) {
            case "position":
                this.position = vec4.fromValues(0, 0, 0, 1);
                for (let i: number = 0; i < data.length; i++) {
                    this.position[i] = data[i];
                }
                break;
            case "normal":
                this.normal = vec4.fromValues(0, 0, 0, 0);
                for (let i: number = 0; i < data.length; i++) {
                    this.normal[i] = data[i];
                }
                break;
            case "texcoord":
                this.texcoord = vec4.fromValues(0, 0, 0, 1);
                for (let i: number = 0; i < data.length; i++) {
                    this.texcoord[i] = data[i];
                }
                break;
            default:
                throw new Error("Attribute: " + attribName + " unsupported!");
        }
    }

    public getAllAttributes(): string[] {
        return ["position", "color", "texcoord"];
    }
}

export class VertexPNTProducer implements VertexProducer<VertexPNT> {
    public produce(): VertexPNT {
        return new VertexPNT();
    }
}
