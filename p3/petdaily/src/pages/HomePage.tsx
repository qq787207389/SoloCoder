import React, { useState, useEffect } from 'react';
import type { Pet, User } from '../types.ts';
import { api } from '../services/api';
import Header from '../components/layout/Header';
import BottomNav from '../components/layout/BottomNav';
import PetCard from '../components/pets/PetCard';
import PetForm from '../components/pets/PetForm';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';

const HomePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [userRes, petsRes] = await Promise.all([
        api.getCurrentUser(),
        api.getPets(),
      ]);
      setUser(userRes.user);
      setPets(petsRes.pets.filter((p) => p.userId === userRes.user?.id));
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPet = async (petData: Omit<Pet, 'id'>) => {
    try {
      await api.createPet(petData as Omit<Pet, 'id'>);
      setShowAddModal(false);
      loadData();
    } catch (error) {
      console.error('Failed to add pet:', error);
    }
  };

  const handleEditPet = async (petData: Partial<Pet>) => {
    if (!editingPet) return;
    try {
      await api.updatePet(editingPet.id, petData);
      setEditingPet(null);
      loadData();
    } catch (error) {
      console.error('Failed to update pet:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-pink-500 text-lg">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary pb-20">
      <Header title="毛孩子日记" />
      
      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              👋 欢迎回来，{user?.name}
            </h2>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">我的宝贝</h3>
          <Button size="sm" onClick={() => setShowAddModal(true)}>
            <span>+</span> 添加宠物
          </Button>
        </div>

        {pets.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🐾</div>
            <p className="text-gray-500 mb-4">还没有添加宠物哦</p>
            <Button onClick={() => setShowAddModal(true)}>
              添加第一个毛孩子
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {pets.map((pet) => (
              <PetCard
                key={pet.id}
                pet={pet}
                showEdit
                onEdit={() => setEditingPet(pet)}
              />
            ))}
          </div>
        )}
      </main>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="添加新宠物"
      >
        {user && (
          <PetForm
            userId={user.id}
            onSubmit={handleAddPet}
            onCancel={() => setShowAddModal(false)}
          />
        )}
      </Modal>

      <Modal
        isOpen={!!editingPet}
        onClose={() => setEditingPet(null)}
        title="编辑宠物信息"
      >
        {editingPet && user && (
          <PetForm
            pet={editingPet}
            userId={user.id}
            onSubmit={handleEditPet}
            onCancel={() => setEditingPet(null)}
          />
        )}
      </Modal>

      <BottomNav />
    </div>
  );
};

export default HomePage;
