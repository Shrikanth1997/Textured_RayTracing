import { SGNode } from "SGNode"
import { IVertexData } from "%COMMON/IVertexData";
import { Mesh } from "%COMMON/PolygonMesh";
import { ScenegraphRenderer } from "ScenegraphRenderer";
import { mat4, glMatrix, vec3 } from "gl-matrix";
import { Stack } from "%COMMON/Stack";
import { Light } from "%COMMON/Light";
export class Scenegraph<VertexType extends IVertexData> {
    /**
     * The root of the scene graph tree
     */
    protected root: SGNode;

    /**
     * A map to store the (name,mesh) pairs. A map is chosen for efficient search
     */
    protected meshes: Map<string, Mesh.PolygonMesh<VertexType>>;

    /**
     * A map to store the (name,node) pairs. A map is chosen for efficient search
     */
    protected nodes: Map<string, SGNode>;

    protected textures: Map<string, string>;


    public constructor() {
        this.root = null;
        this.meshes = new Map<string, Mesh.PolygonMesh<VertexType>>();
        this.nodes = new Map<string, SGNode>();
        this.textures = new Map<string, string>();
    }


    /**
     * Computes and returns the number of lights in this scene graph
     */

    public getNumLights(): number {
        return this.root.getNumLights();
    }




    /**
     * Set the root of the scenegraph, and then pass a reference to this scene graph object
     * to all its node. This will enable any node to call functions of its associated scene graph
     * @param root
     */
    public makeScenegraph(root: SGNode): void {
        this.root = root;
        this.root.setScenegraph(this);
    }


    public addPolygonMesh(meshName: string, mesh: Mesh.PolygonMesh<VertexType>): void {
        this.meshes.set(meshName, mesh);
    }


    public animate(time: number): void {
        /*    let transform: mat4 = mat4.create();
            mat4.rotate(transform, transform, glMatrix.toRadian(time), vec3.fromValues(0, 1, 0));
            this.nodes.get("box-transform").setAnimationTransform(transform);
    
            transform = mat4.create();
            mat4.rotate(transform, transform, glMatrix.toRadian(30), vec3.fromValues(1, 0, 0));
            mat4.rotate(transform, transform, glMatrix.toRadian(-10 * time), vec3.fromValues(0, 1, 0));
            mat4.translate(transform, transform, vec3.fromValues(100, 0, 0));
            this.nodes.get("aeroplane-transform").setAnimationTransform(transform);
            */

        /*   let transform: mat4 = mat4.create();
           mat4.rotate(transform, transform, glMatrix.toRadian(45 * Math.sin(0.1 * time)), vec3.fromValues(1, 0, 0));
           this.nodes.get("face").setAnimationTransform(transform);
   
           transform = mat4.create();
           mat4.translate(transform, transform, vec3.fromValues(0, 12 + 12 * Math.sin(0.2 * time), 0));
           this.nodes.get("hat").setAnimationTransform(transform);
   */
    }

    public addNode(nodeName: string, node: SGNode): void {
        this.nodes.set(nodeName, node);
    }

    public getRoot(): SGNode {
        return this.root;
    }

    public getPolygonMeshes(): Map<string, Mesh.PolygonMesh<VertexType>> {
        return this.meshes;
    }

    public getTextures(): Map<string, string> {
        return this.textures;
    }

    public getNodes(): Map<string, SGNode> {
        return this.nodes;
    }

    public addTexture(textureName: string, path: string): void {
        this.textures.set(textureName, path);
    }
}