
class Keys {
    constructor() {
        this.mouse_x=0.0;
        this.mouse_y=0.0;
        this.zoom=0.0
        this.isTurning=false;
        //list of boolean key values
        this.keys_down={};    }

    /**
     * Register a keyboard listener and create a Keys object that 
     * will be updated by it.
     * 
     * @returns Keys
     */
    static start_listening() {
        let keys = new Keys();

        addEventListener( 'keydown', function( ev ) {
            // console.log( ev.code );
            // use the keycode, not the text, to determine behavior.
            // this prevents users in France from having to 
            // hunt around the keyboard for W-A-S-D
            if( typeof ev.code === 'string' ) {
                keys.keys_down[ ev.code ] = true;
            }
        } );

        addEventListener( 'keyup', function( ev ) {
            if( typeof ev.code === 'string' ) {
                keys.keys_down[ ev.code ] = false;
            }
        } );
        //Rotate camera with mouse
        addEventListener('mousedown',function(ev){
            keys.isTurning=true;
        });
        addEventListener('mouseup',function(ev){
            keys.isTurning=false;
        })
        addEventListener('mousemove',function(ev){
            //If mouse is within canvas boundaries
            if(ev.screenX <= 820 && ev.screenY <=925 && ev.screenY >=325){
                if(keys.isTurning){
                    keys.mouse_x=ev.movementX;
                    keys.mouse_y=ev.movementY;
                }
            }
            else{
                keys.mouse_x=0;
                keys.mouse_y=0;
            }
        });
        addEventListener('wheel',function(ev){
            keys.zoom=ev.deltaY/10000;
        })
        return keys;
    }

    is_key_down( code ) {
        return !!this.keys_down[ code ];
    }

    is_key_up( code ) {
        return !this.keys_down[ code ];
    }

    keys_down_list() {
        return Object.entries(this.keys_down)
            .filter( kv => kv[1] /* the value */ )
            .map( kv => kv[0] /* the key */ );

        // the code above is equivalent to this:
        /*
        let ret = [];

        for( const [key, value] of Object.entries(this.keys_down) ) {
            if( value ) {
                ret.push( key );
            }
        }

        return ret;
        */

        // notice how much more terse the functional is. It's easier to read, too, 
        // if you're comfortable with functional programming.
    }
    getX(){
        return this.mouse_x;
    }
    getY(){
        return this.mouse_y;
    }
    getZoom(){
        return this.zoom;
    }
}
