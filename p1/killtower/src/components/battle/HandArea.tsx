import { motion } from 'framer-motion';
import type { Card } from '../../game/types';
import { CardComponent } from '../ui/CardComponent';
import { useGameStore } from '../../store/useGameStore';

interface HandAreaProps {
  cards: Card[];
  isPlayerTurn: boolean;
}

export function HandArea({ cards, isPlayerTurn }: HandAreaProps) {
  const { battle, playCard, selectCard, selectEnemy } = useGameStore();
  const selectedCard = battle?.selectedCard;
  const playerEnergy = battle?.player.energy || 0;

  const handleCardClick = (card: Card) => {
    if (!isPlayerTurn) return;
    if (playerEnergy < card.cost) return;

    if (card.target === 'single') {
      if (selectedCard?.id === card.id) {
        selectCard(null);
      } else {
        selectCard(card);
      }
    } else {
      playCard(card.id);
      selectCard(null);
      selectEnemy(null);
    }
  };

  return (
    <div className="relative w-full flex justify-center items-end perspective-1000">
      <motion.div 
        className="flex items-end justify-center gap-0"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {cards.map((card, index) => {
          const isSelected = selectedCard?.id === card.id;
          const isPlayable = isPlayerTurn && playerEnergy >= card.cost;
          const totalCards = cards.length;
          const midPoint = (totalCards - 1) / 2;
          const offset = index - midPoint;
          const rotation = offset * 3;
          const yOffset = Math.abs(offset) * 8;

          return (
            <motion.div
              key={card.id}
              style={{
                marginLeft: index > 0 ? -40 : 0,
                zIndex: isSelected ? 100 : index,
                transform: `rotate(${rotation}deg)`,
                y: isSelected ? -40 : yOffset
              }}
              className="transition-all duration-200"
            >
              <CardComponent
                card={card}
                onClick={() => handleCardClick(card)}
                isSelected={isSelected}
                isPlayable={isPlayable}
                size="normal"
              />
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
