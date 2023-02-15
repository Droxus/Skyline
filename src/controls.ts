import * as THREE from 'three';
import * as main from './main'

export let cube: any

export function createCube(){
  cube = new THREE.Mesh( new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({color: 'grey'}))
  main.scene.add( cube );
  cube.position.set(0, 0, -5)
  cube.rotation.set(0, Math.PI/4, 0)
}