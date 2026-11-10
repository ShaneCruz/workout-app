'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PRCelebrationProps {
  show: boolean;
  previousWeight: number | null;
  newWeight: number;
  onDismiss: () => void;
}

export default function PRCelebration({ show, previousWeight, newWeight, onDismiss }: PRCelebrationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss();
      }, 2500);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [show, onDismiss]);

  const handleTap = () => {
    setVisible(false);
    onDismiss();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed inset-0 z-[60] flex items-center justify-center cursor-pointer"
          onClick={handleTap}
        >
          <div className="bg-success/90 rounded-3xl px-10 py-8 text-center">
            <p className="text-5xl font-black text-white mb-2">NEW PR!</p>
            <p className="text-xl text-white/90">
              {newWeight} lbs
              {previousWeight && (
                <span className="text-white/70"> (was {previousWeight})</span>
              )}
            </p>
            <p className="text-sm text-white/60 mt-3">Tap to dismiss</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
