import { SGNode } from "./SGNode"
import { Scenegraph } from "./Scenegraph";
import { Material } from "%COMMON/Material";
import { Stack } from "%COMMON/Stack";
import { ScenegraphRenderer } from "./ScenegraphRenderer";
import { mat4, vec4, vec3 } from "gl-matrix";
import { IVertexData } from "%COMMON/IVertexData";
import { Ray } from "./Ray";
import { HitRecord } from "./HitRecord";

/**
 * This node represents the leaf of a scene graph. It is the only type of node that has
 * actual geometry to render.
 * @author Amit Shesh
 */

export class LeafNode extends SGNode {

    /**
      * The name of the object instance that this leaf contains. All object instances are stored
      * in the scene graph itself, so that an instance can be reused in several leaves
      */
    protected meshName: string;
    /**
     * The material associated with the object instance at this leaf
     */
    protected material: Material;

    protected textureName: string;

    public constructor(instanceOf: string, graph: Scenegraph<IVertexData>, name: string) {
        super(graph, name);
        this.meshName = instanceOf;
    }



    /*
	 *Set the material of each vertex in this object
	 */
    public setMaterial(mat: Material): void {
        this.material = mat;
    }

    /**
     * Set texture ID of the texture to be used for this leaf
     * @param name
     */
    public setTextureName(name: string): void {
        this.textureName = name;
    }

    /*
     * gets the material
     */
    public getMaterial(): Material {
        return this.material;
    }

    public clone(): SGNode {
        let newclone: SGNode = new LeafNode(this.meshName, this.scenegraph, this.name);
        newclone.setMaterial(this.getMaterial());
        return newclone;
    }


    /**
     * Delegates to the scene graph for rendering. This has two advantages:
     * <ul>
     *     <li>It keeps the leaf light.</li>
     *     <li>It abstracts the actual drawing to the specific implementation of the scene graph renderer</li>
     * </ul>
     * @param context the generic renderer context {@link sgraph.IScenegraphRenderer}
     * @param modelView the stack of modelview matrices
     * @throws IllegalArgumentException
     */
    public draw(context: ScenegraphRenderer, modelView: Stack<mat4>): void {
        if (this.meshName.length > 0) {
            context.drawMesh(this.meshName, this.material, this.textureName, modelView.peek());
        }
    }

    private getBoxCoord(face: vec4, normal: vec4): vec4{
        let s: number = 0;
        let t: number = 0;
        //console.log("Normal: " + normal);

        if(vec4.equals(face,[0,0,1,0])){
            //console.log("Front");
            /*s = normal[0] + 0.5;
            t = normal[1] + 0.5;*/

            s = 0.25 * (normal[0] + 0.5);
            t = 0.5 * (normal[1] + 0.5) + 0.5;

            return [s,t,0,1];
        }
        else if(vec4.equals(face,[0,1,0,0])){
            //console.log("Top");
            /*s = 0.5 - normal[0];
            t = 0.5 - normal[2];*/

            s = 0.25 * (0.5 - normal[0]) + 0.75;
            t = 0.5 * (0.5 - normal[2]); 

            return [s,t,0,1];
        }
        else if(vec4.equals(face,[1,0,0,0])){
            //console.log("Right");
            /*s = 0.5 - normal[2];
            t = normal[1] + 0.5;*/

            s = 0.25*(0.5-normal[2]) + 0.25;
            t = 0.5*(normal[1]+0.5);

            return [s,t,0,1];
        }
        else if(vec4.equals(face,[-1,0,0,0])){
            //console.log("Left");
            /*s = 0.5 * (normal[2] + 0.5);
            t = normal[1] + 0.5;*/

            s=0.25*(normal[2]+0.5);
            t=0.5*(normal[1]+0.5);

            return [s,t,0,1];
        }
        else if(vec4.equals(face,[0,-1,0,0])){
            //console.log("Bottom");
            /*s = 0.5 - normal[0];
            t = 0.5 + normal[2];*/

            s=0.25*(0.5-normal[0])+0.25;
            t=0.5*(normal[2]+0.5);

            return [s,t,0,1];
        }
        else if(vec4.equals(face,[0,0,-1,0])){
            //console.log("Back");
            /*s = 0.5 - normal[0];
            t = normal[1] + 0.5;*/

            s=0.25*(0.5-normal[0])+0.25;
            t=0.5*(normal[1]-0.5)+0.5;
            
            return [s,t,0,1];
        }
        else
            return vec4.fromValues(0, 0, 0, 1);
    }

    public intersect(rayView: Ray, modelview: Stack<mat4>): HitRecord {
        let pi: number = 3.141592653589793;

        let rayObject: Ray = new Ray();
        let hitRecord: HitRecord = new HitRecord();
        let leafToView: mat4 = mat4.clone(modelview.peek());
        let viewToLeaf: mat4 = mat4.invert(mat4.create(), leafToView);
        let invTranspose: mat4 = mat4.transpose(mat4.create(), viewToLeaf);
        rayObject.start = vec4.clone(rayView.start);
        rayObject.direction = vec4.clone(rayView.direction);

        hitRecord.textureName = this.textureName;

        rayObject.start = vec4.transformMat4(vec4.create(), rayObject.start, viewToLeaf);
        rayObject.direction = vec4.transformMat4(vec4.create(), rayObject.direction, viewToLeaf);
        rayObject.direction[3] = 0;
        if (this.meshName == "sphere") {
            //console.log("In sphere");
            let a: number;
            let b: number;
            let c: number;

            a = vec4.squaredLength(rayObject.direction);
            b = 2 * vec4.dot(rayObject.start, rayObject.direction);
            c = vec4.squaredLength(rayObject.start) - 1 - 1; //extra 1 because start has h=1

            if ((b * b - 4 * a * c) >= 0) {
                let t1: number = (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a);
                let t2: number = (-b - Math.sqrt(b * b - 4 * a * c)) / (2 * a);

                let t: number;
                if (t1 >= 0) {
                    if (t2 >= 0) {
                        t = Math.min(t1, t2);
                    } else {
                        t = t1;
                    }
                } else {
                    if (t2 >= 0)
                        t = t2;
                    else
                        return new HitRecord();
                }

                
                hitRecord.time = t;
                hitRecord.point = vec4.scaleAndAdd(hitRecord.point, rayView.start, rayView.direction, t);
                hitRecord.normal = vec4.scaleAndAdd(hitRecord.normal, rayObject.start, rayObject.direction, t);
                hitRecord.normal[3] = 0;
                hitRecord.normal = vec4.transformMat4(hitRecord.normal, hitRecord.normal, invTranspose);
                hitRecord.normal[3] = 0;
                vec4.normalize(hitRecord.normal, hitRecord.normal);
                
                hitRecord.material = this.material;

                


                let phi: number = Math.asin(-hitRecord.normal[1]);
                let theta: number = Math.atan2(-hitRecord.normal[2], hitRecord.normal[0]);
                //console.log("texture: " + theta + " , " + phi);

                let v: number = 0.5 + phi / (pi);
                let u: number = theta / (2*pi);
                //console.log("texture: " + u + " , " + v);

                hitRecord.texcoord = vec4.fromValues(u, v, 0,1);
            }
            else {
                return new HitRecord();
            }
        } else if (this.meshName == "box") {
            //console.log("In box");
            let tmax: vec3 = vec3.create();
            let tmin: vec3 = vec3.create();

            for (let i: number = 0; i < 3; i++) {
                if (Math.abs(rayObject.direction[i]) < 0.0001) {
                    if ((rayObject.start[i] > 0.5) || (rayObject.start[i] < -0.5)) {
                        return new HitRecord();
                    }
                    else {
                        tmin[i] = Number.NEGATIVE_INFINITY;
                        tmax[i] = Number.POSITIVE_INFINITY;
                    }
                } else {
                    let t1: number = (-0.5 - rayObject.start[i]) / rayObject.direction[i];
                    let t2: number = (0.5 - rayObject.start[i]) / rayObject.direction[i];
                    tmin[i] = Math.min(t1, t2);
                    tmax[i] = Math.max(t1, t2);
                }
            }

            let minimum: number;
            let maximum: number;

            minimum = Math.max(tmin[0], Math.max(tmin[1], tmin[2]));
            maximum = Math.min(tmax[0], Math.min(tmax[1], tmax[2]));

            if ((minimum > maximum) || (maximum < 0)) {
                return new HitRecord();
            }

            if (minimum > 0)
                hitRecord.time = minimum;
            else
                hitRecord.time = maximum;


            hitRecord.point = vec4.scaleAndAdd(hitRecord.point, rayView.start, rayView.direction, hitRecord.time);

            let pointInLeaf: vec4 = vec4.scaleAndAdd(vec4.create(), rayObject.start, rayObject.direction, hitRecord.time);

            for (let i: number = 0; i < 3; i++) {
                if (Math.abs(pointInLeaf[i] - 0.5) < 0.001) {
                    hitRecord.normal[i] = 1;
                } else if (Math.abs(pointInLeaf[i] + 0.5) < 0.001) {
                    hitRecord.normal[i] = -1;
                } else hitRecord.normal[i] = 0;
            }

            let face: vec4 = vec4.copy(vec4.create(), hitRecord.normal);
            

            hitRecord.normal[3] = 0;
            vec4.normalize(hitRecord.normal, hitRecord.normal);
            hitRecord.normal = vec4.transformMat4(hitRecord.normal, hitRecord.normal, invTranspose);
            hitRecord.normal[3] = 0;
            vec4.normalize(hitRecord.normal, hitRecord.normal);
        
            hitRecord.texcoord = this.getBoxCoord(face, pointInLeaf);

            hitRecord.material = this.material;
        }
        else {
            return new HitRecord();
        }


        return hitRecord;
    }

}