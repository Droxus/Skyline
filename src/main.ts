import './style.css'

import * as Controls from './controls'

import * as Sky from './Sky'

import * as THREE from 'three';
import { OBB } from 'three/examples/jsm/math/OBB'

export const scene = new THREE.Scene();

export const camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.set(0, 2, 0)
camera.rotation.order = 'YXZ'

export const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.toneMapping = THREE.LinearToneMapping
renderer.toneMappingExposure = 1
renderer.shadowMap.enabled = true
document.body.appendChild( renderer.domElement );

export let playerModel: any
createPlayerModel()
createFloor()
Controls.createCube()
Controls.setFullScreen()
Sky.initSky()
// Controls.addGameControls()

animate();
function animate() {
    requestAnimationFrame(animate)

    camera.position.x = playerModel.position.x
    camera.position.y = playerModel.position.y + playerModel.geometry.parameters.height/2 * playerModel.scale.y - 0.1
    camera.position.z = playerModel.position.z

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

function createFloor(){
  const floor = new THREE.Mesh( new THREE.BoxGeometry(2000, 3, 2000), new THREE.MeshBasicMaterial( { color: '#2b2b2b' } ) );
  floor.position.set(0,-1.55,0)
  scene.add( floor );
  floor.receiveShadow = true
  floor.castShadow = true
}

function createPlayerModel(){
  playerModel = new THREE.Mesh(  new THREE.BoxGeometry( 2, 4, 2 ), new THREE.MeshBasicMaterial( {color: 'aqua', visible: true, wireframe: true} ) );
  playerModel.position.set(0, 2, -2)
  playerModel.name = "playermodel"
  playerModel.geometry.computeBoundingBox()
  if (playerModel.geometry.boundingBox){
    playerModel.geometry.userData.obb = new OBB().fromBox3(
        playerModel.geometry.boundingBox
    )
  }
  playerModel.userData.obb = new OBB()
  scene.add(playerModel)
}