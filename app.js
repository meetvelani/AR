import * as THREE from './libs/three125/three.module.js';
import { GLTFLoader } from './libs/three/jsm/GLTFLoader.js';
import { RGBELoader } from './libs/three/jsm/RGBELoader.js';
import { ARButton } from './libs/ARButton.js';
import { LoadingBar } from './libs/LoadingBar.js';
// import { ARButton } from './libs/ARButton.js';
import { CanvasUI } from './libs/CanvasUI.js';
import { XRGestures } from './libs/XRGestures.js';
import { Player } from './libs/Player.js';

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
        function onSessionStart() {
            self.ui.mesh.position.set(0, -0.15, -0.3);
            self.camera.add(self.ui.mesh);
        }

        function onSessionEnd() {
            self.camera.remove(self.ui.mesh);
        }

        // const btn = new ARButton(this.renderer, { onSessionStart, onSessionEnd });



        this.hitTestSourceRequested = false;
        this.hitTestSource = null;

        function onSelect() {
            if (self.chair === undefined) return;

            if (self.reticle.visible) {
                // self.chair.position.setFromMatrixPosition(self.reticle.matrix);
                self.chair.visible = true;
            }
            else{
                self.chair.position.setFromMatrixPosition(self.reticle.matrix);

            }
        }

        this.controller = this.renderer.xr.getController(0);
        this.controller.addEventListener('select', onSelect);

        this.gestures = new XRGestures(this.renderer);


        // *************************************** add gestures ***********************************
        this.gestures.addEventListener('tap', (ev) => {
            console.log('tap',self.chair);
            self.chair.visible = true;


            // alert("tap")
            self.ui.updateElement('info', 'tap');
            self.chair.position.setFromMatrixPosition(self.reticle.matrix);

            
        });
        this.gestures.addEventListener('swipe', (ev) => {
            // alert("dobletapa")
            console.log('swipe',ev);
            self.chair.visible = false;
            console.log('swipe',self.chair.position);
            self.chair.rotation.y += 0.1;
            console.log('swipe',self.chair.position);

            self.ui.updateElement('info', 'tap');
        });
        this.gestures.addEventListener('pan', (ev) => {
            console.log('pan',ev);

            
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

    showChair(id) {
        console.log("dsfgsdfg")
        this.initAR();

        const loader = new GLTFLoader().setPath(this.assetsPath);
        const self = this;

        this.loadingBar.visible = true;

        // Load a glTF resource
        loader.load(
            // resource URL
            `chair${id}.glb`,
            // called when the resource is loaded
            function (gltf) {

                self.scene.add(gltf.scene);
                // self.scene.position.setFromMatrixPosition( self.reticle.matrix );
                self.chair = gltf.scene;

                self.chair.visible = false;

                self.loadingBar.visible = false;

                self.renderer.setAnimationLoop(self.render.bind(self));
            },
            // called while loading is progressing
            function (xhr) {

                self.loadingBar.progress = (xhr.loaded / xhr.total);

            },
            // called when loading has errors
            function (error) {

                console.log('An error happened');

            }
        );
        this.createUI();
    }
    createUI() {

        const config = {
            panelSize: { width: 0.15, height: 0.038 },
            height: 128,
            info: { type: "text" }
        }
        const content = {
            info: "Debug info"
        }

        const ui = new CanvasUI(content, config);

        this.ui = ui;
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
            self.ui.mesh.position.set(0, -0.15, -0.3);
            self.camera.add(self.ui.mesh);


        }
        function onSessionEnded() {
            currentSession.removeEventListener("end", onSessionEnded)
            currentSession = null;
            if (self.chair !== null) {
                self.scene.remove(self.chair);
                self.chair = null
            }
            self.renderer.setAnimationLoop(null);
            self.camera.remove(self.ui.mesh);
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
        if ( this.renderer.xr.isPresenting ){
            this.gestures.update();
            this.ui.update();
        }

        this.renderer.render(this.scene, this.camera);

    }
}

export { App };