import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import './TapToEarn.css';

const TapToEarn = () => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const [userData, setUserData] = useState({ dubaiCoin: 0, energy: 1000, level: 1 });
  const [error, setError] = useState('');
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    window.Telegram.WebApp.ready();
    const id = window.Telegram.WebApp.initDataUnsafe.user?.id;
    if (!id) {
      setError('Foydalanuvchi ID topilmadi');
      return;
    }
    setUserId(id);

    // Three.js sahna sozlamalari
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Fon rasmi
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      '/ocean-background.jpg',
      (texture) => {
        scene.background = texture;
      },
      undefined,
      (error) => {
        console.error('Fon rasmi yuklashda xato:', error);
        setError('Fon rasmi yuklanmadi');
      }
    );

    // Burj Khalifa modeli
    const loader = new GLTFLoader();
    loader.load(
      '/burjKhalifa.glb',
      (gltf) => {
        const model = gltf.scene;
        model.scale.set(0.01, 0.01, 0.01);
        model.position.set(0, -1, 0);
        scene.add(model);
      },
      undefined,
      (error) => {
        console.error('Model yuklashda xato:', error);
        setError('Model yuklanmadi');
      }
    );

    // Yoritish
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 1, 1);
    scene.add(directionalLight);

    camera.position.z = 5;

    // Animatsiya
    const animate = () => {
      if (!sceneRef.current) return; // Sahna o‘chirilgan bo‘lsa animatsiyani to‘xtatish
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Dastlabki ma'lumotlarni yuklash
    const loadUserData = async () => {
      if (!id) return;
      try {
        const response = await fetch('https://dubai-city-backend.onrender.com/api/tap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: id })
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Server xatosi: ${response.status} - ${errorText}`);
        }
        const data = await response.json();
        if (data.user) {
          setUserData(data.user);
        } else {
          throw new Error('Foydalanuvchi ma\'lumotlari topilmadi');
        }
      } catch (err) {
        console.error('Ma\'lumot yuklashda xato:', err);
        setError('Ma\'lumot yuklashda xato: ' + err.message);
      }
    };
    loadUserData();

    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current.removeChild(renderer.domElement);
      renderer.dispose();
      sceneRef.current = null;
    };
  }, []);

  const handleTap = async () => {
    if (!userId) {
      setError('Foydalanuvchi ID topilmadi');
      return;
    }

    try {
      const response = await fetch('https://dubai-city-backend.onrender.com/api/tap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server xatosi: ${response.status} - ${errorText}`);
      }
      const data = await response.json();
      if (data.user) {
        setUserData(data.user);
        setError('');
      } else {
        throw new Error('Foydalanuvchi ma\'lumotlari topilmadi');
      }
    } catch (err) {
      console.error('Teginishda xato:', err);
      setError('Teginishda xato: ' + err.message);
    }
  };

  return (
    <div className="tap-to-earn">
      <div ref={mountRef} className="three-scene"></div>
      <div className="overlay">
        <h1>Dubai City - Tap to Earn</h1>
        <p>DubaiCoin: {userData.dubaiCoin}</p>
        <p>Energy: {userData.energy}</p>
        <p>Level: {userData.level}</p>
        {error && <p className="error">{error}</p>}
        <button onClick={handleTap}>Tap!</button>
      </div>
    </div>
  );
};

export default TapToEarn;