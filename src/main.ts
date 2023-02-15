import './style.css'

import * as Controls from './controls'

import * as THREE from 'three';

export const scene = new THREE.Scene();

export const camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 1000 );

export const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

Controls.createCube()

animate();
function animate() {
    requestAnimationFrame(animate)

    // camera.position.x = playerModel.position.x
    // camera.position.y = playerModel.position.y + playerModel.geometry.parameters.height/2 * playerModel.scale.y
    // camera.position.z = playerModel.position.z

    Controls.cube.rotation.x += 0.01;
    Controls.cube.rotation.y += 0.01;
    renderer.render( scene, camera );
};

window.addEventListener('resize', onResize)
document.oncontextmenu = document.body.oncontextmenu = function() {return false;}
window.addEventListener('beforeunload', function(e){
  e.stopPropagation();e.preventDefault();return false;
},true);

function onResize(){
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );
}
