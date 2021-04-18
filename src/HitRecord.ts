import { vec4 } from "gl-matrix";
import { Material } from "%COMMON/Material";

export class HitRecord {
    public time: number;
    public point: vec4;
    public normal: vec4;
    public material: Material;
    public textureName: string;
    public texcoord: vec4;

    public constructor() {
        this.time = Number.POSITIVE_INFINITY;
        this.point = vec4.fromValues(0, 0, 0, 1);
        this.normal = vec4.fromValues(0, 0, 1, 0);
        this.material = new Material();
        this.textureName = "white";
        this.texcoord = vec4.fromValues(0, 0, 0, 1);
    }

    public intersected(): boolean {
        return this.time < Number.POSITIVE_INFINITY;
    }
}
