import * as THREE from './libs/three125/three.module.js';
import { GLTFLoader } from './libs/three/jsm/GLTFLoader.js';
import { OBJLoader } from './libs/three/jsm/OBJLoader.js';
import { RGBELoader } from './libs/three/jsm/RGBELoader.js';
import { ARButton } from './libs/ARButton.js';
import { LoadingBar } from './libs/LoadingBar.js';
import { CanvasUI } from './libs/CanvasUI.js';
import { XRGestures } from './libs/XRGestures.js';


class App {
    constructor() {
        const container = document.createElement('div');
        document.body.appendChild(container);

        this.loadingBar = new LoadingBar();
        this.loadingBar.visible = false;

        this.assetsPath = './assets/ar-shop/';

        this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);
        this.camera.position.set(0, 1.6, 0);

        this.scene = new THREE.Scene();

        const ambient = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
        ambient.position.set(0.5, 1, 0.25);
        this.scene.add(ambient);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        container.appendChild(this.renderer.domElement);
        this.setEnvironment();

        this.reticle = new THREE.Mesh(
            new THREE.RingBufferGeometry(0.15, 0.2, 32).rotateX(- Math.PI / 2),
            new THREE.MeshBasicMaterial()
        );

        this.reticle.matrixAutoUpdate = false;
        this.reticle.visible = false;
        this.scene.add(this.reticle);

        this.setupXR();

        window.addEventListener('resize', this.resize.bind(this));

    }

    setupXR() {
        this.renderer.xr.enabled = true;

        //TO DO 1: If navigator includes xr and immersive-ar is supported then show the ar-button class
        if ("xr" in navigator) {
            navigator.xr.isSessionSupported("immersive-ar").then((supported) => {
                if (supported) {
                    const collection = document.getElementById("ar-button");
                    collection.style.display = "block";
                }
            })
        }



        const self = this;

        this.hitTestSourceRequested = false;
        this.hitTestSource = null;

        function onSelect() {
            if (self.chair === undefined) return;

            if (self.reticle.visible) {
                self.chair.position.setFromMatrixPosition(self.reticle.matrix);
                self.chair.visible = true;
            }
        }





        this.controller = this.renderer.xr.getController(0);
        this.controller.addEventListener('select', onSelect);
        this.gestures = new XRGestures(this.renderer);


        // *************************************** add gestures ***********************************
        this.gestures.addEventListener('doubletap', (ev) => {
            // alert('tap', self.chair);
            console.log('tap', self.chair);
            self.chair.visible = true;
            self.chair.position.y = -0.51;
            self.chair.position.setFromMatrixPosition(self.reticle.matrix);
        });

        this.gestures.addEventListener('swipe', (ev) => {
            if (ev.direction === "DOWN") {
                self.chair.position.y -= 0.1
            }
            if (ev.direction === "UP") {
                self.chair.position.y += 0.1
            }
            if (ev.direction === "LEFT") {
                self.chair.position.X += 0.1
            }
            if (ev.direction === "RIGHT") {
                self.chair.position.X += 0.1
            }
        });

        this.gestures.addEventListener('pan', (ev) => {
            if (ev.initialise !== undefined) {
                self.statPosition = self.chair.position.clone()
                console.log('pan', self.statPosition);

            }
            else {
                self.chair.position.X = self.statPosition.x + ev.delta.X * 3;
                self.chair.position.y = self.statPosition.y + ev.delta.y * 3;
                self.chair.position.Z = self.statPosition.z + ev.delta.z * 3;
            }
        });

        this.gestures.addEventListener('pinch', (ev) => {
            try {
                if (0.001 + ev.delta / 30 >0){

                    self.chair.scale.set(0.001 + ev.delta / 30, 0.001 + ev.delta / 30, 0.001 + ev.delta / 30);
                }
            }
            catch (err) {
            }
        });
        this.gestures.addEventListener('rotate', (ev) => {
            try {
                self.chair.rotation.y += ev.theta / 30;
            }
            catch (err) {
            }
        });

        // *************************************** add gestures end***********************************


        this.scene.add(this.controller);
        self.renderer.setAnimationLoop(self.render.bind(self));

    }

    resize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    setEnvironment() {
        const loader = new RGBELoader().setDataType(THREE.UnsignedByteType);
        const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
        pmremGenerator.compileEquirectangularShader();

        const self = this;

        loader.load('./assets/hdr/venice_sunset_1k.hdr', (texture) => {
            const envMap = pmremGenerator.fromEquirectangular(texture).texture;
            pmremGenerator.dispose();

            self.scene.environment = envMap;

        }, undefined, (err) => {
            console.error('An error occurred setting the environment');
        });
    }
    initColor(parent, type, mtl) {
        parent.traverse(o => {
            if (o.name === "Plane032") {
                o.material = mtl;
            }
            console.log("dfg", o.name)
        });
    }

    showChair(id) {
        this.initAR();

        // ********************************** obj loader ****************************
        // const loader = new OBJLoader().setPath(this.assetsPath);
        const loader = new GLTFLoader().setPath(this.assetsPath);

        const self = this;

        const txt = new THREE.TextureLoader().load('img/denim_.jpg');
        txt.repeat.set(12, 13, 13);
        txt.wrapS = THREE.RepeatWrapping;
        txt.wrapT = THREE.RepeatWrapping;
        const new_mtl = new THREE.MeshPhongMaterial({
            map: txt
        });
        // const INITIAL_MTL = new THREE.TextureLoader().load("img/denim_.jpg");
        const INITIAL_MTL = new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 10 });

        const INITIAL_MAP = [
            { childID: "Plane032", mtl: new_mtl },
            { childID: "Object001", mtl: new_mtl },
            { childID: "Object003", mtl: new_mtl },
            { childID: "Object006", mtl: new_mtl },
            { childID: "Box003", mtl: new_mtl }];

        this.loadingBar.visible = true;

        // Load a glTF resource
        loader.load(
            // resource URL
            `s002.glb`,
            // called when the resource is loaded
            function (gltf) {

                self.scene.add(gltf.scene);
                // self.scene.position.setFromMatrixPosition(self.reticle.matrix);

                self.chair = gltf.scene;


                self.chair.visible = false;
                self.chair.scale.set(0.001, 0.001, 0.001);
                self.chair.rotation.y = 4.5;
                self.chair.traverse(o => {
                    if (o.isMesh) {
                        o.castShadow = true;
                        o.receiveShadow = true;
                    }
                });
                // for (let object of INITIAL_MAP) {
                //     self.initColor(self.chair, object.childID, object.mtl);
                // }


                self.loadingBar.visible = false;
                self.renderer.setAnimationLoop(self.render.bind(self));
            },


            // ************************************** obj loader end ******************************
            // called while loading is progressing
            // const loader = new GLTFLoader().setPath(this.assetsPath);
            // const self = this;
            // const txt = new THREE.TextureLoader().load('img/denim_.jpg');


            // txt.repeat.set(3, 3, 3);
            // txt.wrapS = THREE.RepeatWrapping;
            // txt.wrapT = THREE.RepeatWrapping;
            // const new_mtl = new THREE.MeshPhongMaterial({
            //     map: txt
            // });
            // // const new_mtl = new THREE.MeshPhongMaterial({
            // //     color: parseInt(0x89CFF0),
            // //     // shininess: 10
            // //   });
            // // const INITIAL_MTL = new THREE.TextureLoader().load("img/denim_.jpg");
            // const INITIAL_MTL = new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 10 });

            // const INITIAL_MAP = [
            //     { childID: "Plane032", mtl: new_mtl },
            //     { childID: "Object001", mtl: new_mtl },
            //     { childID: "Object003", mtl: new_mtl },
            //     { childID: "Object006", mtl: new_mtl },
            //     { childID: "Box003", mtl: new_mtl }];

            // this.loadingBar.visible = true;
            // loader.load(
            //     // resource URL
            //     `s002.glb`,
            //     // called when the resource is loaded
            //     function (gltf) {

            //         self.scene.add(gltf.scene);
            //         self.scene.position.setFromMatrixPosition(self.reticle.matrix);
            //         self.chair = gltf.scene;

            //         self.chair.visible = false;
            //         self.chair.scale.set(0.001, 0.001, 0.001);
            //         self.chair.rotation.y = 4.5;
            //         for (let object of INITIAL_MAP) {
            //             self.initColor(self.chair, object.childID, object.mtl);
            //         }


            //         self.loadingBar.visible = false;

            //         self.renderer.setAnimationLoop(self.render.bind(self));
            //     },
            function (xhr) {

                self.loadingBar.progress = (xhr.loaded / xhr.total);

            },
            // called when loading has errors
            function (error) {

                console.log(error, 'An error happened');

            }
        );

    }


    initAR() {
        //TO DO 2: Start an AR session
        let currentSession = null;
        const self = this;
        const sessionInit = { requiredFeatures: ["hit-test"] };
        function onSessionStarted(session) {
            session.addEventListener('end', onSessionEnded)

            self.renderer.xr.setReferenceSpaceType('local');
            self.renderer.xr.setSession(session);
            currentSession = session;



        }
        function onSessionEnded() {
            currentSession.removeEventListener("end", onSessionEnded)
            currentSession = null;
            if (self.chair !== null) {
                self.scene.remove(self.chair);
                self.chair = null
            }
            self.renderer.setAnimationLoop(null);
        }
        navigator.xr.requestSession("immersive-ar", sessionInit).then(onSessionStarted);

    }

    requestHitTestSource() {
        const self = this;

        const session = this.renderer.xr.getSession();

        session.requestReferenceSpace('viewer').then(function (referenceSpace) {

            session.requestHitTestSource({ space: referenceSpace }).then(function (source) {

                self.hitTestSource = source;

            });

        });

        session.addEventListener('end', function () {

            self.hitTestSourceRequested = false;
            self.hitTestSource = null;
            self.referenceSpace = null;

        });

        this.hitTestSourceRequested = true;

    }

    getHitTestResults(frame) {
        const hitTestResults = frame.getHitTestResults(this.hitTestSource);

        if (hitTestResults.length) {

            const referenceSpace = this.renderer.xr.getReferenceSpace();
            const hit = hitTestResults[0];
            const pose = hit.getPose(referenceSpace);

            this.reticle.visible = true;
            this.reticle.matrix.fromArray(pose.transform.matrix);

        } else {

            this.reticle.visible = false;

        }

    }

    render(timestamp, frame) {

        if (frame) {
            if (this.hitTestSourceRequested === false) this.requestHitTestSource()

            if (this.hitTestSource) this.getHitTestResults(frame);
        }
        if (this.renderer.xr.isPresenting) {
            this.gestures.update();
            // this.ui.update();
        }

        this.renderer.render(this.scene, this.camera);

    }
}

export { App };
