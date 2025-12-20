import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function WhatsAppButton() {
  const handleClick = () => {
    window.open('https://wa.me/584140257059?text=¡Hola!%20Quiero%20información%20sobre%20sus%20productos', '_blank');
  };

  return (
    <Button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-[#25D366] hover:bg-[#20BD5A] shadow-lg hover:shadow-xl transition-all duration-300 animate-pulse-soft"
      size="icon"
    >
      <MessageCircle className="h-7 w-7 text-white" />
    </Button>
  );
}
