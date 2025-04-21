import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

function TapToEarn() {
  const [user, setUser] = useState({ dubaiCoin: 0, energy: 1000, maxEnergy: 1000, level: 1 });
  const canvasRef = useRef(null);
  const coinsRef = useRef([]);
  let scene, coinMaterial;

  const userId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id || '123';

  const handleTap = async () => {
    try {
      const response = await fetch('https://dubai-city-backend.onrender.com/api/tap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (!response.ok) {
        throw new Error(`HTTP xato: ${response.status}`);
      }
      const data = await response.json();
      if (!data.user) {
        throw new Error('Backenddan "user" ma\'lumotlari qaytmadi');
      }
      setUser(data.user);
      addCoin();
    } catch (error) {
      console.error('Tap error:', error);
    }
  };

  const addCoin = () => {
    if (coinsRef.current.length >= 20) return;
    const coin = new THREE.Sprite(coinMaterial);
    coin.scale.set(0.2, 0.2, 0.2);
    coin.position.set((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, 0);
    scene.add(coin);
    coinsRef.current.push({
      sprite: coin,
      velocity: new THREE.Vector3((Math.random() - 0.5) * 0.02, 0.05, 0),
      life: 1,
    });
  };

  useEffect(() => {
    scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const loader = new GLTFLoader();
    loader.load(
      '/burjKhalifa.glb',
      (gltf) => {
        if (!gltf.scene) {
          console.error('Modelda scene topilmadi');
          return;
        }
        const model = gltf.scene;
        model.scale.set(0.01, 0.01, 0.01);
        model.position.set(0, -1, 0);
        scene.add(model);
      },
      undefined,
      (error) => {
        console.error('Model yuklashda xato:', error);
      }
    );

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);
    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(0, 2, 2);
    scene.add(pointLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    camera.position.z = 3;

    const coinTexture = new THREE.TextureLoader().load('/coin.png');
    coinMaterial = new THREE.SpriteMaterial({ map: coinTexture });

    const animateCoins = () => {
      coinsRef.current = coinsRef.current.filter((coin) => {
        coin.sprite.position.add(coin.velocity);
        coin.life -= 0.02;
        coin.sprite.scale.set(0.2 * coin.life, 0.2 * coin.life, 0.2 * coin.life);
        coin.sprite.rotation.z += 0.1;
        if (coin.life <= 0) {
          scene.remove(coin.sprite);
          return false;
        }
        return true;
      });
    };

    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();
      animateCoins();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      renderer.dispose();
    };
  }, []);

  return (
    <div
      className="flex flex-col items-center p-4 text-white min-h-screen"
      style={{
        backgroundImage: `url('/ocean-background.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <canvas ref={canvasRef} className="w-full h-64 mb-4" />
      <h1 className="text-2xl mb-4">Dubai City - Tap to Earn</h1>
      <p>DubaiCoin: {user.dubaiCoin}</p>
      <p>Energiya: {user.energy}/{user.maxEnergy}</p>
      <p>Daraja: {user.level}</p>
      <button
        onClick={handleTap}
        className="mt-4 px-6 py-2 bg-blue-600 rounded-lg text-white"
      >
        Tap!
      </button>
    </div>
  );
}

export default TapToEarn;