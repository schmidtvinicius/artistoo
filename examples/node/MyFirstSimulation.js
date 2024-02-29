let CPM = require('../../build/artistoo-cjs.js')

let field_size_x = 200
let field_size_y = 200

// Adding obstacles
let config = {

    // Grid settings
    ndim : 2,
    field_size : [field_size_x, field_size_y],

    conf : {
        T: 20,
        
        J: [[0,20], 
            [20,0]],
        
        LAMBDA_V: [0,50],
        V: [0,200],
        
        LAMBDA_P: [0,2],
        P: [0, 180],

        // ActivityConstraint parameters
        MAX_ACT : [0,80],
        LAMBDA_ACT : [0,200],
        ACT_MEAN : "geometric"

    },

    // Simulation setup and configuration
    simsettings : {
        NRCELLS : [40],
        SAVEIMG: true,
        TIME: 1,
        SAVEPATH:'screenshots/',  
        EXPNAME: 'try',
        RUNTIME: 500,
        
        IMGFRAMERATE: 30,
        
        // Visualization
        CANVASCOLOR : "eaecef",
        CELLCOLOR : ["000000"],
        ACTCOLOR : [true], // display pixel activity
        SHOWBORDERS : [true], // diplay cellborders
        
        zoom : 2, // zoom in on canvas with this factor.

    }
}


/*	---------------------------------- */

let num_cells = 100


function initializeGrid(){ 
    if( !this.helpClasses["gm"] ){ this.addGridManipulator() }
    this.buildChannel()
    for( let i = 0; i < num_cells; i++ ){ // adds celss to the grid
        let condition = true
        while(condition == true){
            let random_x = Math.floor( Math.random() * field_size_x ) // this.C.extents[0] is the width of the grid
            let random_y = Math.floor( Math.random() * field_size_y ) // this.C.extents[1] is the height of the grid
            console.log( random_x, random_y )
            
            if( !checkIfCellIsInObstacle(random_x, random_y) ){
                this.gm.seedCellAt( 1, [random_x, random_y] )
                condition = false
            }
        }
    }
}


let num_obstacles = 81 // should be a perfect square

function buildChannel(){ // add a channel of obstacles to the grid
    this.channelvoxels = []
    // set the offset and the distance between the obstacles as integers
    const xOffset = Math.floor(0.5*field_size_x/Math.sqrt(num_obstacles))
    const yOffset = Math.floor(0.5*field_size_y/Math.sqrt(num_obstacles))
    
    const dx = Math.floor( field_size_x/Math.sqrt(num_obstacles))
    const dy = Math.floor( field_size_y/Math.sqrt(num_obstacles) )
    
    const radius = 4
    
    for( let x = xOffset; x < field_size_x; x+= dx ){
        for( let y = yOffset; y < field_size_y; y+= dy ){
            const center = [x,y]
            
            for( let xx = center[0]-radius; xx <= center[0]+radius; xx++ ){
                for( let yy = center[1]-radius; yy <= center[1]+radius; yy++){
                    let dx = Math.abs( xx-center[0] ), dy = Math.abs( yy-center[1] )
                    if( Math.sqrt( dx*dx + dy*dy ) < radius ){
                        this.channelvoxels.push( [xx,yy] )
                    }	
                }
            }
            
        }
    }
    this.C.add( new CPM.BorderConstraint({
        BARRIER_VOXELS : this.channelvoxels
    }) )
}


function drawBelow(){ // draw the channel of obstacles
    this.Cim.drawPixelSet( this.channelvoxels, "AAAAAA" ) 
}


function checkIfCellIsInObstacle( x, y ){
    for ( let i = 0; i <= num_cells; i++ ){ // for the nine obstacles
        for ( let j = 0; j <= num_cells; j++ ){
            // get the x and y of the obstacle
            let obstacle_x = field_size_x*0.15 + i * (field_size_x/Math.sqrt(num_obstacles))
            // 15 is the offset, 33 is the distance between the obstacles
            let obstacle_y = field_size_y*0.15 + j * (field_size_y/Math.sqrt(num_obstacles))
            // 15 is the offset, 33 is the distance between the obstacles

            // check if the cell is in the obstacle; the obstacle are a circle of radius 10
            if( Math.pow( x - obstacle_x, 2 ) + Math.pow( y - obstacle_y, 2 ) < Math.pow( 10, 2 ) ){
                console.log( "cell in obstacle" )
                return true
            }

        }
    }
    console.log( "cell not in obstacle" )
    return false
}


function step(){
    for (let s = 0; s < config.simsettings.IMGFRAMERATE; s++) {
        meter.tick()
        sim.step()
    }
    requestAnimationFrame(step)
}


function initialize(){
    let custommethods = 

    sim = new CPM.Simulation( config, custommethods )
    sim.Cim = new CPM.Canvas( sim.C, {
        zoom:sim.conf.zoom, 
        parentElement : document.getElementById("sim")
    } )
    sim.helpClasses[ "canvas" ] = true
    meter = new FPSMeter({left:"auto", right:"5px"})

    step()
}
let sim = new CPM.Simulation(config, {
    initializeGrid : initializeGrid,
    buildChannel : buildChannel,
    drawBelow : drawBelow
})
sim.run()
