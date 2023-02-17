import * as THREE from 'three';
// import { OBB } from 'three/examples/jsm/math/OBB'
import * as Main from './main'

export let cube: any

const euler = new THREE.Euler( 0, 0, 0, 'YXZ' );

let sensitivity = 1, maxSpeed = 0.1

let keys: any = 
{
  "KeyW": false,
  "KeyA": false,
  "KeyD": false,
  "KeyS": false,
  "Space": false,
  "ControlLeft": false,
  "ShiftLeft": false
}
export function createCube(){
  cube = new THREE.Mesh( new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({color: 'grey'}))
  Main.scene.add( cube );
  cube.receiveShadow = true
  cube.castShadow = true
  cube.position.set(0, 1, -5)
  cube.rotation.set(0, Math.PI/4, 0)
}
export function addGameControls(){
  window.addEventListener('mousemove', sensetivityControls)
  window.addEventListener('keydown', onKeyboard, false)
  window.addEventListener('keyup', offKeyboard, false)
  Main.playerModel.moving = false
}
export function removeGameControls(){
  window.removeEventListener('mousemove', sensetivityControls)
  window.removeEventListener('keydown', onKeyboard, false)
  window.removeEventListener('keyup', offKeyboard, false)
}
export function setFullScreen(){
  (document.querySelector('canvas') as HTMLElement).addEventListener("click", async () => {
    await (document.querySelector('canvas') as HTMLElement).requestPointerLock();
    addGameControls()
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    }
  });

  document.addEventListener('pointerlockerror', lockError, false);
  document.addEventListener('mozpointerlockerror', lockError, false);
  document.addEventListener('webkitpointerlockerror', lockError, false);

  if ("onpointerlockchange" in document) {
    document.addEventListener('pointerlockchange', lockChangeAlert, false);
  }
}
function lockError() {
  console.log('Menu')
}
function lockChangeAlert() {
  if (document.pointerLockElement === document.querySelector('canvas')) {

  } else {
      console.log('Menu')
      removeGameControls()
  }
}
function sensetivityControls(event: any){
  const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
	const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

  euler.x -= movementY / (1 / sensitivity * 1000)
  euler.y -= movementX / (1 / sensitivity * 1000)

  euler.x = Math.max(Math.min(Math.PI/2, euler.x), -Math.PI/2)
  Main.camera.quaternion.setFromEuler( euler );
}
function onKeyboard(event: any){
  event.preventDefault();
  if (!keys[event.code]){
    keys[event.code] = true
    switch (event.code) {
      case 'KeyW':
        playerMove()
        break;
      case 'KeyA':
        playerMove()
        break;
      case 'KeyS':
        playerMove()
        break;
      case 'KeyD':
        playerMove()
        break;
    }
  }
}
function offKeyboard(event: any){
  event.preventDefault();
  keys[event.code] = false
  if (!keys.KeyW && !keys.KeyA && !keys.KeyS && !keys.KeyD){
    clearInterval(makeMoveSmooth)
    Main.playerModel.moving = false
  }
}
let makeMoveSmooth: any
function playerMove(){
  if (!Main.playerModel.moving){
    makeMoveSmooth = setInterval(() => {
      let speed = (keys.KeyW && keys.KeyA) || (keys.KeyW && keys.KeyD) || (keys.KeyS && keys.KeyA) || (keys.KeyS && keys.KeyD) ? maxSpeed/Math.sqrt(2) : maxSpeed
      if (keys.KeyW){
        Main.playerModel.position.x += Math.sin(Main.camera.rotation.y) * -speed
        Main.playerModel.position.z += Math.cos(Math.PI - Main.camera.rotation.y) * speed
      }
      if (keys.KeyS){
        Main.playerModel.position.x += Math.sin(Main.camera.rotation.y) * speed
        Main.playerModel.position.z += -Math.cos(Main.camera.rotation.y) * -speed
      }
      if (keys.KeyD){
        Main.playerModel.position.x += Math.sin(Main.camera.rotation.y + Math.PI / 2) * speed
        Main.playerModel.position.z += -Math.cos(Main.camera.rotation.y + Math.PI / 2) * -speed
      }
      if (keys.KeyA){
        Main.playerModel.position.x += Math.sin(Main.camera.rotation.y - Math.PI / 2) * speed
        Main.playerModel.position.z += -Math.cos(Main.camera.rotation.y - Math.PI / 2) * -speed
      }
        Main.playerModel.moving = true
    }, 5)
  }
}