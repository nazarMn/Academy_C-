import { useState, useEffect } from 'react';
import { Shield, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui';
import useAppStore from '@/stores/useAppStore';

/**
 * Non-intrusive popup that appears after 2+ completed lessons.
 * Encourages guest users to create an account to save progress.
 */
export default function SoftConversionPopup() {
  const [visible, setVisible] = useState(false);
  const {
    isGuest,
    completedLessons,
    softConversionDismissed,
    dismissSoftConversion,
    markSoftConversionShown,
    openAuthModal,
  } = useAppStore();

  useEffect(() => {
    // Show after 2 completed lessons, only for guests, only once
    if (
      isGuest &&
      completedLessons.length >= 2 &&
      !softConversionDismissed
    ) {
      const timer = setTimeout(() => {
        setVisible(true);
        markSoftConversionShown();
      }, 3000); // Delay 3s after condition met
      return () => clearTimeout(timer);
    }
  }, [isGuest, completedLessons.length, softConversionDismissed, markSoftConversionShown]);

  const handleDismiss = () => {
    setVisible(false);
    dismissSoftConversion();
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm animate-slide-up">
      <div className="bg-surface-900 border border-surface-700 rounded-xl p-5 shadow-elevated">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
            <Shield size={20} className="text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-surface-50 mb-1">
              Збережіть ваш прогрес
            </h3>
            <p className="text-xs text-surface-400 leading-relaxed mb-3">
              Ви вже пройшли {completedLessons.length} уроки! Створіть акаунт, щоб зберегти код та прогрес назавжди.
            </p>
            <div className="flex gap-2">
              <Button size="sm" className="gap-1.5 text-xs" onClick={() => {
                openAuthModal();
                setVisible(false);
              }}>
                Створити акаунт
                <ArrowRight size={12} />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDismiss} className="text-xs">
                Пізніше
              </Button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-surface-600 hover:text-surface-400 transition-colors flex-shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
