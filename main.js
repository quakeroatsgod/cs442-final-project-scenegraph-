//Griffen Agnello, Cyrus Santiago   Final Project   Scene Graphs    CS442
let canvas = document.getElementById( 'the-canvas' );
/** @type {WebGLRenderingContext} */
let gl = canvas.getContext( 'webgl2' );

const PHONG_VERTEX_SHADER = 
`   #version 300 es
    precision mediump float;

    uniform mat4 projection;
    uniform mat4 model;
    uniform mat4 view;

    in vec3 coordinates;
    in vec4 color;
    in vec2 uv;
    in vec3 normal;
    out vec3 surf_normal;
    out vec4 v_color;
    out vec2 v_uv;
    out vec3 v_coords;
    void main( void ) {
        gl_Position = projection * view * model * vec4( coordinates, 1.0 );
        v_color = ( 0.1 * color ); 
        v_coords=coordinates;
        v_uv = uv;
        surf_normal=normal;
    }
`;

const PHONG_FRAGMENT_SHADER = 
`   #version 300 es
    precision mediump float;
    uniform mat4 model;
    uniform vec3 viewer_loc;
    uniform vec3 sun_dir;
    uniform vec3 sun_color;
    uniform vec3 light1_loc;
    uniform vec3 light1_color;
    uniform vec3 light2_loc;
    uniform vec3 light2_color;
    const float light_attenuation_k = 0.01;
    const float light_attenuation_l = 0.1;
    const float light_attenuation_q = 0.00; /* no quadratic term for now */
    uniform float mat_ambient;
    uniform float mat_diffuse;
    uniform float mat_specular;
    uniform float mat_shininess;
    in vec4 v_color;
    in vec2 v_uv;
    in vec3 surf_normal;
    in vec3 v_coords;
    out vec4 f_color;
    uniform sampler2D tex_0;
    vec3 diff_color( vec3 normal, vec3 light_dir,vec3 light_color, float mat_diffuse ) {
        return mat_diffuse * light_color * max( dot( normal, light_dir ), 0.0 );
    }

    vec3 spec_color( 
        vec3 normal, 
        vec3 light_dir,
        vec3 eye_dir, 
        vec3 light_color, 
        float mat_specular,
        float mat_shiniess
    ) {
        float cos_light_surf_normal = dot( normal, light_dir );
        if( cos_light_surf_normal <= 0.0 ) {
            return vec3( 0.0, 0.0, 0.0 );
        }
        vec3 light_reflection = 
            2.0 * cos_light_surf_normal * normal - light_dir;
        return 
            pow( 
                max( dot( light_reflection, normalize( eye_dir ) ), 0.0  ),
                mat_shininess 
            ) * light_color * mat_specular;
    }

    float attenuation( vec3 vector_to_light ) {
        float light1_dist = length( vector_to_light );
        float light1_atten = 1.0 / ( 
            light_attenuation_k + 
            light_attenuation_l * light1_dist +
            light_attenuation_q * light1_dist * light1_dist
        );
        return light1_atten;
    }

    void main( void ) {
        vec3 normal_tx = normalize( mat3( model ) * surf_normal );
        vec3 coords_tx = ( model * vec4( v_coords, 1.0 ) ).xyz;
        vec3 eye_dir = normalize( viewer_loc - coords_tx );
        vec4 ambient_color = vec4( mat_ambient, mat_ambient, mat_ambient, 1.0 );
        float cos_sun_dir_surf_normal = dot( sun_dir, normal_tx );
        vec3 sun_diffuse_color = diff_color( normal_tx, sun_dir, sun_color, mat_diffuse );
        vec3 sun_spec_color =spec_color( normal_tx, sun_dir, eye_dir, sun_color, mat_specular, mat_shininess );
        vec4 color_from_sun = vec4( sun_diffuse_color + sun_spec_color, 1.0 );
        
        vec3 vector_to_light1 = light1_loc - coords_tx;
        vec3 light1_dir = normalize( vector_to_light1 );
        float light1_atten = attenuation( vector_to_light1 );
        vec3 light1_diffuse_color = diff_color( normal_tx, light1_dir, light1_color, mat_diffuse);
        vec3 light1_spec_color = spec_color( normal_tx, light1_dir, eye_dir, light1_color, mat_specular, mat_shininess );
        vec4 color_from_light1 = vec4(( light1_diffuse_color + light1_spec_color ) * light1_atten, 1.0 );

        vec3 vector_to_light2 = light2_loc - coords_tx;
        vec3 light2_dir = normalize( vector_to_light2 );
        float light2_atten = attenuation( vector_to_light1 );
        vec3 light2_diffuse_color = diff_color( normal_tx, light2_dir, light2_color, mat_diffuse);
        vec3 light2_spec_color = spec_color( normal_tx, light2_dir, eye_dir, light2_color, mat_specular, mat_shininess );
        vec4 color_from_light2 = vec4(( light2_diffuse_color + light2_spec_color ) * light2_atten, 1.0 );

        f_color = v_color + ( 1.0 * (
            ambient_color +
            color_from_sun +
            color_from_light1 +
            color_from_light2
        ) ) * texture( tex_0, v_uv ); 
    }
`;
//Attributed from learnopengl.com/cubemap
const SKYBOX_SHADER_VERTEX=
`#version 300 es
precision mediump float;
uniform mat4 projection;
uniform mat4 modelview;
uniform mat4 view;
in vec3 sky_coords;
out vec3 skybox_coords;
void main(){    
    skybox_coords=sky_coords;
    //remove translation from view matrix so that the viewbox is always fixiated on the camera's position
    mat4 view_no_trans = mat4(mat3(view));
    gl_Position = projection * view_no_trans * vec4( sky_coords, 1.0 );

}
`;
const SKYBOX_SHADER_FRAGMENT=
`#version 300 es
precision mediump float;
out vec4 FragColor;
in vec3 skybox_coords;
uniform samplerCube skybox;
void main(){    
    FragColor = texture(skybox, skybox_coords);
}

`;
let lit_program = create_compile_and_link_program(gl, PHONG_VERTEX_SHADER,PHONG_FRAGMENT_SHADER);
let skybox_program = create_compile_and_link_program(gl, SKYBOX_SHADER_VERTEX, SKYBOX_SHADER_FRAGMENT);
gl.useProgram( lit_program );
set_render_params( gl );

let last_update = performance.now();

const DESIRED_TICK_RATE = 60;
const DESIRED_MSPT = 1000.0 / DESIRED_TICK_RATE;

const ROTATION_SPEED = 0.2; // eighth turn per second
const ROTATION_SPEED_PER_FRAME = ROTATION_SPEED / DESIRED_TICK_RATE;

const FLY_SPEED = 5;    // units per second
const FLY_SPEED_PER_FRAME = FLY_SPEED / DESIRED_TICK_RATE;
//Amount to change the scale of the floating box by
var SCALE_CHANGE_AMOUNT=1;
var SCALE_CHANGE_INCREMENT=0.025;
//Timer for moving the road meshes
const TIMER_START_TIME=4825;
var time_since_last_move=TIMER_START_TIME;
let keys = Keys.start_listening();

let cam = new Camera();
cam.translate( 0, 2, 0 );
cam.yaw=-.25;
var loaded_cow=false
//Cubemap skybox, names stand for positive/negative x/y/z, must iterate in this exact order
let skybox_imgs=[   'res/skybox/px.png','res/skybox/nx.png','res/skybox/py.png',
                    'res/skybox/ny.png','res/skybox/pz.png','res/skybox/nz.png']

let skybox=Cubemap.createCubemap(gl,skybox_program,skybox_imgs);

var scene = new Scene();
//Sun settings
scene.set_sun_color(0.95,0,0.25);
scene.set_sun_direction(-2,2,-1);
//Scene Lighting
let light_1 = new NodeLight(0,1,0,false);
let light_2 = new NodeLight(0,0,1, false);
//Scene Meshes
let floating_box_mat = new LitMaterial( gl, 'res/textures/wood_boards.png', gl.LINEAR, 0.35, 1, 2, 4 );
let car_mat = new LitMaterial( gl, 'res/textures/car.jpg', gl.LINEAR, 0.35, 1, 2, 4 );
let wheel_mat = new LitMaterial( gl, 'res/textures/wheel.jpg', gl.LINEAR, 0.65, 1, 3, 4 );
let cow_mat = new LitMaterial( gl, 'res/textures/vaporwave.png', gl.LINEAR, 0.35, 1, 2, 8 );
let road_mat = new LitMaterial( gl, 'res/textures/road.jpg', gl.LINEAR, 0.65, 1, 3, 4 );
let map_mat = new LitMaterial(gl, 'res/textures/pink_grid.webp', gl.LINEAR, 0.65, 1, 3, 16);
//Asynchronously load the cow obj
var cow_mesh=null;
NormalMesh.from_obj_file(gl,'res/obj/cow.obj', lit_program, getMesh,cow_mat,false)
let mesh_box_car = NormalMesh.box(gl, lit_program, 1,1,1,car_mat);
let mesh_box_floating = NormalMesh.box(gl, lit_program, 1,1,1,floating_box_mat);
let wheel_sphere = NormalMesh.uv_sphere( gl, lit_program, 0.25, 200, wheel_mat ); 
let wave_sphere = NormalMesh.uv_sphere( gl, lit_program, 0.25, 100, map_mat);
let mesh_road = NormalMesh.platform(gl,lit_program,1,4,0,1,road_mat);

//add stuff to scene
var root_control_node = scene.create_node(0,0,0, 0,0,0, 1,1,1, null);
var road_control_node = root_control_node.create_child_node(0,-1,0, 0,0,0, 3,1,3, null);
var car_control_node = root_control_node.create_child_node(0,0,0, -0.32,0,0, 2,1,2, null);
var wheel_control_node = car_control_node.create_child_node(0,0,0, 0,0,0, 1,1,1, null);
var main_sphere_control_node = car_control_node.create_child_node(0,0,0, 0,0,0, 1,1,1, null);
var floating_box_control_node=car_control_node.create_child_node(0,0,0, 0,0,0, 0.5,1,0.5, null);
var small_sphere_control_node=main_sphere_control_node.create_child_node(0,0,-4, 0,0,0, 1,1,1, null);
var floating_box=floating_box_control_node.create_child_node(0,-2,0, 0,0,0, 1,1,1, mesh_box_floating);
//This will be set as a node later after loading obj
var cow_node = null;
var car_body = car_control_node.create_child_node(0,0,0, 0,0,0, 1,1,1, mesh_box_car);
var light_nodes=[   car_control_node.create_child_node(0,0,0, 0,0,0, 1,1,1, light_1),  
                    floating_box.create_child_node(0,0,0, 0,0,0, 1,1,1, light_2)
]               
var wheels=[    wheel_control_node.create_child_node(-0.5,-0.75,-0.5, 0,0,0, 1,1,1, wheel_sphere),
                wheel_control_node.create_child_node(0.5,-0.75,-0.5, 0,0,0, 1,1,1, wheel_sphere),
                wheel_control_node.create_child_node(-0.5,-0.75,0.5, 0,0,0, 1,1,1, wheel_sphere),
                wheel_control_node.create_child_node(0.5,-0.75,0.5, 0,0,0, 1,1,1, wheel_sphere)
]
//3 meshes to make 1 long road
var road1=road_control_node.create_child_node(0,0,0, -0.32,0,0, 1,1,1, mesh_road);
var road2=road1.create_child_node(0,0,4, 0,0,0, 1,1,1, mesh_road);
var road3=road2.create_child_node(0,0,4, 0,0,0, 1,1,1, mesh_road);

//Spheres
var bigSphere=main_sphere_control_node.create_child_node(0,0,-4, 0,0,0, 4,4,4, wave_sphere);
var smallSphere=small_sphere_control_node.create_child_node(0,1.5,-1, 0,0.25,0, 0.5,0.5,0.5, wave_sphere);
var smallSphere2=small_sphere_control_node.create_child_node(0,-1,-1.2, 0,0.25,0, 0.5,0.5,0.5, wheel_sphere);
var smallRoad=small_sphere_control_node.create_child_node(-2,0,-1.4, 0,0.25,0, 0.5,0.5,0.5, mesh_road);

function render( now ) {
    last_update = now;
    
    requestAnimationFrame( render );
    
    //Preliminary initialization that is the same throughout the mesh rendering
    //Use phong lighting shader to load most of everything    
    gl.useProgram(lit_program);
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
    
    let jobs = [];
    let lights = [];
    scene.generate_render_batch(jobs, lights);
    let model = Mat4.identity();
    let view = cam.get_view_matrix();
    let projection = Mat4.perspective_x( cam.zoom, 4 / 3, 0.125, 2048 );
    set_uniform_matrix4( gl, lit_program, 'projection', projection.data );
    set_uniform_matrix4( gl, lit_program, 'view', view.data );
    // transform viewer coordinates
    set_uniform_vec3( gl, lit_program, 'viewer_loc', cam.x, cam.y, cam.z );
    if(cow_mesh){
        //Add cow to scene graph when it's done loading. The cow loading should not bog down rendering everything else
        if(!loaded_cow){
            cow_node = car_control_node.create_child_node(0,0.85,0, 0,0,0, 0.1,0.1,0.1, cow_mesh)
            cow_node.add_yaw(-0.25)
            loaded_cow=true;
        }
        // bind lights
        scene.bind_sun(gl,lit_program);
        //Render every node in scene graph and multiply each node's matrix by the model matrix
        for(let job of jobs){
            model=job.matrix;
            //Change model depending on what we want to draw
            set_uniform_matrix4( gl, lit_program, 'model', model.data );
            
            job.mesh.render(gl);
        }
        //Create light object and bind it
        let light_count=1;
        for(let light of lights){
            let light_binder = new Light(light.loc.x, light.loc.y, light.loc.z,
                                        light.color.r, light.color.g, light.color.b, light_count++);
            light_binder.bind(gl,lit_program,null);
        }
    }
    //Render skybox with skybox shader
    gl.depthFunc(gl.LEQUAL);  // change depth function so depth test passes when values are equal to depth buffer's content
    gl.useProgram(skybox_program);
    set_uniform_matrix4( gl, skybox_program, 'projection', projection.data );
    set_uniform_matrix4( gl, skybox_program, 'model', model.data );
    set_uniform_matrix4( gl, skybox_program, 'view', view.data );
    skybox.render(gl);
    gl.depthFunc(gl.LESS); // set depth function back to default

}

const KEYMAP = {
    'KeyF': function() { 
        cam.x=car_control_node.x-4;
        cam.y=car_control_node.y+2;
        cam.z=car_control_node.z;
        cam.yaw=0.27;
        cam.pitch=-0.05

    },
    'KeyG': function() {
        cam.x=car_control_node.x+4;
        cam.y=car_control_node.y;
        cam.z=car_control_node.z;
        cam.yaw=0.75
        cam.pitch=0.05
    },
    'KeyR': function() {
        cam.x=car_control_node.x;
        cam.y=car_control_node.y+1.25;
        cam.z=car_control_node.z;
    },
    'KeyH': function() {
        road1.translate(-road1.x,0,-road1.z)
        car_control_node.translate(-car_control_node.x,0,-car_control_node.z)
        time_since_last_move=TIMER_START_TIME;
    },
    'KeyW': function() { cam.move_in_direction( 0, 0, FLY_SPEED_PER_FRAME ); },
    'KeyS': function() { cam.move_in_direction( 0, 0, -FLY_SPEED_PER_FRAME ); },
    'KeyA': function() { cam.move_in_direction( -FLY_SPEED_PER_FRAME, 0, 0 ); },
    'KeyD': function() { cam.move_in_direction( FLY_SPEED_PER_FRAME, 0, 0 ); },
    'Space': function() { cam.translate( 0, FLY_SPEED_PER_FRAME, 0 ); },
    'KeyC': function() { cam.translate( 0, -FLY_SPEED_PER_FRAME, 0 ); },
    'KeyQ': function() { cam.add_roll( -ROTATION_SPEED_PER_FRAME ); },
    'KeyE': function() { cam.add_roll( ROTATION_SPEED_PER_FRAME ); },
    'ArrowLeft': function() { cam.add_yaw( -ROTATION_SPEED_PER_FRAME ); },
    'ArrowRight': function() { cam.add_yaw( ROTATION_SPEED_PER_FRAME ); },
    'ArrowUp': function() { cam.add_pitch( -ROTATION_SPEED_PER_FRAME ); },
    'ArrowDown': function() { cam.add_pitch( ROTATION_SPEED_PER_FRAME ); },
};

/**
 * Retrieves a mesh from a file
 * @param {*} mesh_from_file 
 */
function getMesh(mesh_from_file){
    cow_mesh=mesh_from_file;
}

function update() {
    if(cow_mesh){
        let keys_down = keys.keys_down_list();
        for( const key of keys_down ) {
            let bound_function = KEYMAP[ key ];

            if( bound_function ) {
                bound_function();
            }
        }
        cam.zoom+=keys.getZoom();
        if(cam.zoom >= 0.4)                      cam.zoom=0.4;
        else if(cam.zoom <= 0.0625)                cam.zoom=0.0625;
        cam.yaw+=keys.getX() * ROTATION_SPEED_PER_FRAME*0.15;
        cam.pitch+=keys.getY() * ROTATION_SPEED_PER_FRAME*0.15;

        keys.mouse_x=0;
        keys.mouse_y=0;
        keys.zoom=0;
        car_control_node.move_in_direction(0,0,8*ROTATION_SPEED_PER_FRAME);
        floating_box_control_node.add_pitch(0.002)
        floating_box_control_node.add_roll(0.002)
        floating_box_control_node.add_yaw(0.002)
        bigSphere.add_pitch(-0.005)
        small_sphere_control_node.add_roll(0.02)
        smallSphere.change_scale(SCALE_CHANGE_AMOUNT,SCALE_CHANGE_AMOUNT,SCALE_CHANGE_AMOUNT)
        smallSphere2.add_yaw(0.02)
        floating_box.change_scale(SCALE_CHANGE_AMOUNT,SCALE_CHANGE_AMOUNT,SCALE_CHANGE_AMOUNT)
        cow_node.add_yaw(0.01)
        for(wheel of wheels){
            wheel.add_pitch(-0.02)
        }
        light_nodes[0].add_roll(0.02)

        //update amount to scale by
        if(SCALE_CHANGE_AMOUNT > 1.5 || SCALE_CHANGE_AMOUNT < 0.1){
            //Flip sign so decrease/increase in scale
            SCALE_CHANGE_INCREMENT*=(-1);
        }
        //Increment by 0.1 each update
        SCALE_CHANGE_AMOUNT+=SCALE_CHANGE_INCREMENT;

        //Decrement timer to move roads.
        if(time_since_last_move < 0 ){
            road1.move_in_direction(0,0,4)
            time_since_last_move=TIMER_START_TIME;
        }
        else{
            //Subtract passed time since last frame in milliseconds
            let delta=((performance.now() - last_update)); 
            last_update=performance.now()
            time_since_last_move-=delta;
        }
    }
    return;
}

requestAnimationFrame( render );
setInterval( update, DESIRED_MSPT );