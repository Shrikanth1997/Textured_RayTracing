import { IVertexData } from "%COMMON/IVertexData";
import { Mesh } from "%COMMON/PolygonMesh"
import { SGNode } from "SGNode";
import { Stack } from "%COMMON/Stack";
import { mat4, vec4, glMatrix, vec3 } from "gl-matrix";
import { Material } from "%COMMON/Material";
import { Light } from "%COMMON/Light";
import { ScenegraphRenderer } from "./ScenegraphRenderer";
import { Scenegraph } from "./Scenegraph";
import { RTTextureObject } from "./RTTextureObject";
import { Ray } from "./Ray";
import { HitRecord } from "./HitRecord";

/**
 * This is a scene graph renderer implementation that works as a ray tracer.
 * @author Amit Shesh
 */
export class ScenegraphRaytraceRenderer implements ScenegraphRenderer {
    protected textures: Map<string, RTTextureObject>;
    private scenegraph: Scenegraph<IVertexData>;
    private imageData: number[];
    private width: number;
    private height: number;
    private FOV: number;
    private background: vec4;


    public constructor(width: number, height: number, FOV: number, background: vec4) {
        this.textures = new Map<string, RTTextureObject>();
        this.width = width;
        this.height = height;
        this.FOV = FOV;
        this.background = background;
        this.imageData = [];
        for (let i: number = 0; i < 4 * width * height; i++) {
            this.imageData.push(1);
        }
    }

    public setScenegraph(scenegraph: Scenegraph<IVertexData>): Promise<void> {
        return new Promise<void>((resolve) => {
            this.scenegraph = scenegraph;
            let promises: Promise<void>[] = [];
            scenegraph.getTextures().forEach((url: string, name: string, map: Map<string, string>) => {
                promises.push(this.addTexture(name, url));
            });

            Promise.all(promises).then(() => resolve());
        })

    }

    public getImage(): number[] {
        return this.imageData;
    }


    public addMesh<K extends IVertexData>(meshName: string, mesh: Mesh.PolygonMesh<K>): void {
        throw new Error("Operation not supported");
    }

    public addTexture(name: string, path: string): Promise<void> {
        let image: RTTextureObject;
        image = new RTTextureObject(name);
        return image.init(path)
            .then(() => {
                this.textures.set(name, image);
            });
    }

    /**
     * Begin rendering of the scene graph from the root
     * @param root
     * @param modelView
     */
    public draw(modelView: Stack<mat4>): Promise<void> {
        return new Promise<void>((resolve) => {
            let root: SGNode = this.scenegraph.getRoot();
            let lights: Light[] = root.getLights(modelView);
            let rayView: Ray = new Ray();

            rayView.start = vec4.fromValues(0, 0, 0, 1);
            for (let i: number = 0; i < this.height; i++) {
                for (let j = 0; j < this.width; j++) {
                    /*
                     create ray in view coordinates
                     start point: 0,0,0 always!
                     going through near plane pixel (i,j)
                     So 3D location of that pixel in view coordinates is
                     x = j-width/2
                     y = i-height/2
                     z = -0.5*height/tan(FOV/2)
                    */
                    if (i == this.height / 2 && j == this.width / 2) {
                        console.log("here");
                        console.log("here too");
                    }
                    rayView.direction = vec4.fromValues(j - 0.5 * this.width,
                        i - 0.5 * this.height,
                        -0.5 * this.height / Math.tan(glMatrix.toRadian(0.5 * this.FOV)),
                        0.0);

                    
                
                    let color: vec4 = this.raycast(rayView, root, modelView, lights, 0);


                    for (let k: number = 0; k < 3; k++) {
                        this.imageData[4 * (i * this.width + j) + k] = color[k];
                    }
                    //   console.log("x:" + j + ",y:" + i);
                }
            }
            resolve();
        });
    }

    private reflect(v: vec4, n: vec4): vec4 {    
        return vec4.subtract(vec4.create(), v , vec4.scale(vec4.create(), n, 2*vec4.dot(v,n)));
    }

    /*private raycast(rayView: Ray, root: SGNode, modelview: Stack<mat4>, lights: Light[],  bounce: number): vec4 {
        if(bounce<0)
            return this.background;

        let hitR: HitRecord;
        hitR = root.intersect(rayView, modelview);
        let color: vec4 = this.getRaytracedColor(hitR, lights, modelview);
        let colorReflect: vec4 = vec4.fromValues(0,0,0,1);

        if(hitR.intersected()){
            let ref: vec4 = this.reflect(hitR.point, hitR.normal);
            let offset: vec4 = vec4.scale(vec4.create(), ref, 0.001);

            let rayReflect: Ray = new Ray();
            rayReflect.start = vec4.add(vec4.create(), hitR.point, offset);
            rayReflect.direction = ref;

            colorReflect = this.raycast(rayReflect, root, modelview, lights, bounce-1);

            color = vec4.add(vec4.create(), vec4.scale(vec4.create(),color, hitR.material.getAbsorption()), vec4.scale(vec4.create(),colorReflect, hitR.material.getReflection()))
        }

        return color;  
    }*/


    private raycast(rayView: Ray, root: SGNode, modelview: Stack<mat4>, lights: Light[], depth: number): vec4 {
        if(depth > 5)
            return this.background;

        let hitR: HitRecord;
        hitR = root.intersect(rayView, modelview);
        let color: vec4 = this.getRaytracedColor(hitR, lights, modelview);
        let refColor:vec4 = vec4.fromValues(0, 0, 0, 1);

        // Spawn a reflection ray if there is a valid intersection
        if(hitR.intersected())
        {
            let a: number = hitR.material.getAbsorption();
            let r: number = hitR.material.getReflection();

            // If reflection factor is 0, avoid tracing reflection rays and compute only color due to absorption
            if(r != 0)
            {
                let incident: vec4 = vec4.normalize(vec4.create(), vec4.fromValues(hitR.point[0], hitR.point[1], hitR.point[2], 0));
                let normal: vec4 = vec4.normalize(vec4.create(), vec4.fromValues(hitR.normal[0], hitR.normal[1], hitR.normal[2], 0));
                let nDotI: number = vec4.dot(incident, normal);
                //let reflecVec: vec4 = vec4.subtract(vec4.create(), vec4.scale(vec4.create(), normal, 2 * nDotI), incident);
                let reflecVec: vec4 = this.reflect(incident, normal);
                let offset: vec4 = vec4.create();
                offset = vec4.scale(offset, reflecVec, 0.01);

                let refRay: Ray = new Ray();
                refRay.start = vec4.fromValues(hitR.point[0]+offset[0], hitR.point[1]+offset[1], hitR.point[2]+offset[2], 1);
                refRay.direction = vec4.fromValues(reflecVec[0], reflecVec[1], reflecVec[2], 0);
                refColor = this.raycast(refRay, root, modelview, lights, depth+1)
                // Combine shade color and reflection color
                color = vec4.add(color, vec4.scale(vec4.create(), color, a), vec4.scale(vec4.create(), refColor, r));
            }
            else
            {
                color = vec4.scale(vec4.create(), color, a);
            }
        }

        return color;
    }

    private getRaytracedColor(hitRecord: HitRecord, lights: Light[], modelView: Stack<mat4>): vec4 {
        if (hitRecord.intersected()) {
            return this.RTshade(hitRecord.point, hitRecord.normal, hitRecord.material, hitRecord.textureName, hitRecord.texcoord, lights, modelView);
        }
        else {
            return this.background;
        }
    }

    private RTshade(point: vec4, normal: vec4, material: Material,
        textureName: string, texcoord: vec4, lights: Light[], modelView: Stack<mat4>): vec4 {
        let color: vec3 = vec3.fromValues(0, 0, 0);
        let root: SGNode = this.scenegraph.getRoot();

        //lights.forEach((light: Light) => 
        for (let i=0;i<lights.length;i++)
        {
            let lightVec: vec4;
            let lightVec_noNorm: vec4 = vec4.create();
            let spotdirection: vec4 = lights[i].getSpotDirection();
            spotdirection[3] = 0;

            if (vec4.length(spotdirection) > 0) {
                spotdirection = vec4.normalize(spotdirection, spotdirection);
            }

            if (lights[i].getPosition()[3] != 0) {
                lightVec = vec4.subtract(vec4.create(), lights[i].getPosition(), point);
            }
            else {
                lightVec = vec4.negate(vec4.create(), lights[i].getPosition());

            }
            lightVec[3] = 0;
            lightVec_noNorm = vec4.fromValues(lightVec[0], lightVec[1], lightVec[2], 0);
            vec4.normalize(lightVec, lightVec);

            let shadowHit: HitRecord;
            // Create Shadow Ray and call rayCast
            let offset: vec4 = vec4.create();
            let offset_2: vec4 = vec4.create();
            offset = vec4.scale(offset, lightVec_noNorm, 0.01);
            let normalView: vec4 = vec4.normalize(vec4.create(), normal);
            offset_2 = vec4.scale(offset_2, normalView, 0.01);
            let shadowRay: Ray = new Ray();
            //shadowRay.start = vec4.fromValues(point[0]+offset[0]+offset_2[0], point[1]+offset[1]+offset_2[1], point[2]+offset[2]+offset_2[2], 1);
            shadowRay.start = vec4.fromValues(point[0]+offset[0], point[1]+offset[1], point[2]+offset[2], 1);
            shadowRay.direction = vec4.fromValues(lightVec_noNorm[0], lightVec_noNorm[1], lightVec_noNorm[2], 0);

            shadowHit = root.intersect(shadowRay, modelView);
            //shadowHit = this.raycast(shadowRay, root, modelView, lights, 5);

            // if the shadow hits any object and time is within 0 and 1, we move onto next light
            if (shadowHit.intersected())
            {
                if (shadowHit.time > 0 && shadowHit.time < 1)
                {
                    let ambient: vec3 = vec3.mul(vec3.create(), material.getAmbient(), lights[i].getAmbient());
                    color = vec3.add(color, color, ambient);
                    continue;
                }
            }
    
                /* if point is not in the light cone of this light, move on to next light */
            if (vec4.dot(vec4.negate(vec4.create(), lightVec), spotdirection) > Math.cos(glMatrix.toRadian(lights[i].getSpotCutoff()))) 
            {


                let normalView: vec4 = vec4.normalize(vec4.create(), normal);

                let nDotL: number = vec4.dot(normalView, lightVec);

                let viewVec: vec4 = vec4.negate(vec4.create(), point);
                viewVec[3] = 0;
                vec4.normalize(viewVec, viewVec);

                let reflectVec: vec4 = vec4.subtract(vec4.create(), vec4.scale(vec4.create(), normalView, 2 * nDotL), lightVec);
                reflectVec[3] = 0;
                vec4.normalize(reflectVec, reflectVec);

                let rDotV = Math.max(vec4.dot(reflectVec, viewVec), 0.0);

                let ambient: vec3 = vec3.mul(vec3.create(), material.getAmbient(), lights[i].getAmbient());

                let diffuse: vec3 =
                    vec3.scale(vec3.create(),
                        vec3.mul(vec3.create(), material.getDiffuse(), lights[i].getDiffuse()),
                        Math.max(nDotL, 0));
                let specular: vec3;
                if (nDotL > 0) {
                    specular = vec3.scale(vec3.create(),
                        vec3.mul(vec3.create(), material.getSpecular(), lights[i].getSpecular()),
                        Math.pow(rDotV, material.getShininess()));
                }
                else {
                    specular = vec3.create();
                }
                vec3.add(color, color, vec3.add(
                    vec3.create(), vec3.add(
                        vec3.create(), ambient,
                        diffuse),
                    specular));
            }
        }

        for (let i: number = 0; i < 3; i++) {
            color[i] = Math.max(0, Math.min(color[i], 1)); 4
        }

        let actualColor: vec4 = vec4.fromValues(color[0], color[1], color[2], 1);
        //console.log("Color: " + [texcoord[0], texcoord[1]]);
        actualColor = vec4.mul(actualColor, actualColor, vec4.scale(vec4.create(), this.textures.get(textureName).getColor(texcoord[0], texcoord[1]),1/255));


        return actualColor;
    }


    private shade(point: vec4, normal: vec4, material: Material,
        textureName: string, texcoord: vec4, lights: Light[]): vec4 {
        let color: vec3 = vec3.fromValues(0, 0, 0);

        lights.forEach((light: Light) => {
            let lightVec: vec4;
            let spotdirection: vec4 = light.getSpotDirection();
            spotdirection[3] = 0;

            if (vec4.length(spotdirection) > 0) {
                spotdirection = vec4.normalize(spotdirection, spotdirection);
            }

            if (light.getPosition()[3] != 0) {
                lightVec = vec4.subtract(vec4.create(), light.getPosition(), point);
            }
            else {
                lightVec = vec4.negate(vec4.create(), light.getPosition());

            }
            lightVec[3] = 0;
            vec4.normalize(lightVec, lightVec);


            /* if point is not in the light cone of this light, move on to next light */
            if (vec4.dot(vec4.negate(vec4.create(), lightVec), spotdirection) > Math.cos(glMatrix.toRadian(light.getSpotCutoff()))) {


                let normalView: vec4 = vec4.normalize(vec4.create(), normal);

                let nDotL: number = vec4.dot(normalView, lightVec);

                let viewVec: vec4 = vec4.negate(vec4.create(), point);
                viewVec[3] = 0;
                vec4.normalize(viewVec, viewVec);

                let reflectVec: vec4 = vec4.subtract(vec4.create(), vec4.scale(vec4.create(), normalView, 2 * nDotL), lightVec);
                reflectVec[3] = 0;
                vec4.normalize(reflectVec, reflectVec);

                let rDotV = Math.max(vec4.dot(reflectVec, viewVec), 0.0);

                let ambient: vec3 = vec3.mul(vec3.create(), material.getAmbient(), light.getAmbient());

                let diffuse: vec3 =
                    vec3.scale(vec3.create(),
                        vec3.mul(vec3.create(), material.getDiffuse(), light.getDiffuse()),
                        Math.max(nDotL, 0));
                let specular: vec3;
                if (nDotL > 0) {
                    specular = vec3.scale(vec3.create(),
                        vec3.mul(vec3.create(), material.getSpecular(), light.getSpecular()),
                        Math.pow(rDotV, material.getShininess()));
                }
                else {
                    specular = vec3.create();
                }
                vec3.add(color, color, vec3.add(
                    vec3.create(), vec3.add(
                        vec3.create(), ambient,
                        diffuse),
                    specular));
            }
        });

        for (let i: number = 0; i < 3; i++) {
            color[i] = Math.max(0, Math.min(color[i], 1)); 4
        }

        let actualColor: vec4 = vec4.fromValues(color[0], color[1], color[2], 1);
        //console.log("Color: " + [texcoord[0], texcoord[1]]);
        actualColor = vec4.mul(actualColor, actualColor, vec4.scale(vec4.create(), this.textures.get(textureName).getColor(texcoord[0], texcoord[1]),1/255));


        return actualColor;
    }

    public dispose(): void {
    }

    /**
     * Draws a specific mesh.
     * If the mesh has been added to this renderer, it delegates to its correspond mesh renderer
     * This function first passes the material to the shader. Currently it uses the shader variable
     * "vColor" and passes it the ambient part of the material. When lighting is enabled, this 
     * method must be overriden to set the ambient, diffuse, specular, shininess etc. values to the 
     * shader
     * @param name
     * @param material
     * @param transformation
     */
    public drawMesh(meshName: string, material: Material, textureName: string, transformation: mat4): void {
        throw new Error("Operation not supported");

    }
}