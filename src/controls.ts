import * as THREE from 'three';
// import { OBB } from 'three/examples/jsm/math/OBB'
import * as Main from './main'

export let cube: any, isFPScamera: boolean = false

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
  cube = new THREE.Mesh( new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({color: 'grey'}))
  Main.scene.add( cube );
  cube.receiveShadow = true
  cube.castShadow = true
  cube.position.set(0, 2, 0)
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

  let max: number = 0, min: number = 0
  if (isFPScamera){
    max = -Math.PI/2
    min = Math.PI/2
  } else {
    max = -Math.PI/3
    min = Math.PI/6
  }

  euler.x = Math.max(Math.min(min, euler.x), max)
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
      case 'Space':
        makeJump()
        break;
      case 'ControlLeft':
        if (Main.playerModel.scale.y > 0.5){
          makeDuck()
        }
        break;
      case 'KeyC':
        isFPScamera = !isFPScamera
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
  if (event.code == 'ControlLeft'){
    makeDuck()
  }
}
let makeMoveSmooth: any
function playerMove(){
  if (!Main.playerModel.moving){
    makeMoveSmooth = setInterval(() => {
      checkCollision()
      Main.playerModel.prevPosition = {
        x: Main.playerModel.position.x,
        y: Main.playerModel.position.y,
        z: Main.playerModel.position.z
    }
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
        if (!isGrounded()){
          gravityAttraction()
        }
    }, 5)
  }
}
function isGrounded(){
  let downDirection = new THREE.Vector3(0, -1, 0);
  let raycasterPositions = [], intersects: any[] = []
  raycasterPositions.push(new THREE.Vector3( Main.playerModel.position.x + Main.playerModel.geometry.parameters.depth/2, Main.playerModel.position.y, Main.playerModel.position.z + Main.playerModel.geometry.parameters.width/2 ))
  raycasterPositions.push(new THREE.Vector3( Main.playerModel.position.x - Main.playerModel.geometry.parameters.depth/2, Main.playerModel.position.y, Main.playerModel.position.z - Main.playerModel.geometry.parameters.width/2 ))
  raycasterPositions.push(new THREE.Vector3( Main.playerModel.position.x + Main.playerModel.geometry.parameters.depth/2, Main.playerModel.position.y, Main.playerModel.position.z - Main.playerModel.geometry.parameters.width/2 ))
  raycasterPositions.push(new THREE.Vector3( Main.playerModel.position.x - Main.playerModel.geometry.parameters.depth/2, Main.playerModel.position.y, Main.playerModel.position.z + Main.playerModel.geometry.parameters.width/2 ))
  raycasterPositions.push(new THREE.Vector3( Main.playerModel.position.x + Main.playerModel.geometry.parameters.depth/2, Main.playerModel.position.y, Main.playerModel.position.z ))
  raycasterPositions.push(new THREE.Vector3( Main.playerModel.position.x - Main.playerModel.geometry.parameters.depth/2, Main.playerModel.position.y, Main.playerModel.position.z ))
  raycasterPositions.push(new THREE.Vector3( Main.playerModel.position.x, Main.playerModel.position.y, Main.playerModel.position.z + Main.playerModel.geometry.parameters.width/2 ))
  raycasterPositions.push(new THREE.Vector3( Main.playerModel.position.x, Main.playerModel.position.y, Main.playerModel.position.z - Main.playerModel.geometry.parameters.width/2 ))
  raycasterPositions.push(new THREE.Vector3( Main.playerModel.position.x, Main.playerModel.position.y, Main.playerModel.position.z ))
  const raycaster = new THREE.Raycaster();
  raycaster.far = Main.playerModel.geometry.parameters.height/2 * Main.playerModel.scale.y + 0.1
  raycasterPositions.forEach(ray => {
      raycaster.set(ray, downDirection)
      intersects.push(raycaster.intersectObjects( Main.scene.children ))
  })
  intersects = intersects.flat(1)
  intersects = intersects.filter(e => e.distance > raycaster.far * 0.85)
  if (intersects[0]){
    intersects.sort((a, b) => {
        if (a.distance > b.distance) return 1
        if (a.distance < b.distance) return -1
        return 0
    })
    Main.playerModel.position.y += (raycaster.far-0.05) - intersects[0].distance
    return true
  }
  return false
}
let isFuseSpamSpace: boolean, velOfJumpIndex: number, smoothlyJump: any
function makeJump(){
  if (isGrounded() && !isFuseSpamSpace){
    isFuseSpamSpace = true
    velOfJumpIndex = 60
    setTimeout(() => {
        isFuseSpamSpace = false
        clearInterval(smoothlyJump)
        gravityAttraction()
    }, 240)
    smoothlyJump = setInterval(() => {
        --velOfJumpIndex
        Main.playerModel.position.y += 0.002 * velOfJumpIndex
    }, 5)
}
}
let smoothDucking: number | undefined
function makeDuck(){
  clearInterval(smoothDucking)
  if (keys.ControlLeft == true){
      smoothDucking = setInterval(() => {
          if (Main.playerModel.scale.y > 0.5){
              Main.playerModel.scale.y -=  1/50
              Main.playerModel.position.y -= Main.playerModel.geometry.parameters.depth / 50
          } else {
              Main.playerModel.scale.y = 0.5
              clearInterval(smoothDucking)
          }
      }, 5)
  } else {
      smoothDucking = setInterval(() => {
          if (Main.playerModel.scale.y < 1){
              Main.playerModel.scale.y += 1/50
              Main.playerModel.position.y += Main.playerModel.geometry.parameters.depth / 50
          } else {
              Main.playerModel.scale.y = 1
              clearInterval(smoothDucking)
          }
      }, 5)
  }
}
let smoothGravityAttraction: number | undefined, velOfGravityAttractionIndex: number, isGravityAttractioning: boolean
function gravityAttraction(){
    if (!isGrounded() && !isFuseSpamSpace && !isGravityAttractioning){
        clearInterval(smoothGravityAttraction)
        isGravityAttractioning = true
        velOfGravityAttractionIndex = 0
        smoothGravityAttraction = setInterval(() => {
            if (!isGrounded()){
                ++velOfGravityAttractionIndex
                if (Main.playerModel.scale.y > 0.5 && Main.playerModel.scale.y < 1){
                    Main.playerModel.position.y -= 0.002 * velOfGravityAttractionIndex - Main.playerModel.geometry.parameters.depth / 75 
                } else {
                    Main.playerModel.position.y -= 0.002 * velOfGravityAttractionIndex
                }
            } else {
                isGravityAttractioning = false
                clearInterval(smoothGravityAttraction)
            }
        }, 5)
    }
}
function checkCollision(){
  Main.playerModel.userData.obb.copy(Main.playerModel.geometry.userData.obb)
  Main.playerModel.userData.obb.applyMatrix4(Main.playerModel.matrixWorld)
  for (const obj of Main.collisionResponsiveObjects){
      obj.userData.obb.copy(obj.geometry.userData.obb)
      obj.userData.obb.applyMatrix4(obj.matrixWorld)
      if (obj.geometry.type !== "SphereGeometry"){
        if (obj.userData.obb.intersectsOBB(Main.playerModel.userData.obb)) {
            let objectPosition
            if (obj.geometry.boundingBox.max.x > obj.geometry.boundingBox.max.z){
                objectPosition = {x: Main.playerModel.position.x, z: obj.position.z}
            } else if (obj.geometry.boundingBox.max.x < obj.geometry.boundingBox.max.z){
                objectPosition = {x: obj.position.x, z: Main.playerModel.position.z}
            } else {
                objectPosition = {x: obj.position.x, z: obj.position.z}
            }
            let xDiff = Math.abs(Main.playerModel.position.x - objectPosition.x)
            let zDiff = Math.abs(Main.playerModel.position.z - objectPosition.z)
            if (xDiff < zDiff){
                if (Math.abs(Main.playerModel.position.z - obj.position.z) > Math.abs(Main.playerModel.prevPosition.z - obj.position.z)){
                  Main.playerModel.position.set(Main.playerModel.position.x, Main.playerModel.position.y, Main.playerModel.position.z)
                } else {
                    Main.playerModel.position.set(Main.playerModel.position.x, Main.playerModel.position.y, Main.playerModel.prevPosition.z)
                }
            } else if (xDiff > zDiff) {
                if (Math.abs(Main.playerModel.position.x - obj.position.x) > Math.abs(Main.playerModel.prevPosition.x - obj.position.x)){
                    Main.playerModel.position.set(Main.playerModel.position.x, Main.playerModel.position.y, Main.playerModel.position.z)
                } else {
                    Main.playerModel.position.set(Main.playerModel.prevPosition.x, Main.playerModel.position.y, Main.playerModel.position.z)
                }
            } else {
                Main.playerModel.position.set(Main.playerModel.prevPosition.x, Main.playerModel.position.y, Main.playerModel.prevPosition.z)
            }
        }
      } else {
        let distanceToObj = Math.sqrt(Math.pow(Main.playerModel.position.x - obj.position.x, 2) + Math.pow(Main.playerModel.position.y - obj.position.y, 2) + Math.pow(Main.playerModel.position.z - obj.position.z, 2))
        // console.log(distanceToObj)
        if (distanceToObj < obj.geometry.boundingSphere.radius){
          console.log('DETECT')
          let distanceToXObj = Math.sqrt(Math.pow(Main.playerModel.prevPosition.x - obj.position.x, 2) + Math.pow(Main.playerModel.position.y - obj.position.y, 2) + Math.pow(Main.playerModel.position.z - obj.position.z, 2))
          if (distanceToXObj > obj.geometry.boundingSphere.radius){
            Main.playerModel.position.x = Main.playerModel.prevPosition.x
          } else {
            let distanceToZObj = Math.sqrt(Math.pow(Main.playerModel.position.x - obj.position.x, 2) + Math.pow(Main.playerModel.position.y - obj.position.y, 2) + Math.pow(Main.playerModel.prevPosition.z - obj.position.z, 2))
            if (distanceToZObj > obj.geometry.boundingSphere.radius){
              Main.playerModel.position.z = Main.playerModel.prevPosition.z
            } else {
              Main.playerModel.position.set(Main.playerModel.prevPosition.x, Main.playerModel.position.y, Main.playerModel.prevPosition.z)
            }
          }
        }
      }
  }
}