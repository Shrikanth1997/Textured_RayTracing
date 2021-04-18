import { vec4, mat4, vec3, glMatrix } from "gl-matrix";
import * as WebGLUtils from "%COMMON/WebGLUtils";
import { Features } from "./Controller";
import { Stack } from "%COMMON/Stack"
import { Scenegraph } from "./Scenegraph";
import { VertexPNT, VertexPNTProducer } from "./VertexPNT";
import { ShaderLocationsVault } from "%COMMON/ShaderLocationsVault";
import { Light } from "%COMMON/Light"
import { ScenegraphRenderer } from "./ScenegraphRenderer";
import { ScenegraphJSONImporter } from "./ScenegraphJSONImporter"
import { ScenegraphWebGLRenderer } from "./ScenegraphWebGLRenderer";
import { IVertexData } from "%COMMON/IVertexData";



/**
 * This class encapsulates the "view", where all of our WebGL code resides. This class, for now, also stores all the relevant data that is used to draw. This can be replaced with a more formal Model-View-Controller architecture with a bigger application.
 */


export class View {
  //the webgl rendering context. All WebGL functions will be called on this object
  private gl: WebGLRenderingContext;
  //an object that represents a WebGL shader
  private shaderProgram: WebGLProgram;

  //a projection matrix, that encapsulates how what we draw corresponds to what is seen
  private proj: mat4;

  //a modelview matrix, that encapsulates all the transformations applied to our object
  private modelview: Stack<mat4>;

  private scenegraph: Scenegraph<VertexPNT>;
  private renderer: ScenegraphRenderer;
  private shaderLocations: ShaderLocationsVault;

  private time: number;

  constructor(gl: WebGLRenderingContext, FOV: number, background: vec4) {
    this.gl = gl;
    this.time = 0;
    this.modelview = new Stack<mat4>();
    this.scenegraph = null;
    //set the clear color
    this.gl.clearColor(background[0], background[1], background[2], background[3]);


    //Our quad is in the range (-100,100) in X and Y, in the "virtual world" that we are drawing. We must specify what part of this virtual world must be drawn. We do this via a projection matrix, set up as below. In this case, we are going to render the part of the virtual world that is inside a square from (-200,-200) to (200,200). Since we are drawing only 2D, the last two arguments are not useful. The default Z-value chosen is 0, which means we only specify the last two numbers such that 0 is within their range (in this case we have specified them as (-100,100))
    //this.proj = mat4.ortho(mat4.create(), -60, 60, -100, 100, 0.1, 10000);
    this.proj = mat4.perspective(mat4.create(), glMatrix.toRadian(FOV), 1, 0.1, 10000);

    //this.proj = mat4.perspective(this.proj, glMatrix.toRadian(60), 1, 0.1, 10000);

    //We must also specify "where" the above part of the virtual world will be shown on the actual canvas on screen. This part of the screen where the above drawing gets pasted is called the "viewport", which we set here. The origin of the viewport is left,bottom. In this case we want it to span the entire canvas, so we start at (0,0) with a width and height of 400 each (matching the dimensions of the canvas specified in HTML)
    this.gl.viewport(0, 0, 400, 400);
  }

  public getNumLights(): number {
    return this.scenegraph.getNumLights();
  }

  public initShaders(vShaderSource: string, fShaderSource: string) {
    //create and set up the shader
    this.shaderProgram = WebGLUtils.createShaderProgram(this.gl, vShaderSource, fShaderSource);
    //enable the current program
    this.gl.useProgram(this.shaderProgram);

    this.shaderLocations = new ShaderLocationsVault(this.gl, this.shaderProgram);

  }

  public initRenderer(): Promise<void> {
    let shaderVarsToVertexAttribs: Map<string, string> = new Map<string, string>();
    shaderVarsToVertexAttribs.set("vPosition", "position");
    shaderVarsToVertexAttribs.set("vNormal", "normal");
    shaderVarsToVertexAttribs.set("vTexCoord", "texcoord");
    this.renderer = new ScenegraphWebGLRenderer(this.gl, this.shaderLocations, shaderVarsToVertexAttribs);
    return this.renderer.setScenegraph(this.scenegraph);
  }

  public initScenegraph(s: Scenegraph<VertexPNT>): void {
    this.scenegraph = s;
  }

  public draw(): void {

    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.gl.enable(this.gl.DEPTH_TEST);

    if (this.scenegraph == null) {
      return;
    }

    this.gl.useProgram(this.shaderProgram);

    while (!this.modelview.isEmpty())
      this.modelview.pop();

    /*
     *In order to change the shape of this triangle, we can either move the vertex positions above, or "transform" them
     * We use a modelview matrix to store the transformations to be applied to our triangle.
     * Right now this matrix is identity, which means "no transformations"
     */
    this.modelview.push(mat4.create());
    mat4.lookAt(this.modelview.peek(), vec3.fromValues(-50, 120, 200), vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));


    this.gl.uniformMatrix4fv(this.shaderLocations.getUniformLocation("projection"), false, this.proj);



    this.renderer.draw(this.modelview);
  }

  public freeMeshes(): void {
    this.renderer.dispose();
  }

  public setFeatures(features: Features): void {
  }


  private face(): string {
    return `
    {
      "instances": [
        {
          "name": "sphere",
          "path": "models/sphere.obj"
        },
        {
          "name": "box",
          "path": "models/box.obj"
        },
        {
          "name": "cylinder",
          "path": "models/cylinder.obj"
        },
        {
          "name": "cone",
          "path": "models/cone.obj"
        }
      ],
      "images": [
        {
          "name": "checkerboard",
          "path": "textures/checkerboard.png"
        },
        {
          "name": "earth",
          "path": "textures/earthmap.png"
        },
        {
          "name": "white",
          "path": "textures/white.png"
        }
      ],
      "root": {
        "type": "group",
        "name": "Root of scene graph",
        "lights": [
          {
            "ambient": [
              0.8,
              0.8,
              0.8
            ],
            "diffuse": [
              0.8,
              0.8,
              0.8
            ],
            "specular": [
              0.8,
              0.8,
              0.8
            ],
            "position": [
              0.0,
              100.0,
              0.0,
              1.0
            ],
            "spotdirection": [
              0.0,
              -1.0,
              0.0,
              0.0
            ],
            "spotcutoff": 25.0
          }
        ],
        "children": [
          {
            "type": "transform",
            "transform": [
              {
                "scale": [
                  200.0,
                  5.0,
                  200.0
                ]
              }
            ],
            "child": {
              "type": "object",
              "instanceof": "box",
              "material": {
                "ambient": [
                  0.2,
                  0.2,
                  0.2,
                  1.0
                ],
                "diffuse": [
                  0.8,
                  0.8,
                  0.8,
                  1.0
                ],
                "specular": [
                  0.8,
                  0.8,
                  0.8,
                  1.0
                ],
                "emission": [
                  0.0,
                  0.0,
                  0.0,
                  1.0
                ],
                "shininess": 100.0,
                "absorption": 1.0,
                "reflection": 0.0,
                "transparency": 0.0,
                "refractive_index": 0.0
              }
            }
          },
          {
            "type": "transform",
            "transform": [
              {
                "translate": [
                  0.0,
                  25.0,
                  0.0
                ]
              }
            ],
            "child": {
              "type": "group",
              "name": "face",
              "children": [
                {
                  "type": "transform",
                  "name": "actualface",
                  "lights": [
                    {
                      "ambient": [
                        0.4,
                        0.4,
                        0.4
                      ],
                      "diffuse": [
                        0.4,
                        0.4,
                        0.4
                      ],
                      "specular": [
                        0.4,
                        0.4,
                        0.4
                      ],
                      "position": [
                        0.0,
                        100.0,
                        100.0,
                        1.0
                      ],
                      "spotdirection": [
                        0.0,
                        0.0,
                        1.0,
                        0.0
                      ],
                      "spotcutoff": 180.0
                    }
                  ],
                  "transform": [
                    {
                      "scale": [
                        20.0,
                        25.0,
                        20.0
                      ]
                    }
                  ],
                  "child": {
                    "type": "object",
                    "instanceof": "sphere",
                    "texture": "earth",
                    "material": {
                      "ambient": [
                        0.2,
                        0.2,
                        0.1,
                        1.0
                      ],
                      "diffuse": [
                        0.8,
                        0.8,
                        0.6,
                        1.0
                      ],
                      "specular": [
                        0.8,
                        0.8,
                        0.6,
                        1.0
                      ],
                      "emission": [
                        0.0,
                        0.0,
                        0.0,
                        1.0
                      ],
                      "shininess": 100.0,
                      "absorption": 1.0,
                      "reflection": 0.0,
                      "transparency": 0.0,
                      "refractive_index": 0.0
                    }
                  }
                },
                {
                  "type": "transform",
                  "name": "lefteye",
                  "transform": [
                    {
                      "translate": [
                        7.0,
                        15.0,
                        12.0
                      ]
                    },
                    {
                      "scale": [
                        3.0,
                        4.0,
                        3.0
                      ]
                    }
                  ],
                  "child": {
                    "type": "object",
                    "instanceof": "sphere",
                    "material": {
                      "ambient": [
                        0.1,
                        0.1,
                        0.1,
                        1.0
                      ],
                      "diffuse": [
                        0.2,
                        0.2,
                        0.2,
                        1.0
                      ],
                      "specular": [
                        0.9,
                        0.9,
                        0.9,
                        1.0
                      ],
                      "emission": [
                        0.0,
                        0.0,
                        0.0,
                        1.0
                      ],
                      "shininess": 100.0,
                      "absorption": 1.0,
                      "reflection": 0.0,
                      "transparency": 0.0,
                      "refractive_index": 0.0
                    }
                  }
                },
                {
                  "type": "transform",
                  "name": "righteye",
                  "transform": [
                    {
                      "translate": [
                        -7.0,
                        15.0,
                        12.0
                      ]
                    },
                    {
                      "scale": [
                        3.0,
                        4.0,
                        3.0
                      ]
                    }
                  ],
                  "child": {
                    "type": "object",
                    "instanceof": "sphere",
                    "material": {
                      "ambient": [
                        0.1,
                        0.1,
                        0.1,
                        1.0
                      ],
                      "diffuse": [
                        0.2,
                        0.2,
                        0.2,
                        1.0
                      ],
                      "specular": [
                        0.9,
                        0.9,
                        0.9,
                        1.0
                      ],
                      "emission": [
                        0.0,
                        0.0,
                        0.0,
                        1.0
                      ],
                      "shininess": 100.0,
                      "absorption": 1.0,
                      "reflection": 0.0,
                      "transparency": 0.0,
                      "refractive_index": 0.0
                    }
                  }
                },
                {
                  "type": "transform",
                  "name": "nose",
                  "transform": [
                    {
                      "translate": [
                        0.0,
                        10.0,
                        10.0
                      ]
                    },
                    {
                      "rotate": [
                        90.0,
                        1.0,
                        0.0,
                        0.0
                      ]
                    },
                    {
                      "scale": [
                        5.0,
                        20.0,
                        5.0
                      ]
                    }
                  ],
                  "child": {
                    "type": "object",
                    "instanceof": "cylinder",
                    "material": {
                      "ambient": [
                        0.2,
                        0.0,
                        0.0,
                        1.0
                      ],
                      "diffuse": [
                        0.8,
                        0.0,
                        0.0,
                        1.0
                      ],
                      "specular": [
                        0.8,
                        0.0,
                        0.0,
                        1.0
                      ],
                      "emission": [
                        0.0,
                        0.0,
                        0.0,
                        1.0
                      ],
                      "shininess": 100.0,
                      "absorption": 1.0,
                      "reflection": 0.0,
                      "transparency": 0.0,
                      "refractive_index": 0.0
                    }
                  }
                },
                {
                  "type": "transform",
                  "name": "hat",
                  "transform": [
                    {
                      "translate": [
                        0.0,
                        20.0,
                        0.0
                      ]
                    },
                    {
                      "scale": [
                        10.0,
                        25.0,
                        10.0
                      ]
                    }
                  ],
                  "child": {
                    "type": "object",
                    "instanceof": "cone",
                    "texture": "checkerboard",
                    "material": {
                      "ambient": [
                        0.1,
                        0.0,
                        0.1,
                        1.0
                      ],
                      "diffuse": [
                        0.8,
                        0.0,
                        0.8,
                        1.0
                      ],
                      "specular": [
                        0.8,
                        0.0,
                        0.8,
                        1.0
                      ],
                      "emission": [
                        0.0,
                        0.0,
                        0.0,
                        1.0
                      ],
                      "shininess": 100.0,
                      "absorption": 1.0,
                      "reflection": 0.0,
                      "transparency": 0.0,
                      "refractive_index": 0.0
                    }
                  }
                }
              ]
            }
          }
        ]
      }
    }
    
    
    `;
  }

  //a JSON representation of a jack-in-the-box
  private json2(): string {
    return `
        {
            "instances": [
                {
                    "name":"sphere",
                    "path":"models/sphere.obj"
                },
                {
                    "name":"box",
                    "path":"models/box.obj"
                },
                {
                    "name":"cylinder",
                    "path":"models/cylinder.obj"
                },
                {
                    "name":"cone",
                    "path":"models/cone.obj"
                }
            ],
            "root": {
                "type":"group",
                "children":[
                {
                    "type":"transform",
                    "transform":[
                        {"scale":[50,5,50]}
                    ],
                    "child": {
                        "type":"object",
                        "instanceof":"box",
                        "material": {
                            "color":[0.5,0.5,0.5]
                        }
                    }
                },
                {
                    "type":"transform",
                    "name":"face",
                    "transform":[
                        {"translate":[0,25,0]}
                    ],        
                    "child": {
                        "type":"group",
                        "children": [
                            {
                                "type":"transform",
                                "name":"actualface",
                                "transform":[
                                    {"scale":[20,25,20]}
                                ],
                                "child": {
                                    "type":"object",
                                    "instanceof":"sphere",
                                    "material": {
                                        "color":[1,1,0.8]
                                    }
                                }
                            },
                            {
                                "type":"transform",
                                "name":"lefteye",
                                "transform":[
                                    {"translate":[7,15,12]},
                                    {"scale":[3,4,3]}
                                ],
                                "child": {
                                    "type":"object",
                                    "instanceof":"sphere",
                                    "material": {
                                        "color":[0,0,0]
                                    }
                                }
                            },
                            {
                                "type":"transform",
                                "name":"righteye",
                                "transform":[
                                    {"translate":[-7,15,12]},
                                    {"scale":[3,4,3]}
                                ],
                                "child": {
                                    "type":"object",
                                    "instanceof":"sphere",
                                    "material": {
                                        "color":[0,0,0]
                                    }
                                }
                            },
                            {
                                "type":"transform",
                                "name":"nose",
                                "transform":[
                                    {"translate":[0,10,10]},
                                    {"rotate":[90,1,0,0]},
                                    {"scale":[5,20,5]}
                                ],
                                "child": {
                                    "type":"object",
                                    "instanceof":"cylinder",
                                    "material": {
                                        "color":[1,0,0]
                                    }
                                }
                            },
                            {
                                "type":"transform",
                                "name":"hat",
                                "transform":[
                                    {"translate":[0,20,0]},
                                    {"scale":[10,25,10]}
                                ],
                                "child": {
                                    "type":"object",
                                    "instanceof":"cone",
                                    "material": {
                                        "color":[1,0,1]
                                    }
                                }
                            }
                        ]
                    }
                }]
            }
        }
        `;

  }

  private humanoid(): string {
    return `
        {
            "scaleinstances": "false",
            "instances": [
              {
                "name": "sphere",
                "path": "models/sphere.obj"
              },
              {
                "name": "box",
                "path": "models/box.obj"
              },
              {
                "name": "cylinder",
                "path": "models/cylinder.obj"
              },
              {
                "name": "cone",
                "path": "models/cone.obj"
              }
            ],
            "root": {
              "type": "group",
              "name": "Root of scene graph",
              "children": [
                {
                  "type": "transform",
                  "transform": [
                    {
                      "translate": [
                        0.0,
                        -36.0,
                        0.0
                      ]
                    },
                    {
                      "scale": [
                        72.0,
                        72.0,
                        72.0
                      ]
                    }
                  ],
                  "child": {
                    "type": "group",
                    "name": "unit-height-humanoid",
                    "children": [
                      {
                        "type": "transform",
                        "transform": [
                          {
                            "scale": [
                              0.0125,
                              0.0125,
                              0.0125
                            ]
                          }
                        ],
                        "child": {
                          "type": "group",
                          "children": [
                            {
                              "type": "group",
                              "name": "lowerbody",
                              "children": [
                                {
                                  "type": "transform",
                                  "name": "leftleg",
                                  "transform": [
                                    {
                                      "translate": [
                                        5.0,
                                        0.0,
                                        0.0
                                      ]
                                    }
                                  ],
                                  "child": {
                                    "type": "group",
                                    "name": "leg",
                                    "children": [
                                      {
                                        "type": "transform",
                                        "name": "shin",
                                        "transform": [
                                          {
                                            "scale": [
                                              1.0,
                                              20.0,
                                              1.0
                                            ]
                                          }
                                        ],
                                        "child": {
                                          "type": "object",
                                          "instanceof": "cylinder",
                                          "material": {
                                            "color": [
                                              1.0,
                                              0.0,
                                              0.0
                                            ]
                                          }
                                        }
                                      },
                                      {
                                        "type": "transform",
                                        "transform": [
                                          {
                                            "translate": [
                                              0.0,
                                              21.0,
                                              0.0
                                            ]
                                          }
                                        ],
                                        "child": {
                                          "type": "transform",
                                          "name": "knee",
                                          "transform": [
                                            {
                                              "scale": [
                                                2.0,
                                                2.0,
                                                2.0
                                              ]
                                            }
                                          ],
                                          "child": {
                                            "type": "object",
                                            "instanceof": "sphere",
                                            "material": {
                                              "color": [
                                                0.0,
                                                1.0,
                                                0.0
                                              ]
                                            }
                                          }
                                        }
                                      },
                                      {
                                        "type": "transform",
                                        "transform": [
                                          {
                                            "translate": [
                                              0.0,
                                              22.0,
                                              0.0
                                            ]
                                          }
                                        ],
                                        "child": {
                                          "type": "transform",
                                          "name": "thigh",
                                          "transform": [
                                            {
                                              "scale": [
                                                1.0,
                                                20.0,
                                                1.0
                                              ]
                                            }
                                          ],
                                          "child": {
                                            "type": "object",
                                            "instanceof": "cylinder",
                                            "material": {
                                              "color": [
                                                1.0,
                                                0.0,
                                                0.0
                                              ]
                                            }
                                          }
                                        }
                                      },
                                      {
                                        "type": "transform",
                                        "transform": [
                                          {
                                            "translate": [
                                              0.0,
                                              42.0,
                                              0.0
                                            ]
                                          }
                                        ],
                                        "child": {
                                          "type": "transform",
                                          "name": "hip",
                                          "transform": [
                                            {
                                              "scale": [
                                                2.0,
                                                2.0,
                                                2.0
                                              ]
                                            }
                                          ],
                                          "child": {
                                            "type": "object",
                                            "instanceof": "sphere",
                                            "material": {
                                              "color": [
                                                0.0,
                                                1.0,
                                                0.0
                                              ]
                                            }
                                          }
                                        }
                                      }
                                    ]
                                  }
                                },
                                {
                                  "type": "transform",
                                  "name": "rightleg",
                                  "transform": [
                                    {
                                      "translate": [
                                        -5.0,
                                        0.0,
                                        0.0
                                      ]
                                    }
                                  ],
                                  "child": {
                                    "type": "group",
                                    "children": [
                                      {
                                        "type": "transform",
                                        "name": "shin",
                                        "transform": [
                                          {
                                            "scale": [
                                              1.0,
                                              20.0,
                                              1.0
                                            ]
                                          }
                                        ],
                                        "child": {
                                          "type": "object",
                                          "instanceof": "cylinder",
                                          "material": {
                                            "color": [
                                              1.0,
                                              0.0,
                                              0.0
                                            ]
                                          }
                                        }
                                      },
                                      {
                                        "type": "transform",
                                        "transform": [
                                          {
                                            "translate": [
                                              0.0,
                                              21.0,
                                              0.0
                                            ]
                                          }
                                        ],
                                        "child": {
                                          "type": "transform",
                                          "name": "knee",
                                          "transform": [
                                            {
                                              "scale": [
                                                2.0,
                                                2.0,
                                                2.0
                                              ]
                                            }
                                          ],
                                          "child": {
                                            "type": "object",
                                            "instanceof": "sphere",
                                            "material": {
                                              "color": [
                                                0.0,
                                                1.0,
                                                0.0
                                              ]
                                            }
                                          }
                                        }
                                      },
                                      {
                                        "type": "transform",
                                        "transform": [
                                          {
                                            "translate": [
                                              0.0,
                                              22.0,
                                              0.0
                                            ]
                                          }
                                        ],
                                        "child": {
                                          "type": "transform",
                                          "name": "thigh",
                                          "transform": [
                                            {
                                              "scale": [
                                                1.0,
                                                20.0,
                                                1.0
                                              ]
                                            }
                                          ],
                                          "child": {
                                            "type": "object",
                                            "instanceof": "cylinder",
                                            "material": {
                                              "color": [
                                                1.0,
                                                0.0,
                                                0.0
                                              ]
                                            }
                                          }
                                        }
                                      },
                                      {
                                        "type": "transform",
                                        "transform": [
                                          {
                                            "translate": [
                                              0.0,
                                              42.0,
                                              0.0
                                            ]
                                          }
                                        ],
                                        "child": {
                                          "type": "transform",
                                          "name": "hip",
                                          "transform": [
                                            {
                                              "scale": [
                                                2.0,
                                                2.0,
                                                2.0
                                              ]
                                            }
                                          ],
                                          "child": {
                                            "type": "object",
                                            "instanceof": "sphere",
                                            "material": {
                                              "color": [
                                                0.0,
                                                1.0,
                                                0.0
                                              ]
                                            }
                                          }
                                        }
                                      }
                                    ]
                                  }
                                }
                              ]
                            },
                            {
                              "type": "group",
                              "name": "upperbody",
                              "children": [
                                {
                                  "type": "transform",
                                  "transform": [
                                    {
                                      "translate": [
                                        0.0,
                                        42.0,
                                        0.0
                                      ]
                                    }
                                  ],
                                  "child": {
                                    "type": "group",
                                    "children": [
                                      {
                                        "type": "transform",
                                        "name": "pelvis",
                                        "transform": [
                                          {
                                            "translate": [
                                              5.0,
                                              0.0,
                                              0.0
                                            ]
                                          },
                                          {
                                            "rotate": [
                                              90.0,
                                              0.0,
                                              0.0,
                                              1.0
                                            ]
                                          },
                                          {
                                            "scale": [
                                              1.0,
                                              10.0,
                                              1.0
                                            ]
                                          }
                                        ],
                                        "child": {
                                          "type": "object",
                                          "instanceof": "cylinder",
                                          "material": {
                                            "color": [
                                              1.0,
                                              1.0,
                                              0.0
                                            ]
                                          }
                                        }
                                      },
                                      {
                                        "type": "transform",
                                        "name": "torso",
                                        "transform": [
                                          {
                                            "translate": [
                                              0.0,
                                              2.0,
                                              0.0
                                            ]
                                          },
                                          {
                                            "scale": [
                                              1.0,
                                              25.0,
                                              1.0
                                            ]
                                          }
                                        ],
                                        "child": {
                                          "type": "object",
                                          "instanceof": "cylinder",
                                          "material": {
                                            "color": [
                                              0.0,
                                              1.0,
                                              0.0
                                            ]
                                          }
                                        }
                                      },
                                      {
                                        "type": "transform",
                                        "name": "shoulder",
                                        "transform": [
                                          {
                                            "translate": [
                                              10.0,
                                              27.0,
                                              0.0
                                            ]
                                          },
                                          {
                                            "rotate": [
                                              90.0,
                                              0.0,
                                              0.0,
                                              1.0
                                            ]
                                          },
                                          {
                                            "scale": [
                                              1.0,
                                              20.0,
                                              1.0
                                            ]
                                          }
                                        ],
                                        "child": {
                                          "type": "object",
                                          "instanceof": "cylinder",
                                          "material": {
                                            "color": [
                                              1.0,
                                              1.0,
                                              0.0
                                            ]
                                          }
                                        }
                                      },
                                      {
                                        "type": "transform",
                                        "name": "lefthand",
                                        "transform": [
                                          {
                                            "translate": [
                                              10.0,
                                              27.0,
                                              0.0
                                            ]
                                          }
                                        ],
                                        "child": {
                                          "type": "transform",
                                          "transform": [
                                            {
                                              "translate": [
                                                0,
                                                0,
                                                0
                                              ]
                                            }
                                          ],
                                          "child": {
                                            "type": "group",
                                            "children": [
                                              {
                                                "type": "transform",
                                                "transform": [
                                                  {
                                                    "translate": [
                                                      0.0,
                                                      -10.0,
                                                      0.0
                                                    ]
                                                  }
                                                ],
                                                "child": {
                                                  "type": "transform",
                                                  "name": "arm",
                                                  "transform": [
                                                    {
                                                      "scale": [
                                                        1.0,
                                                        10.0,
                                                        1.0
                                                      ]
                                                    }
                                                  ],
                                                  "child": {
                                                    "type": "object",
                                                    "instanceof": "cylinder",
                                                    "material": {
                                                      "color": [
                                                        1.0,
                                                        0.0,
                                                        0.0
                                                      ]
                                                    }
                                                  }
                                                }
                                              },
                                              {
                                                "type": "transform",
                                                "transform": [
                                                  {
                                                    "translate": [
                                                      0.0,
                                                      -11.0,
                                                      0.0
                                                    ]
                                                  }
                                                ],
                                                "child": {
                                                  "type": "transform",
                                                  "name": "leftelbow",
                                                  "transform": [
                                                    {
                                                      "scale": [
                                                        2.0,
                                                        2.0,
                                                        2.0
                                                      ]
                                                    }
                                                  ],
                                                  "child": {
                                                    "type": "object",
                                                    "instanceof": "sphere",
                                                    "material": {
                                                      "color": [
                                                        0.0,
                                                        1.0,
                                                        0.0
                                                      ]
                                                    }
                                                  }
                                                }
                                              },
                                              {
                                                "type": "transform",
                                                "transform": [
                                                  {
                                                    "translate": [
                                                      0.0,
                                                      -12.0,
                                                      0.0
                                                    ]
                                                  }
                                                ],
                                                "child": {
                                                  "type": "transform",
                                                  "name": "leftforearm",
                                                  "transform": [
                                                    {
                                                      "translate": [
                                                        0.0,
                                                        -10.0,
                                                        0.0
                                                      ]
                                                    },
                                                    {
                                                      "scale": [
                                                        1.0,
                                                        10.0,
                                                        1.0
                                                      ]
                                                    }
                                                  ],
                                                  "child": {
                                                    "type": "object",
                                                    "instanceof": "cylinder",
                                                    "material": {
                                                      "color": [
                                                        1.0,
                                                        0.0,
                                                        1.0
                                                      ]
                                                    }
                                                  }
                                                }
                                              }
                                            ]
                                          }
                                        }
                                      },
                                      {
                                        "type": "transform",
                                        "name": "righthand",
                                        "transform": [
                                          {
                                            "translate": [
                                              -10.0,
                                              27.0,
                                              0.0
                                            ]
                                          }
                                        ],
                                        "child": {
                                          "type": "transform",
                                          "name": "righthand",
                                          "transform": [
                                            {
                                              "translate": [
                                                0,
                                                0,
                                                0
                                              ]
                                            }
                                          ],
                                          "child": {
                                            "type": "group",
                                            "children": [
                                              {
                                                "type": "transform",
                                                "transform": [
                                                  {
                                                    "translate": [
                                                      0.0,
                                                      -10.0,
                                                      0.0
                                                    ]
                                                  }
                                                ],
                                                "child": {
                                                  "type": "transform",
                                                  "name": "rightarm",
                                                  "transform": [
                                                    {
                                                      "scale": [
                                                        1.0,
                                                        10.0,
                                                        1.0
                                                      ]
                                                    }
                                                  ],
                                                  "child": {
                                                    "type": "object",
                                                    "instanceof": "cylinder",
                                                    "material": {
                                                      "color": [
                                                        1.0,
                                                        0.0,
                                                        0.0
                                                      ]
                                                    }
                                                  }
                                                }
                                              },
                                              {
                                                "type": "transform",
                                                "transform": [
                                                  {
                                                    "translate": [
                                                      0.0,
                                                      -11.0,
                                                      0.0
                                                    ]
                                                  }
                                                ],
                                                "child": {
                                                  "type": "transform",
                                                  "name": "rightelbow",
                                                  "transform": [
                                                    {
                                                      "scale": [
                                                        2.0,
                                                        2.0,
                                                        2.0
                                                      ]
                                                    }
                                                  ],
                                                  "child": {
                                                    "type": "object",
                                                    "instanceof": "sphere",
                                                    "material": {
                                                      "color": [
                                                        0.0,
                                                        1.0,
                                                        0.0
                                                      ]
                                                    }
                                                  }
                                                }
                                              },
                                              {
                                                "type": "transform",
                                                "transform": [
                                                  {
                                                    "translate": [
                                                      0.0,
                                                      -12.0,
                                                      0.0
                                                    ]
                                                  }
                                                ],
                                                "child": {
                                                  "type": "transform",
                                                  "name": "rightforearm",
                                                  "transform": [
                                                    {
                                                      "translate": [
                                                        0.0,
                                                        -10.0,
                                                        0.0
                                                      ]
                                                    },
                                                    {
                                                      "scale": [
                                                        1.0,
                                                        10.0,
                                                        1.0
                                                      ]
                                                    }
                                                  ],
                                                  "child": {
                                                    "type": "object",
                                                    "instanceof": "cylinder",
                                                    "material": {
                                                      "color": [
                                                        1.0,
                                                        0.0,
                                                        1.0
                                                      ]
                                                    }
                                                  }
                                                }
                                              }
                                            ]
                                          }
                                        }
                                      }
                                    ]
                                  }
                                }
                              ]
                            },
                            {
                              "type": "group",
                              "name": "headneck",
                              "children": [
                                {
                                  "type": "transform",
                                  "transform": [
                                    {
                                      "translate": [
                                        0.0,
                                        70.0,
                                        0.0
                                      ]
                                    }
                                  ],
                                  "child": {
                                    "type": "group",
                                    "children": [
                                      {
                                        "type": "transform",
                                        "name": "neck",
                                        "transform": [
                                          {
                                            "scale": [
                                              1.0,
                                              5.0,
                                              1.0
                                            ]
                                          }
                                        ],
                                        "child": {
                                          "type": "object",
                                          "instanceof": "cylinder",
                                          "material": {
                                            "color": [
                                              1.0,
                                              0.0,
                                              0.0
                                            ]
                                          }
                                        }
                                      },
                                      {
                                        "type": "transform",
                                        "name": "head",
                                        "transform": [
                                          {
                                            "translate": [
                                              0.0,
                                              8.0,
                                              0.0
                                            ]
                                          },
                                          {
                                            "scale": [
                                              3.2,
                                              3.5,
                                              3.2
                                            ]
                                          }
                                        ],
                                        "child": {
                                          "type": "object",
                                          "instanceof": "sphere",
                                          "material": {
                                            "color": [
                                              1.0,
                                              1.0,
                                              0.0
                                            ]
                                          }
                                        }
                                      }
                                    ]
                                  }
                                }
                              ]
                            }
                          ]
                        }
                      }
                    ]
                  }
                }
              ]
            }
          }
                
        `
  }

  //a JSON representation of a simple scene graph
  private json(): string {
    return `
        {
            "instances": [
            {
                "name": "box",
                "path": "models/box.obj"
            },
            {
                "name": "aeroplane",
                "path": "models/aeroplane.obj"
            }
            ],
            "root": {
                "type": "group",
                "name": "root",
                "children": [
                    {
                        "type":"transform",
                        "name": "box-transform",
                        "transform": [
                            {"scale": [50,50,50]}
                        ],
                        "child": {
                            "type": "object",
                            "name": "boxnode",
                            "instanceof": "box",
                            "material": {
                                "color": [1,0,0]
                            }
                        }
                    },
                    {
                        "type":"transform",
                        "name": "aeroplane-transform",
                        "transform": [
                        {"rotate": [180,0,1,0]},
                        {"rotate": [90,1,0,0]},
                        {"scale": [30,30,30]}
                        ],
                        "child": {
                            "type": "object",
                            "name": "aeroplane-node",
                            "instanceof": "aeroplane",
                            "material": {
                                "color": [1,1,0]
                            }
                        }
                    }
                ]
            }
        }
        `;
  }



}