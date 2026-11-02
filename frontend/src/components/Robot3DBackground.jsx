import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  Center,
  useGLTF,
} from "@react-three/drei";

import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

import "./Robot3DBackground.css";


// =========================================================
// ROBOT MATERIAL
// =========================================================

function applyRobotMaterial(scene) {
  scene.traverse((child) => {
    if (!child.isMesh) return;

    child.material = child.material.clone();

    child.material.color.set("#111111");
    child.material.roughness = 0.28;
    child.material.metalness = 0.75;
    child.material.envMapIntensity = 1.5;
  });
}


// =========================================================
// SHORTEST ANGLE INTERPOLATION
// =========================================================

function lerpAngle(current, target, amount) {
  const difference =
    ((target - current + Math.PI) % (Math.PI * 2)) -
    Math.PI;

  return current + difference * amount;
}


// =========================================================
// ROBOT MODEL
// =========================================================

function RobotModel() {
  const robotRef = useRef(null);

  const { scene } = useGLTF("/models/robot.glb");

  const location = useLocation();

  const mouseX = useRef(0);
  const mouseY = useRef(0);

  const scrollProgress = useRef(0);


  // =======================================================
  // CURRENT ANIMATED VALUES
  // =======================================================

  const current = useRef({
    x: 0,
    y: -0.4,
    z: 0,

    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,

    scale: 0.85,
  });


  // =======================================================
  // APPLY ROBOT MATERIAL
  // =======================================================

  useEffect(() => {
    applyRobotMaterial(scene);
  }, [scene]);


  // =======================================================
  // MOUSE MOVEMENT
  // =======================================================

  useEffect(() => {
    const handleMouseMove = (event) => {
      mouseX.current =
        (event.clientX / window.innerWidth - 0.5) * 2;

      mouseY.current =
        (event.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener(
      "mousemove",
      handleMouseMove,
      {
        passive: true,
      }
    );

    return () => {
      window.removeEventListener(
        "mousemove",
        handleMouseMove
      );
    };
  }, []);


  // =======================================================
  // SCROLL TRACKING
  // =======================================================

  useEffect(() => {
    const handleScroll = () => {
      const maxScroll =
        document.documentElement.scrollHeight -
        window.innerHeight;

      const progress =
        maxScroll > 0
          ? window.scrollY / maxScroll
          : 0;

      scrollProgress.current = progress;
    };

    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      }
    );

    handleScroll();

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, []);


  // =======================================================
  // PAGE ROBOT CONFIGURATION
  // =======================================================

  const getRobotSettings = () => {
    switch (location.pathname) {

      // ===================================================
      // HOME
      // CENTER
      // ===================================================

      case "/":
        return {
          x: 0,
          y: -0.4,
          z: 0,

          rotationX: 0,
          rotationY: Math.PI * 3,
          rotationZ: 0,

          scale: 0.78,
        };


      // ===================================================
      // ABOUT
      // LEFT
      // ===================================================

      case "/about":
        return {
          x: -1.65,
          y: -0.4,
          z: 0,

          rotationX: 0,
          rotationY: Math.PI * 3.25,
          rotationZ: 0.02,

          scale: 0.78,
        };


      // ===================================================
      // EDUCATION
      // CENTER
      // ===================================================

      case "/education":
        return {
          x: 0,
          y: -0.35,
          z: 0,

          rotationX: 0,
          rotationY: Math.PI * 3.5,
          rotationZ: 0,

          scale: 0.72,
        };


      // ===================================================
      // SKILLS
      // RIGHT
      // ===================================================

      case "/skills":
        return {
          x: 1.55,
          y: -0.4,
          z: 0,

          rotationX: 0,
          rotationY: Math.PI * 3.75,
          rotationZ: -0.03,

          scale: 0.8,
        };


      // ===================================================
      // PROJECTS
      // LEFT
      // ===================================================

      case "/projects":
        return {
          x: -1.5,
          y: -0.45,
          z: 0,

          rotationX: 0,
          rotationY: Math.PI * 4,
          rotationZ: 0.03,

          scale: 0.82,
        };


      // ===================================================
      // RESUME
      // RIGHT
      // ===================================================

      case "/resume":
        return {
          x: 1.3,
          y: -0.35,
          z: 0,

          rotationX: 0,
          rotationY: Math.PI * 4.25,
          rotationZ: -0.02,

          scale: 0.76,
        };


      // ===================================================
      // CONTACT
      // CENTER
      // ===================================================

      case "/contact":
        return {
          x: 0,
          y: -0.4,
          z: 0,

          rotationX: 0,
          rotationY: Math.PI * 4.5,
          rotationZ: 0,

          scale: 0.78,
        };


      // ===================================================
      // DEFAULT
      // ===================================================

      default:
        return {
          x: 0,
          y: -0.4,
          z: 0,

          rotationX: 0,
          rotationY: Math.PI * 3,
          rotationZ: 0,

          scale: 0.8,
        };
    }
  };


  // =======================================================
  // ANIMATION LOOP
  // =======================================================

  useFrame((state, delta) => {
    if (!robotRef.current) return;

    const target = getRobotSettings();

    const scroll = scrollProgress.current;

    const time = state.clock.elapsedTime;


    // =====================================================
    // SMOOTHING
    // =====================================================

    const smooth =
      1 - Math.pow(0.001, delta);


    // =====================================================
    // MOUSE PARALLAX
    // =====================================================

    const mouseOffsetX =
      mouseX.current * 0.12;

    const mouseOffsetY =
      -mouseY.current * 0.08;


    // =====================================================
    // IDLE MOVEMENT
    // =====================================================

    const idleY =
      Math.sin(time * 1.2) * 0.035;

    const idleX =
      Math.cos(time * 0.7) * 0.015;


    // =====================================================
    // SCROLL MOVEMENT
    // =====================================================

    const scrollY =
      scroll * 0.18;

    const scrollZ =
      scroll * 0.25;


    // =====================================================
    // TARGET POSITION
    // =====================================================

    const targetX =
      target.x +
      mouseOffsetX +
      idleX;

    const targetY =
      target.y +
      mouseOffsetY +
      idleY -
      scrollY;

    const targetZ =
      target.z +
      mouseX.current * 0.08 -
      scrollZ;


    // =====================================================
    // POSITION SMOOTHING
    // =====================================================

    current.current.x +=
      (targetX - current.current.x) *
      smooth;

    current.current.y +=
      (targetY - current.current.y) *
      smooth;

    current.current.z +=
      (targetZ - current.current.z) *
      smooth;


    robotRef.current.position.set(
      current.current.x,
      current.current.y,
      current.current.z
    );


    // =====================================================
    // SCROLL ROTATION
    // =====================================================

    const scrollRotation =
      scroll * Math.PI * 0.35;


    // =====================================================
    // ROTATION X
    // =====================================================

    current.current.rotationX =
      lerpAngle(
        current.current.rotationX,
        target.rotationX,
        smooth
      );


    // =====================================================
    // ROTATION Y
    // =====================================================

    current.current.rotationY =
      lerpAngle(
        current.current.rotationY,
        target.rotationY +
          scrollRotation,
        smooth
      );


    // =====================================================
    // ROTATION Z
    // =====================================================

    current.current.rotationZ =
      lerpAngle(
        current.current.rotationZ,
        target.rotationZ,
        smooth
      );


    // =====================================================
    // SCROLL TILT
    // =====================================================

    const scrollTilt =
      Math.sin(scroll * Math.PI) *
      0.08;


    // =====================================================
    // APPLY ROTATION
    // =====================================================

    robotRef.current.rotation.set(
      current.current.rotationX +
        scrollTilt,

      current.current.rotationY,

      current.current.rotationZ
    );


    // =====================================================
    // SCALE
    // =====================================================

    current.current.scale +=
      (target.scale -
        current.current.scale) *
      smooth;


    robotRef.current.scale.setScalar(
      current.current.scale
    );
  });


  // =======================================================
  // ROBOT
  // =======================================================

  return (
    <group ref={robotRef}>
      <Center>
        <primitive object={scene} />
      </Center>
    </group>
  );
}


// =========================================================
// 3D BACKGROUND
// =========================================================

function Robot3DBackground() {
  return (
    <div className="robot-3d-background">

      <Canvas
        camera={{
          position: [0, 0, 7],
          fov: 50,
        }}
        dpr={[1, 2]}
      >

        {/* ============================================= */}
        {/* LIGHTING */}
        {/* ============================================= */}

        <ambientLight
          intensity={1.2}
        />

        <directionalLight
          position={[5, 6, 5]}
          intensity={3}
        />

        <directionalLight
          position={[-5, 2, 4]}
          intensity={1.8}
        />

        <pointLight
          position={[0, 1, 5]}
          intensity={1.5}
        />


        {/* ============================================= */}
        {/* ROBOT */}
        {/* ============================================= */}

        <RobotModel />


        {/* ============================================= */}
        {/* ENVIRONMENT */}
        {/* ============================================= */}

        <Environment
          preset="studio"
        />

      </Canvas>

    </div>
  );
}


// =========================================================
// PRELOAD ROBOT
// =========================================================

useGLTF.preload(
  "/models/robot.glb"
);


export default Robot3DBackground;