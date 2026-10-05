import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { openWhatsAppOrder, OrderItem, CustomerDetails } from '../lib/whatsappService';
import { toast } from 'react-hot-toast';

export const useWhatsAppOrder = () => {
  const { user, userData, updateProfile } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingItems, setPendingItems] = useState<OrderItem[]>([]);
  const [pendingOnComplete, setPendingOnComplete] = useState<(() => void) | undefined>();

  const initiateWhatsAppOrder = (items: OrderItem[], onComplete?: () => void) => {
    if (items.length === 0) {
      toast.error("No items selected for order");
      return;
    }

    const detailsComplete = 
      (userData?.fullName || userData?.name) && 
      (userData?.email || user?.email) && 
      userData?.phone && 
      userData?.address;

    if (!detailsComplete) {
      setPendingItems(items);
      setPendingOnComplete(() => onComplete);
      setIsModalOpen(true);
    } else {
      const customer: CustomerDetails = {
        name: userData?.fullName || userData?.name || '',
        email: userData?.email || user?.email || '',
        phone: userData?.phone || '',
        address: userData?.address || ''
      };
      openWhatsAppOrder(items, customer);
      if (onComplete) onComplete();
    }
  };

  const handleConfirmDetails = async (details: CustomerDetails) => {
    setIsModalOpen(false);
    
    // Update profile if authenticated
    if (user) {
      try {
        await updateProfile({
          name: details.name,
          fullName: details.name,
          phone: details.phone,
          address: details.address
        });
      } catch (error) {
        console.error("Failed to update profile during WhatsApp order:", error);
      }
    }

    openWhatsAppOrder(pendingItems, details);
    if (pendingOnComplete) {
      pendingOnComplete();
      setPendingOnComplete(undefined);
    }
  };

  return {
    initiateWhatsAppOrder,
    isModalOpen,
    setIsModalOpen,
    handleConfirmDetails,
    pendingItems
  };
};
