//Griffen Agenllo   CS442   Library Classes/methods
class Vec3 {
    constructor( x, y, z ) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    /**
     * Returns the vector that is this vector scaled by the given scalar.
     * @param {number} by the scalar to scale with 
     * @returns {Vec3}
     */
    scaled( by ) {
        return new Vec3(this.x*by,this.y*by,this.z*by);
    }

    /**
     * Returns the dot product between this vector and other
     * @param {Vec3} other the other vector 
     * @returns {number}
     */
    dot( other ) {
        return ( (this.x * other.x) + (this.y * other.y) + (this.z * other.z) )
    }

    /**
     * Returns the length of this vector using pythagorean theorem
     * @returns {number}
     */
    length() {
        return Math.sqrt(Math.pow(this.x,2)+Math.pow(this.y,2)+Math.pow(this.z,2))
    }

    /**
     * Returns a normalized version of this vector by dividing direction by magnitude
     * @returns {Vec3}
     */
    norm() {
        let length=this.length()
        if(length==0) return new Vec3(this.x,this.y,this.z);
        return new Vec3(this.x/length,this.y/length,this.z/length);
    }

    /**
     * Returns the vector sum between this and other.
     * @param {Vec3} other 
     */
    add( other ) {
        this.x += other.x;
        this.y += other.y;
        this.z += other.z;
        return this;
    }

    sub( other ) {
        return this.add( other.scaled( -1 ) );
    }

    /**
     * Adds two vectors together, but does not change the value of either vector
     * @param {Vec3} other 
     * @returns Vec3
     */
    addImmutable(other){
        return new Vec4(this.x + other.x, this.y + other.y, this.z + other.z)
    }

    /**
     * Subtracts two vectors, but does not change the value of either vector
     * @param {Vec3} other 
     * @returns Vec3
     */
    subImmutable(other){
        return this.addImmutable( other.scaled( -1 ) );
    }
    cross( other ) {
        let x = this.y * other.z - this.z * other.y;
        let y = this.x * other.z - this.z * other.x;
        let z = this.x * other.y - this.y * other.x;

        return new Vec3( x, y, z);
    }

    negate(){
        return new Vec3(-this.x,-this.y,-this.z)
    }
	
	toString() {
		return [ '[', this.x, this.y, this.z, ']' ].join( ' ' );
	}
}

class Vec4 {

    constructor( x, y, z, w ) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w ?? 0;
    }

    /**
     * Returns the vector that is this vector scaled by the given scalar.
     * @param {number} by the scalar to scale with 
     * @returns {Vec4}
     */
    scaled( by ) {
        return new Vec4(this.x*by,this.y*by,this.z*by,this.w*by);
    }

    /**
     * Returns the dot product between this vector and other
     * @param {Vec4} other the other vector 
     * @returns {number}
     */
    dot( other ) {
        return ( (this.x * other.x) + (this.y * other.y) + (this.z * other.z) + (this.w * other.w) )
    }

    /**
     * Returns the length of this vector using pythagorean theorem
     * @returns {number}
     */
    length() {
        return Math.sqrt(Math.pow(this.x,2)+Math.pow(this.y,2)+Math.pow(this.z,2)+Math.pow(this.w,2))
    }

    /**
     * Returns a normalized version of this vector by dividing direction by magnitude
     * @returns {Vec4}
     */
    norm() {
        let length=this.length()
        if(length==0) return new Vec4(this.x,this.y,this.z,this.w);
        return new Vec4(this.x/length,this.y/length,this.z/length,this.w/length);
    }

    /**
     * Returns the vector sum between this and other.
     * @param {Vec4} other 
     */
    add( other ) {
        this.x += other.x;
        this.y += other.y;
        this.z += other.z;
        this.w += other.w;
        return this;
    }

    sub( other ) {
        return this.add( other.scaled( -1 ) );
    }

    /**
     * Adds two vectors together, but does not change the value of either vector
     * @param {Vec4} other 
     * @returns Vec4
     */
    addImmutable(other){
        return new Vec4(this.x + other.x, this.y + other.y, this.z + other.z,this.w + other.w)
    }

    /**
     * Subtracts two vectors, but does not change the value of either vector
     * @param {Vec4} other 
     * @returns Vec4
     */
    subImmutable(other){
        return this.addImmutable( other.scaled( -1 ) );
    }

    cross( other ) {
        let x = this.y * other.z - this.z * other.y;
        let y = this.x * other.z - this.z * other.x;
        let z = this.x * other.y - this.y * other.x;

        return new Vec4( x, y, z, 0 );
    }

    negate(){
        return new Vec4(-this.x,-this.y,-this.z,-this.w)
    }
	
	toString() {
		return [ '[', this.x, this.y, this.z, this.w, ']' ].join( ' ' );
	}
    /**
     * Calculate the normal of the given triangle. 
     * For the resulting normal to point in the positive y direction, p0 to p1 should be to the 
     * left of p0 to p2
     * @param {Vec4} p0 
     * @param {Vec4} p1 
     * @param {Vec4} p2 
     * @returns Vec4
     */
    static normal_of_triangle( p0, p1, p2 ) {
        let v0 = p1.sub( p0 );
        let v1 = p2.sub( p0 );
        return v0.cross( v1 );
    }
}

/**
 * Matrix with row-major layout:
 *  0       1       2       3
 *  4       5       6       7
 *  8       9       10      11
 *  12      13      14      15
 */
class Mat4 {

    constructor( data ) {
        if( data == null ) {
            this.data = [
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1,
            ]
        }
        else {
            this.data = data;
        }
    }

    static identity() {
        return new Mat4();
    }

    //Matrix corrected for perspective in the x field of view (FOV)
    /**
     * 
     * @param {number} fov_y_tau fov in tau. .25 tau = 45 degrees
     * @param {number} aspect_ratio fraction like 16/9 or 9/16
     * @param {number} near distance to near end of fov
     * @param {number} far distance to far end of fov
     * @returns frustum perspective fov for Y
     */
    static perspective_y(fov_y_tau,aspect_ratio,near,far){
        let fov=Mat4.turnToRad(fov_y_tau);
        let top= (Math.tan(fov/2) * near);
        let bottom = (-1) * top;
        let right= top * aspect_ratio;
        let left = (-1) * right;
        return this.frustum(left, right, top, bottom, near, far);
    }
    //Matrix corrected for perspective in the x field of view (FOV)
    /**
     * 
     * @param {number} fov_y_tau fov in tau. .25 tau = 45 degrees
     * @param {number} aspect_ratio fraction like 16/9 or 9/16
     * @param {number} near distance to near end of fov
     * @param {number} far distance to far end of fov
     * @returns frustum perspective fov for Y
     */
    static perspective_x(fov_x_tau,aspect_ratio,near,far){
        let fov=Mat4.turnToRad(fov_x_tau);
        let right= (Math.tan(fov/2) * near);
        let top= right * (1 / aspect_ratio);
        let bottom = (-1) * top;
        let left = (-1) * right;
        return this.frustum(left, right, top, bottom, near, far);
    }
    /**
     * 
     * @param {number} left 
     * @param {number} right 
     * @param {number} top 
     * @param {number} bottom 
     * @param {number} near 
     * @param {number} far 
     * @returns Mat4 frustum perspective matrix
     */
    static frustum(left, right, top, bottom, near, far){
        let scale_x = (2 * near) / (right-left);
        let scale_y = (2 * near) / (top-bottom);
        let tx= (right+left) / (right-left);
        let ty= (top + bottom) / (top-bottom);
        //Coefficient for non-linear z mapping
        let c1= (2*far*near) / (far-near);
        let c2= (far+near) / (far-near);
        return new Mat4([scale_x, 0, tx, 0,
                        0, scale_y, ty, 0,
                        0, 0, c2, (-1)*c1,
                        0, 0, 1, 0])
    }
    toString() {
        var str_vals = this.data.map( function( val ) { return "" + val } )
        var str = 
            str_vals.slice( 0, 4 ).join(' ') + '; ' + 
            str_vals.slice( 4, 8 ).join(' ') + '; ' +
            str_vals.slice( 8, 12 ).join(' ') + '; ' +
            str_vals.slice( 12, 16 ).join(' ');

        return '[' + str + ']';
    }
    /**
     * Returns the radian equivalent of the turn parameter
     * @param {number} turns
     * @returns {number} radian
     */
    static turnToRad(turns){
        return (turns * 2 * Math.PI)
    }
    /**
     * Returns a rotation matrix in the XY plane, rotating by the given number of turns. 
     * @param {number} turns amount to rotate by
     * @returns {Mat4}  
     */
    static rotation_xy( turns ) {
        let rad=this.turnToRad(turns);
        return new Mat4([Math.cos(rad), Math.sin(rad), 0, 0,
                        (-1)*(Math.sin(rad)), Math.cos(rad), 0, 0,
                        0, 0, 1, 0,
                        0, 0, 0, 1]);
    }

    /**
     * Returns a rotation matrix in the XZ plane, rotating by the given number of turns
     * @param {number} turns amount to rotate by
     * @returns {Mat4}  
     */
    static rotation_xz( turns ) {
        let rad=this.turnToRad(turns);
        return new Mat4([Math.cos(rad), 0, Math.sin(rad), 0,
                        0, 1, 0, 0,
                        (-1)*(Math.sin(rad)), 0, Math.cos(rad), 0,
                        0, 0, 0, 1]);
        // return the rotation matrix
    }

    /**
     * Returns a rotation matrix in the YZ plane, rotating by the given number of turns
     * @param {number} turns amount to rotate by
     * @returns {Mat4}  
     */
    static rotation_yz( turns ) {
        let rad=this.turnToRad(turns);
        return new Mat4([1, 0, 0, 0,
                        0, Math.cos(rad), Math.sin(rad), 0,
                        0, (-1)*(Math.sin(rad)), Math.cos(rad), 0,
                        0, 0, 0, 1  ]);
    }
    /**
     * Translates the matrix in some direction defined by d
     * @param {number} dx 
     * @param {number} dy 
     * @param {number} dz 
     */
    static translation( dx, dy, dz ) {
        return new Mat4([1, 0, 0, dx,
                        0, 1, 0, dy,
                        0, 0, 1, dz,
                        0, 0, 0, 1])
    }
    /**
     * 
     * @param sx 
     * @param sy 
     * @param sz 
     * @returns Matrix to scale by
     */
    static scale( sx, sy, sz ) {
        return new Mat4([sx, 0, 0, 0,
                        0, sy, 0, 0,
                        0, 0, sz, 0,
                        0, 0, 0, 1])
    }
    /**
     * 
     * @param right 
     * @returns Matrix multiplied by right parameter matrix
     */
    mul( right ) {
        let mat = new Mat4();
        for(let y=0; y<15; y+=4){
            for(let x=0; x<4; x++){
                let column_sum=0;
                for(let right_x=0; right_x<4; right_x++){
                    column_sum+=(this.data[y+right_x] * right.data[right_x*4+x]);
                }
                mat.data[y+x]=column_sum;
            }
        }
        return mat
    }

	// right multiply by column vector
    transform( x, y, z, w ) {
        this.transform_vec( new Vec4( x, y, z, w ) );
    }
    /**
     * 
     * @param {Vec4} vec 
     * @returns Vec4 
     */
    transform_vec( vec ) {
        let vec_new = [0, 0, 0, 0];
        let vec_array= [vec.x,vec.y,vec.z,vec.w]
        let row_num=0
        for(let y=0; y<15; y+=4){
            let row_sum=0;
            for(let x=0; x<4; x++){
                row_sum+=(this.data[y+x] * vec_array[x])
            }
            vec_new[row_num]=row_sum;
            row_num++;
        }
        return new Vec4(vec_new[0],vec_new[1],vec_new[2],vec_new[3]);
    }


    rc( row, col ) {
        return this.data[ row * 4 + col ]
    }

    // inverting a 4x4 matrix is ugly, there are 16 determinants we 
    // need to calculate. Because it's such a pain, I looked it up:
    // https://stackoverflow.com/questions/1148309/inverting-a-4x4-matrix
    // author: willnode
    inverse() {
        // var A2323 = m.m22 * m.m33 - m.m23 * m.m32 ;
        const A2323 = this.rc(2, 2) * this.rc(3, 3) - this.rc(2, 3) * this.rc(3, 2); 
        // var A1323 = m.m21 * m.m33 - m.m23 * m.m31 ;
        const A1323 = this.rc(2, 1) * this.rc(3, 3) - this.rc(2, 3) * this.rc(3, 1);
        // var A1223 = m.m21 * m.m32 - m.m22 * m.m31 ;
        const A1223 = this.rc(2, 1) * this.rc(3, 2) - this.rc(2, 2) * this.rc(3, 1);
        // var A0323 = m.m20 * m.m33 - m.m23 * m.m30 ;
        const A0323 = this.rc(2, 0) * this.rc(3, 3) - this.rc(2, 3) * this.rc(3, 0);
        // var A0223 = m.m20 * m.m32 - m.m22 * m.m30 ;
        const A0223 = this.rc(2, 0) * this.rc(3, 2) - this.rc(2, 2) * this.rc(3, 0);
        // var A0123 = m.m20 * m.m31 - m.m21 * m.m30 ;
        const A0123 = this.rc(2, 0) * this.rc(3, 1) - this.rc(2, 1) * this.rc(3, 0);
        // var A2313 = m.m12 * m.m33 - m.m13 * m.m32 ;
        const A2313 = this.rc(1, 2) * this.rc(3, 3) - this.rc(1, 3) * this.rc(3, 2);
        // var A1313 = m.m11 * m.m33 - m.m13 * m.m31 ;
        const A1313 = this.rc(1, 1) * this.rc(3, 3) - this.rc(1, 3) * this.rc(3, 1);
        // var A1213 = m.m11 * m.m32 - m.m12 * m.m31 ;
        const A1213 = this.rc(1, 1) * this.rc(3, 2) - this.rc(1, 2) * this.rc(3, 1);
        // var A2312 = m.m12 * m.m23 - m.m13 * m.m22 ;
        const A2312 = this.rc(1, 2) * this.rc(2, 3) - this.rc(1, 3) * this.rc(2, 2);
        // var A1312 = m.m11 * m.m23 - m.m13 * m.m21 ;
        const A1312 = this.rc(1, 1) * this.rc(2, 3) - this.rc(1, 3) * this.rc(2, 1);
        // var A1212 = m.m11 * m.m22 - m.m12 * m.m21 ;
        const A1212 = this.rc(1, 1) * this.rc(2, 2) - this.rc(1, 2) * this.rc(2, 1);
        // var A0313 = m.m10 * m.m33 - m.m13 * m.m30 ;
        const A0313 = this.rc(1, 0) * this.rc(3, 3) - this.rc(1, 3) * this.rc(3, 0);
        // var A0213 = m.m10 * m.m32 - m.m12 * m.m30 ;
        const A0213 = this.rc(1, 0) * this.rc(3, 2) - this.rc(1, 2) * this.rc(3, 0);
        // var A0312 = m.m10 * m.m23 - m.m13 * m.m20 ;
        const A0312 = this.rc(1, 0) * this.rc(2, 3) - this.rc(1, 3) * this.rc(2, 0);
        // var A0212 = m.m10 * m.m22 - m.m12 * m.m20 ;
        const A0212 = this.rc(1, 0) * this.rc(2, 2) - this.rc(1, 2) * this.rc(2, 0);
        // var A0113 = m.m10 * m.m31 - m.m11 * m.m30 ;
        const A0113 = this.rc(1, 0) * this.rc(3, 1) - this.rc(1, 1) * this.rc(3, 0);
        // var A0112 = m.m10 * m.m21 - m.m11 * m.m20 ;
        const A0112 = this.rc(1, 0) * this.rc(2, 1) - this.rc(1, 1) * this.rc(2, 0);
        const det = 
        this.rc(0, 0) * ( this.rc(1, 1) * A2323 - this.rc(1, 2) * A1323 + this.rc(1, 3) * A1223 ) -
        this.rc(0, 1) * ( this.rc(1, 0) * A2323 - this.rc(1, 2) * A0323 + this.rc(1, 3) * A0223 ) +
        this.rc(0, 2) * ( this.rc(1, 0) * A1323 - this.rc(1, 1) * A0323 + this.rc(1, 3) * A0123 ) -
        this.rc(0, 3) * ( this.rc(1, 0) * A1223 - this.rc(1, 1) * A0223 + this.rc(1, 2) * A0123 );
        const dr = 1.0 / det;
        return new Mat4( [
            dr * ( this.rc(1, 1) * A2323 - this.rc(1, 2) * A1323 + this.rc(1, 3) * A1223 ),
            dr *-( this.rc(0, 1) * A2323 - this.rc(0, 2) * A1323 + this.rc(0, 3) * A1223 ),
            dr * ( this.rc(0, 1) * A2313 - this.rc(0, 2) * A1313 + this.rc(0, 3) * A1213 ),
            dr *-( this.rc(0, 1) * A2312 - this.rc(0, 2) * A1312 + this.rc(0, 3) * A1212 ),

            dr *-( this.rc(1, 0) * A2323 - this.rc(1, 2) * A0323 + this.rc(1, 3) * A0223 ),
            dr * ( this.rc(0, 0) * A2323 - this.rc(0, 2) * A0323 + this.rc(0, 3) * A0223 ),
            dr *-( this.rc(0, 0) * A2313 - this.rc(0, 2) * A0313 + this.rc(0, 3) * A0213 ),
            dr * ( this.rc(0, 0) * A2312 - this.rc(0, 2) * A0312 + this.rc(0, 3) * A0212 ),

            dr * ( this.rc(1, 0) * A1323 - this.rc(1, 1) * A0323 + this.rc(1, 3) * A0123 ),
            dr *-( this.rc(0, 0) * A1323 - this.rc(0, 1) * A0323 + this.rc(0, 3) * A0123 ),
            dr * ( this.rc(0, 0) * A1313 - this.rc(0, 1) * A0313 + this.rc(0, 3) * A0113 ),
            dr *-( this.rc(0, 0) * A1312 - this.rc(0, 1) * A0312 + this.rc(0, 3) * A0112 ),

            dr *-( this.rc(1, 0) * A1223 - this.rc(1, 1) * A0223 + this.rc(1, 2) * A0123 ),
            dr * ( this.rc(0, 0) * A1223 - this.rc(0, 1) * A0223 + this.rc(0, 2) * A0123 ),
            dr *-( this.rc(0, 0) * A1213 - this.rc(0, 1) * A0213 + this.rc(0, 2) * A0113 ),
            dr * ( this.rc(0, 0) * A1212 - this.rc(0, 1) * A0212 + this.rc(0, 2) * A0112 ),
        ] );
    }

    clone() {
        let c = new Array(16);
        for( let i = 0; i < 16; i++ ) { c[i] = this.data[i]; }
        return new Mat4( c );
    }
	getCoords() {
        let x = this.data[ 3 ];
        let y = this.data[ 7 ];
        let z = this.data[ 11 ];

        return new Vec4( x, y, z, 1.0 );
    }
	toString() {
		let pieces = [ '[' ];
		
		for( let row = 0; row < 4; row ++ ){
			pieces.push( '[' );
			
			for( let col = 0; col < 4; col ++ ){
				let i = row * 4 + col;
				pieces.push( this.data[i] );
			}
			
			pieces.push( ']' )
		}
		
		pieces.push( ']' );
		
		return pieces.join( ' ' );
	}
    get_transformed_coordinates() {
        let x = this.data[ 3 ];
        let y = this.data[ 7 ];
        let z = this.data[ 11 ];

        return new Vec4( x, y, z, 1.0 );
    }

    without_w() {
        let clone = this.clone();
        clone.data[12] = clone.data[13] = clone.data[14] = 0;
        clone.data[15] = 1;
        clone.data[3] = 0;
        clone.data[7] = 0;
        clone.data[11] = 0;

        return clone;
    }
}

