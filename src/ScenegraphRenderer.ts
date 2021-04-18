import { SGNode } from "./SGNode";
import { Stack } from "%COMMON/Stack";
import { mat4 } from "gl-matrix";
import { IVertexData } from "%COMMON/IVertexData";
import { Mesh } from "%COMMON/PolygonMesh";
import { Material } from "%COMMON/Material";
import { Scenegraph } from "./Scenegraph";

export interface ScenegraphRenderer {
    setScenegraph(scenegraph: Scenegraph<IVertexData>): Promise<void>;
    addMesh<K extends IVertexData>(meshName: string, mesh: Mesh.PolygonMesh<K>): void;
    addTexture(name: string, path: string): void;
    draw(modelView: Stack<mat4>): void;
    drawMesh(meshName: string, material: Material, textureName: string, transformation: mat4);
    dispose(): void;
}