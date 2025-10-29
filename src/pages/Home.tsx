// === 📁 src/pages/Home.tsx ===
// Home page with module selection

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '@/services/db';

interface Module {
  id: string;
  title: string;
  icon: string;
  description: string;
  path: string;
  color: string;
}

const modules: Module[] = [
  {
    id: 'receiving',
    title: 'Приход',
    icon: '📦',
    description: 'Перемещение товаров между ячейками',
    path: '/receiving',
    color: 'bg-[#daa420]',
  },
  {
    id: 'inventory',
    title: 'Остатки',
    icon: '📊',
    description: 'Перемещение товаров между ячейками',
    path: '/inventory',
    color: 'bg-[#fea079]',
  },
  {
    id: 'picking',
    title: 'Подбор',
    icon: '🚚',
    description: 'Перемещение товаров между ячейками',
    path: '/picking',
    color: 'bg-[#f3a361]',
  },
  {
    id: 'placement',
    title: 'Учёт',
    icon: '📝',
    description: 'Перемещение товаров между ячейками',
    path: '/placement',
    color: 'bg-[#86e0cb]',
  },
  {
    id: 'shipment',
    title: 'Документооборот',
    icon: '📄',
    description: 'Перемещение товаров между ячейками',
    path: '/shipment',
    color: 'bg-[#91ed91]',
  },
  {
    id: 'return',
    title: 'Штрихкоды',
    icon: '📷',
    description: 'Перемещение товаров между ячейками',
    path: '/return',
    color: 'bg-[#ba8f8e]',
  },
];

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    receiving: 0,
    placement: 0,
    picking: 0,
    shipment: 0,
    return: 0,
    inventory: 0,
    total: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const receivingCount = await db.receivingDocuments.count();
      const placementCount = await db.placementDocuments.count();
      const pickingCount = await db.pickingDocuments.count();
      const shipmentCount = await db.shipmentDocuments.count();
      const returnCount = await db.returnDocuments.count();
      const inventoryCount = await db.inventoryDocuments.count();

      const total = receivingCount + placementCount + pickingCount + 
                    shipmentCount + returnCount + inventoryCount;

      setStats({
        receiving: receivingCount,
        placement: placementCount,
        picking: pickingCount,
        shipment: shipmentCount,
        return: returnCount,
        inventory: inventoryCount,
        total,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Карточка всех документов */}
      <button
        onClick={() => navigate('/documents')}
        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-left hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg"
      >
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
              <span className="text-3xl">📋</span>
              Все документы
            </h2>
            <p className="text-sm text-blue-100 opacity-90">
              Просмотр, поиск и фильтрация всех документов склада
            </p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold text-white">
              {stats.total}
            </div>
            <div className="text-xs text-blue-100 opacity-80 mt-1">
              документов
            </div>
          </div>
        </div>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Первая карточка - большая */}
        <button
          onClick={() => navigate(modules[0].path)}
          className={`${modules[0].color} rounded-lg p-6 text-left hover:opacity-90 transition-all relative overflow-hidden h-64 flex flex-col justify-between`}
        >
          <div>
            <h2 className="text-3xl font-bold text-[#725a1e] mb-3">
              {modules[0].title}
            </h2>
            <p className="text-sm text-[#725a1e] opacity-90 max-w-[160px] leading-relaxed">
              {modules[0].description}
            </p>
          </div>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs text-[#725a1e] opacity-80">Документов:</p>
            </div>
            <p className="text-5xl font-normal text-white tracking-tight">
              {stats.receiving}
            </p>
          </div>
        </button>

        {/* Вторая и третья карточки - справа */}
        <div className="space-y-4">
          <button
            onClick={() => navigate(modules[1].path)}
            className={`${modules[1].color} rounded-lg p-6 text-left hover:opacity-90 transition-all w-full h-[calc(50%-0.5rem)] flex flex-col justify-between`}
          >
            <div>
              <h2 className="text-2xl font-bold text-[#8c533b] mb-2">
                {modules[1].title}
              </h2>
              <p className="text-xs text-[#8c533b] opacity-80 max-w-[140px] leading-relaxed">
                {modules[1].description}
              </p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-normal text-white tracking-tight">
                {stats.inventory}
              </p>
            </div>
          </button>

          <button
            onClick={() => navigate(modules[2].path)}
            className={`${modules[2].color} rounded-lg p-6 text-left hover:opacity-90 transition-all w-full h-[calc(50%-0.5rem)] flex flex-col justify-between`}
          >
            <div>
              <h2 className="text-2xl font-bold text-[#8b5931] mb-2">
                {modules[2].title}
              </h2>
              <p className="text-xs text-[#8b5931] opacity-80 max-w-[140px] leading-relaxed">
                {modules[2].description}
              </p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-normal text-white tracking-tight">
                {stats.picking}
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Средняя секция */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => navigate(modules[3].path)}
          className="border border-[#474747] rounded-lg p-5 text-left hover:bg-[#474747] hover:bg-opacity-20 transition-all h-24 flex justify-between items-start"
        >
          <div>
            <h3 className="text-lg font-bold text-[#86e0cb] mb-1">
              {modules[3].title}
            </h3>
            <p className="text-[10px] text-[#a7a7a7] leading-tight max-w-[130px]">
              {modules[3].description}
            </p>
          </div>
          <p className="text-2xl text-[#a7a7a7] font-normal">
            {stats.placement}
          </p>
        </button>

        <button
          onClick={() => navigate(modules[4].path)}
          className="border border-[#474747] rounded-lg p-5 text-left hover:bg-[#474747] hover:bg-opacity-20 transition-all h-24 flex justify-between items-start"
        >
          <div>
            <h3 className="text-lg font-bold text-[#91ed91] mb-1">
              {modules[4].title}
            </h3>
            <p className="text-[10px] text-[#a7a7a7] leading-tight max-w-[130px]">
              {modules[4].description}
            </p>
          </div>
          <p className="text-2xl text-[#a7a7a7] font-normal">
            {stats.shipment}
          </p>
        </button>
      </div>

      {/* Нижняя секция */}
      <div className="border border-[#474747] rounded-lg p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-[#ba8f8e] mb-1">
              {modules[5].title}
            </h3>
            <p className="text-[10px] text-[#a7a7a7] leading-tight">
              {modules[5].description}
            </p>
          </div>
          <button
            onClick={() => navigate(modules[5].path)}
            className="text-2xl text-[#a7a7a7] font-normal hover:text-white transition-colors"
          >
            {stats.return}
          </button>
        </div>
      </div>

      {/* Перемещения */}
      <div>
        <h3 className="text-xl text-[grey] mb-4">Перемещения</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="border border-[#474747] rounded-lg p-5 h-32 flex flex-col justify-between">
            <div>
              <h4 className="text-base font-bold text-[#f0e78d] mb-2">По складам</h4>
              <p className="text-[10px] text-[#a7a7a7] leading-tight max-w-[130px]">
                Перемещение товаров между ячейками
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl text-[#a7a7a7] font-normal">72</p>
            </div>
          </div>

          <div className="border border-[#474747] rounded-lg p-5 h-32 flex flex-col justify-between">
            <div>
              <h4 className="text-base font-bold text-[burlywood] mb-2">По ячейкам</h4>
              <p className="text-[10px] text-[#a7a7a7] leading-tight max-w-[130px]">
                Перемещение товаров между ячейками
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl text-[#a7a7a7] font-normal">1</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

