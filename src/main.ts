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
renderer.shadowMap.type = THREE.PCFSoftShadowMap
document.body.appendChild( renderer.domElement );

export let playerModel: any, collisionResponsiveObjects: any = []
createPlayerModel()
createFloor()
createWall()
createSphere()
Controls.createCube()
Controls.setFullScreen()
Sky.initSky()
addLighting()
// Controls.addGameControls()

animate();
function animate() {
    requestAnimationFrame(animate)

  if (Controls.isFPScamera){
    camera.position.x = playerModel.position.x
    camera.position.y = playerModel.position.y + playerModel.geometry.parameters.height/2 * playerModel.scale.y - 0.1
    camera.position.z = playerModel.position.z  
  } else {
    activeThirdPersonCamera()
  }

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
  const floor = new THREE.Mesh( new THREE.BoxGeometry(2000, 3, 2000), new THREE.MeshStandardMaterial( { color: '#3e7539' } ) );
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
function addLighting(){
  const light = new THREE.DirectionalLight( 0xffffff, 1 );
  light.position.set( 0, 100, 0 );
  light.castShadow = true;
  scene.add( light );
}
function createWall(){
  let wall = new THREE.Mesh( new THREE.BoxGeometry(20, 10, 20), new THREE.MeshBasicMaterial({color: 'grey', wireframe: false}))
  wall.geometry.computeBoundingBox()
  if (wall.geometry.boundingBox){
    wall.geometry.userData.obb = new OBB().fromBox3(
      wall.geometry.boundingBox
    )
  }
  wall.userData.obb = new OBB()
  scene.add( wall );
  wall.receiveShadow = true
  wall.castShadow = true
  wall.position.set(20, 5, 0)
  collisionResponsiveObjects.push(wall)
  wall.rotation.set(1, 0, 1)
}
function createSphere(){
  const sphere = new THREE.Mesh( new THREE.SphereGeometry( 15, 32, 16 ), new THREE.MeshBasicMaterial( { color: 'grey', wireframe: false } ) );
  sphere.geometry.computeBoundingBox()
  if (sphere.geometry.boundingBox){
    sphere.geometry.userData.obb = new OBB().fromBox3(
      sphere.geometry.boundingBox
    )
  }
  sphere.userData.obb = new OBB()
  scene.add( sphere );
  sphere.receiveShadow = true
  sphere.castShadow = true
  sphere.position.set(-20, 5, 0)
  collisionResponsiveObjects.push(sphere)
  // sphere.rotation.set(1, 0, 1)
  console.log(sphere)
}
function activeThirdPersonCamera(){
    camera.position.y = playerModel.position.y + 2 + 15 * Math.max(Math.min(Math.tan(-camera.rotation.x), 1.5), -0.25)
    camera.position.x = playerModel.position.x + Math.sin(camera.rotation.y) * 20
    camera.position.z = playerModel.position.z + -Math.cos(camera.rotation.y) * -20
}