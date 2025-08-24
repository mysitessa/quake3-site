import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Panel from './PanelContainer';
import axios from 'axios';

export default function ThreeScene() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [openPanels, setOpenPanels] = useState<number[]>([]);
  const [dynamicText, setDynamicText] = useState<string>("Загрузка...");
  const [dynamicText1, setDynamicText1] = useState<string>("Загрузка...");
  const [dynamicText2, setDynamicText2] = useState<string>("Загрузка...");
  const [dynamicText3, setDynamicText3] = useState<string>("Загрузка...");

  const panelData: Record<number, { title: string; text: string }> = {
    1: { title: "Kills", text: dynamicText },
    2: { title: "Players", text: dynamicText1 },
    3: { title: "Matches", text: dynamicText2 },
    4: { title: "Топ Карт", text: dynamicText3 },
    5: { title: "чтото", text: "чтото" },
    6: { title: "чтото", text: "чтото" },
    7: { title: "чтото", text: "чтото" },
    8: { title: "чтото", text: "чтото" }
  };

  // Автообновление данных для панели 1
  useEffect(() => {
    let interval: NodeJS.Timer | null = null;

    if (openPanels.includes(1)) {
      const fetchData = async () => {
        try {
          const res = await axios.get("http://127.0.0.1:5000/kills");
          setDynamicText(`Текущие киллы: ${JSON.stringify(res.data, null, 2)}`);
        } 
        catch (err) {
          setDynamicText("Ошибка получения данных с сервера");
        }
      };

      fetchData();
      interval = setInterval(fetchData, 5000);
    }
    if (openPanels.includes(2)) {
      const fetchData = async () => {
        try {
          const res = await axios.get("http://127.0.0.1:5000/players");
          setDynamicText1(`Количество всех игроков: ${JSON.stringify(res.data, null, 2)}`);
        } 
        catch (err) {
          setDynamicText1("Ошибка получения данных с сервера");
        }
      };

      fetchData();
      interval = setInterval(fetchData, 5000);
    }
    if (openPanels.includes(3)) {
      const fetchData = async () => {
        try {
          const res = await axios.get("http://127.0.0.1:5000/matches");
          setDynamicText2(`Количество всех матчей: ${JSON.stringify(res.data, null, 2)}`);
        } 
        catch (err) {
          setDynamicText2("Ошибка получения данных с сервера");
        }
      };

      fetchData();
      interval = setInterval(fetchData, 5000);
    }
    if (openPanels.includes(4)) {
      const fetchData = async () => {
        try {
          const res = await axios.get("http://127.0.0.1:5000/top_maps");
          const data = res.data;
          const formattedText1 = `
                🥇 ${data["1."]}
      `.trim();
          const formattedText2 = `
                🥈 ${data["2."]}
      `.trim();
          const formattedText3 = `
                🥉 ${data["3."]}
      `.trim();
          
          setDynamicText3(`Топ 3 карты: ${formattedText1}\n ${formattedText2}\n ${formattedText3}`);
        } 
        catch (err) {
          setDynamicText3("Ошибка получения данных с сервера");
        }
      };

      fetchData();
      interval = setInterval(fetchData, 600000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [openPanels]);

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);

    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current!.clientWidth / mountRef.current!.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 2, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current!.clientWidth, mountRef.current!.clientHeight);
    mountRef.current!.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    const loader = new GLTFLoader();
    loader.load('/models/Soldier.glb', (gltf) => {
      const model = gltf.scene;
      model.scale.set(1.5, 1.5, 1.5);
      model.position.y = -1;
      scene.add(model);
    });

    const iconGroup = new THREE.Group();
    const iconCount = 8;
    const radius = 4;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    for (let i = 1; i <= iconCount; i++) {
      const texture = new THREE.TextureLoader().load(`/icons/icon${i}.png`);
      const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
      const sprite = new THREE.Sprite(material);
      sprite.scale.set(1.5, 1.5, 1.5);
      const angle = (i / iconCount) * Math.PI * 2;
      sprite.position.set(Math.cos(angle) * radius, 1, Math.sin(angle) * radius);
      (sprite as any).iconId = i;
      iconGroup.add(sprite);
    }
    scene.add(iconGroup);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      iconGroup.rotation.y = elapsed * 0.3;
      iconGroup.children.forEach((sprite) => {
        sprite.lookAt(camera.position);
      });
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const onClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(iconGroup.children);

      if (intersects.length > 0) {
        const iconId = (intersects[0].object as any).iconId;
        setOpenPanels((prev) =>
          prev.includes(iconId) ? prev.filter((id) => id !== iconId) : [...prev, iconId]
        );
      }
    };

    renderer.domElement.addEventListener('click', onClick);
    return () => {
      mountRef.current!.removeChild(renderer.domElement);
      renderer.domElement.removeEventListener('click', onClick);
    };
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }} ref={mountRef}>
      <div style={{ position: 'absolute', top: 20, right: 20 }}>
        {openPanels.map((id) => (
          <Panel key={id} title={panelData[id]?.title || `Панель ${id}`} text={panelData[id]?.text || "заглушка"} />
        ))}
      </div>
    </div>
  );
}
