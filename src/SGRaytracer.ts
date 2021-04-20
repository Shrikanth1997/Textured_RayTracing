import { View } from "./View"
import * as WebGLUtils from "%COMMON/WebGLUtils"
import { Controller } from "./Controller";
import { RTView } from "./RTView";
import { ScenegraphJSONImporter } from "./ScenegraphJSONImporter";
import { VertexPNTProducer, VertexPNT } from "./VertexPNT";
import { Scenegraph } from "Scenegraph";
import { vec4 } from "gl-matrix";

var numFrames: number = 0;
var lastTime: number = -1;

/**
 * This is the main function of our web application. This function is called at the end of this file. In the HTML file, this script is loaded in the head so that this function is run.
 */
function main(): void {
    let gl: WebGLRenderingContext;
    let view: View;
    let controller: Controller;

    window.onload = ev => {

        //retrieve <canvas> element
        var canvas: HTMLCanvasElement = <HTMLCanvasElement>document.querySelector("#glCanvas");
        if (!canvas) {
            console.log("Failed to retrieve the <canvas> element");
            return;
        }

        //get the rendering context for webgl
        gl = WebGLUtils.setupWebGL(canvas, { 'antialias': false, 'alpha': false, 'depth': true, 'stencil': false });

        // Only continue if WebGL is available and working
        if (gl == null) {
            alert("Unable to initialize WebGL. Your browser or machine may not support it.");
            return;
        }
        console.log("Window loaded");
        view = new View(gl, 60, vec4.fromValues(0.9, 0.9, 0.7, 1));




        //set up the ray tracer view
        let raytracerView: RTView = new RTView(60,
            vec4.fromValues(0.9, 0.9, 0.7, 1));


        ScenegraphJSONImporter.importJSON(new VertexPNTProducer(), createScene_2())
            .then((s: Scenegraph<VertexPNT>) => {
                view.initScenegraph(s);

                controller = new Controller(view);
                controller.go();

                //set up animation callback function

                //first we write the function that will be called at every tick
              /*  var tick = function () {
                    //call the animate function of the view. 
                    view.draw();

                    // this line sets up the animation (i.e. this sets up the auto-loop of repeatedly calling 
                    // tick)
                    requestAnimationFrame(tick);
                };
                tick(); */

                raytracerView.initScenegraph(s);
                raytracerView.initRenderer().then(() => raytracerView.draw());
            });
    };

    window.onbeforeunload = ev => view.freeMeshes();
}

function createSphere(): string{

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
  "images": [
      {
      "name": "white",
      "path": "textures/white.png"
      },
      {
        "name": "earth",
        "path": "textures/earthmap.png"
      },
      {
        "name": "dice",
        "path": "textures/die.png"
      },
      {
        "name": "checkerboard",
        "path": "textures/checkerboard.png"
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
            500.0,
            0.0,
            1.0
          ],
          "spotdirection": [
            0.0,
            -1.0,
            0.0,
            0.0
          ],
          "spotcutoff": 60
        }
      ],
      "children": [
          {
              "type": "transform",
              "transform": [
                  {
                      "translate": [
                        0.0,
                        0.0,
                        0.0
                      ]
                  },
                  {
                      "scale": [
                          100.0,
                          100.0,
                          100.0
                      ]
                  }
              ],
              "child": {
                  "type": "object",
                  "instanceof": "box",
                  "texture": "dice",
                  "material": {
                      "ambient": [
                          0.8,
                          0.8,
                          0.8,
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
          }
      ]
  }
}
`;

}



function createScene(): string{

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
  "images": [
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
          "spotcutoff": 60
        },

        {
          "ambient": [
            0.2,
            0.2,
            0.2
          ],
          "diffuse": [
            0.2,
            0.2,
            0.2
          ],
          "specular": [
            0.5,
            0.5,
            0.5
          ],
          "position": [
            100.0,
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
            "spotcutoff": 60
        }

      ],
      "children": [
          {
              "type": "transform",
              "transform": [
                  {
                      "translate": [
                        0.0,
                        0.0,
                        30.0
                      ]
                  },
                  {
                      "scale": [
                          15.0,
                          15.0,
                          15.0
                      ]
                  }
              ],
              "child": {
                  "type": "object",
                  "instanceof": "sphere",
                  "material": {
                      "ambient": [
                          0.4,
                          0.2,
                          0.6,
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
                        -40.0,
                        15.0
                      ]
                  },
                  {
                      "scale": [
                          50,
                          40,
                          40
                      ]
                  }
              ],
              "child": {
                  "type": "object",
                  "instanceof": "box",
                  "texture" : "white",
                  "material": {
                      "ambient": [
                          0.8,
                          0.2,
                          0.3,
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
                        10.0,
                        -15,
                        10.0
                      ]
                  },
                  {
                      "scale": [
                          3,
                          3,
                          3
                      ]
                  }
              ],
              "child": {
                  "type": "object",
                  "instanceof": "sphere",
                  "texture" : "white",
                  "material": {
                      "ambient": [
                          0.2,
                          0.8,
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
                        7.5,
                        7.5,
                        -15.0
                      ]
                  },
                  {
                      "scale": [
                          5,
                          5,
                          5
                      ]
                  }
              ],
              "child": {
                  "type": "object",
                  "instanceof": "box",
                  "texture" : "white",
                  "material": {
                      "ambient": [
                          0.7,
                          0.7,
                          0.7,
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
          }
      ]
  }
}
`;

}




function createScene_2(): string{

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
  "images": [
      {
      "name": "white",
      "path": "textures/white.png"
      },
      {
        "name": "earth",
        "path": "textures/earthmap.png"
      },
      {
        "name": "dice",
        "path": "textures/die.png"
      },
      {
        "name": "checkerboard",
        "path": "textures/checkerboard-box.png"
      },
      {
        "name": "mirror",
        "path": "textures/mirror.png"
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
            500.0,
            0.0,
            1.0
          ],
          "spotdirection": [
            0.0,
            -1.0,
            0.0,
            0.0
          ],
          "spotcutoff": 60
        },

        {
          "ambient": [
            0.2,
            0.2,
            0.2
          ],
          "diffuse": [
            0.2,
            0.2,
            0.2
          ],
          "specular": [
            0.5,
            0.5,
            0.5
          ],
          "position": [
            100.0,
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
            "spotcutoff": 60
        }
        
      ],
      "children": [
          {
              "type": "transform",
              "transform": [
                  {
                      "translate": [
                        0.0,
                        100.0,
                        -100.0
                      ]
                  },
                  {
                      "scale": [
                          150.0,
                          150.0,
                          150.0
                      ]
                  }
              ],
              "child": {
                  "type": "object",
                  "instanceof": "sphere",
                  "texture": "mirror",
                  "material": {
                      "ambient": [
                          0.4,
                          0.4,
                          0.4,
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
                        -500.0,
                        0.0
                      ]
                  },
                  {
                      "scale": [
                          1000,
                          500,
                          500
                      ]
                  }
              ],
              "child": {
                  "type": "object",
                  "instanceof": "box",
                  "texture" : "checkerboard",
                  "material": {
                      "ambient": [
                          0.6,
                          0.6,
                          0.6,
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
                        80.0,
                        -50.0,
                        200.0
                      ]
                  },
                  {
                      "scale": [
                          50.0,
                          50.0,
                          50.0
                      ]
                  }
              ],
              "child": {
                  "type": "object",
                  "instanceof": "sphere",
                  "texture": "earth",
                  "material": {
                      "ambient": [
                          0.7,
                          0.7,
                          0.7,
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
                        100.0,
                        50,
                        100.0
                      ]
                  },
                  {
                      "scale": [
                          100,
                          100,
                          100
                      ]
                  },
                  {
                      "rotate": [
                          -20,
                          1.0,
                          0.0,
                          0.0
                      ]
                  }
              ],
              "child": {
                  "type": "object",
                  "instanceof": "box",
                  "texture" : "white",
                  "material": {
                      "ambient": [
                          0.8,
                          0.8,
                          0.3,
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
                        -100.0,
                        50,
                        200.0
                      ]
                  },
                  {
                      "scale": [
                          30,
                          30,
                          30
                      ]
                  }
              ],
              "child": {
                  "type": "object",
                  "instanceof": "sphere",
                  "texture" : "white",
                  "material": {
                      "ambient": [
                          0.2,
                          0.8,
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
                        -80,
                        200,
                        200.0
                      ]
                  },
                  {
                      "scale": [
                          30,
                          30,
                          30
                      ]
                  }
              ],
              "child": {
                  "type": "object",
                  "instanceof": "box",
                  "texture" : "checkerboard",
                  "material": {
                      "ambient": [
                          0.7,
                          0.7,
                          0.7,
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
          }
      ]
  }
}
`;

}





function scene(): string {
    return `{
        "scaleinstances": "false",
        "instances": [
          {
            "name": "sphere",
            "path": "models/sphere.obj"
          },
          {
            "name": "box",
            "path": "models/box-outside.obj"
          }
        ],
        "images": [
          {
            "name": "white",
            "path": "textures/white.png"
          },
          {
            "name": "earth",
            "path": "textures/earthmap.png"
          },
          {
            "name": "dice",
            "path": "textures/die.png"
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
              "spotcutoff": 180.0
            },
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
              "type": "group",
              "children": [
                {
                  "type": "transform",
                  "transform": [
                    {
                      "scale": [
                        50.0,
                        50.0,
                        50.0
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
                        -100.0,
                        0.0,
                        0.0
                      ]
                    },
                    {
                      "scale": [
                        40.0,
                        40.0,
                        40.0
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
                        0.1,
                        1.0
                      ],
                      "diffuse": [
                        0.8,
                        0.8,
                        0.1,
                        1.0
                      ],
                      "specular": [
                        0.8,
                        0.8,
                        0.1,
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
                        100.0,
                        0.0,
                        0.0
                      ]
                    },
                    {
                      "scale": [
                        40.0,
                        40.0,
                        40.0
                      ]
                    },
                    {
                      "rotate": [
                        45.0,
                        0.0,
                        1.0,
                        0.0
                      ]
                    }
                  ],
                  "child": {
                    "type": "object",
                    "instanceof": "box",
                    "texture": "dice",
                    "material": {
                      "ambient": [
                        0.1,
                        0.2,
                        0.2,
                        1.0
                      ],
                      "diffuse": [
                        0.1,
                        0.8,
                        0.8,
                        1.0
                      ],
                      "specular": [
                        0.1,
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
                        0.0,
                        -100.0
                      ]
                    },
                    {
                      "scale": [
                        40.0,
                        40.0,
                        40.0
                      ]
                    },
                    {
                      "rotate": [
                        45.0,
                        1.0,
                        1.0,
                        1.0
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
                        0.0,
                        100.0
                      ]
                    },
                    {
                      "scale": [
                        40.0,
                        40.0,
                        40.0
                      ]
                    }
                  ],
                  "child": {
                    "type": "object",
                    "instanceof": "box",
                    "material": {
                      "ambient": [
                        0.1,
                        0.1,
                        0.2,
                        1.0
                      ],
                      "diffuse": [
                        0.5,
                        0.5,
                        0.8,
                        1.0
                      ],
                      "specular": [
                        0.5,
                        0.5,
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
                        -50.0,
                        0.0
                      ]
                    },
                    {
                      "scale": [
                        500.0,
                        4.0,
                        500.0
                      ]
                    },
                    {
                      "translate": [
                        0.0,
                        -0.5,
                        0.0
                      ]
                    }
                  ],
                  "child": {
                    "type": "object",
                    "instanceof": "box",
                    "material": {
                      "ambient": [
                        0.4,
                        0.4,
                        0.4,
                        1.0
                      ],
                      "diffuse": [
                        0.8,
                        0.8,
                        0.8,
                        1.0
                      ],
                      "specular": [
                        0.5,
                        0.5,
                        0.5,
                        1.0
                      ],
                      "emission": [
                        0.0,
                        0.0,
                        0.0,
                        1.0
                      ],
                      "shininess": 10.0,
                      "absorption": 1.0,
                      "reflection": 0.0,
                      "transparency": 0.0,
                      "refractive_index": 0.0
                    }
                  }
                }
              ]
            }
          ]
        }
      }
       `;
}

function face(): string {
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

main();