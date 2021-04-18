import { mat4, vec4, vec3 } from "gl-matrix"
import { Scenegraph } from "Scenegraph"
import { Stack } from "%COMMON/Stack";
import { ScenegraphRenderer } from "ScenegraphRenderer";
import { Material } from "%COMMON/Material";
import { IVertexData } from "%COMMON/IVertexData";
import { Light } from "%COMMON/Light";
import { Ray } from "./Ray";
import { HitRecord } from "./HitRecord";
/**
 * This class represents a basic node of a scene graph.
 */
export abstract class SGNode {
    /**
      * The name given to this node
    */
    protected name: string;
    /**
     * The parent of this node. Each node except the root has a parent. The root's parent is null
     */
    protected parent: SGNode;
    /**
     * A reference to the {@link sgraph.IScenegraph} object that this is part of
     */
    protected scenegraph: Scenegraph<IVertexData>;

    protected lights: Light[];

    public constructor(graph: Scenegraph<IVertexData>, name: string) {
        this.parent = null;
        this.lights = [];
        this.scenegraph = graph;
        this.setName(name);
    }

    public addLight(l: Light): void {
        this.lights.push(l);
    }

    public getNumLights(): number {
        return this.lights.length;
    }
    public getLights(modelview: Stack<mat4>): Light[] {
        let lights: Light[] = [];

        //first add all lights in this node
        this.lights.forEach((l: Light) => {
            let light: Light = new Light();
            light.setAmbient(l.getAmbient());
            light.setDiffuse(l.getDiffuse());
            light.setSpecular(l.getSpecular());
            light.setSpotAngle(l.getSpotCutoff());
            //transform position and spot direction
            let v: vec4 = l.getPosition();
            vec4.transformMat4(v, v, modelview.peek());
            if (v[3] != 0) {
                light.setPosition([v[0], v[1], v[2]]);
            }
            else {
                light.setDirection([v[0], v[1], v[2]]);
            }
            v = l.getSpotDirection();
            vec4.transformMat4(v, v, modelview.peek());
            light.setSpotDirection(vec3.fromValues(v[0], v[1], v[2]));
            lights.push(light);
        });
        return lights;
    }




    /**
     * By default, this method checks only itself. Nodes that have children should override this
     * method and navigate to children to find the one with the correct name
     * @param name name of node to be searched
     * @return the node whose name this is, null otherwise
     */
    public getNode(name: string): SGNode {
        if (this.name == name) {
            return this;
        }
        return null;
    }

    /**
     * Sets the parent of this node
     * @param parent the node that is to be the parent of this node
     */

    public setParent(parent: SGNode): void {
        this.parent = parent;
    }

    /**
     * Sets the scene graph object whose part this node is and then adds itself
     * to the scenegraph (in case the scene graph ever needs to directly access this node)
     * @param graph a reference to the scenegraph object of which this tree is a part
     */
    public setScenegraph(graph: Scenegraph<IVertexData>): void {
        this.scenegraph = graph;
        graph.addNode(this.name, this);
    }

    /**
     * Sets the name of this node
     * @param name the name of this node
     */
    public setName(name: string): void {
        this.name = name;
    }

    /**
     * Gets the name of this node
     * @return the name of this node
     */
    public getName(): string {
        return this.name;
    }

    /**
   * Intersect the given ray in view coordinates with this node and if it does,
   * populate the supplied HitRecord with pertaining information
   * @param ray
   * @param modelView
   * @param hitRecord
   */
    public abstract intersect(ray: Ray, modelview: Stack<mat4>): HitRecord;
    public abstract draw(context: ScenegraphRenderer, modelView: Stack<mat4>): void;
    public abstract clone(): SGNode;
    public setTransform(transform: mat4): void {
        throw new Error("Not supported");
    }
    public setAnimationTransform(transform: mat4): void {
        throw new Error("Not supported");
    };

    public setMaterial(mat: Material): void {
        throw new Error("Not supported");
    }

    public getMaterial(): Material {
        throw new Error("Not supported");
    }

}