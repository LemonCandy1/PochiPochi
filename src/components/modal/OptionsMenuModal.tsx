import React from 'react';
import { UserProfile } from '../../types';
import { PochiMenuModal, MenuView, KrillionMenuModal } from '../menu/PochiMenuModal';

interface OptionsMenuModalProps {
  visible: boolean;
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onClose: () => void;
  initialView?: MenuView;
}

/**
 * OptionsMenuModal renders the Pochi mobile menu layout
 * with Daily Trivia, Unlimited, Archive, Themed Packs, My Pochi, Friends, Settings, and FAQ.
 */
export const OptionsMenuModal: React.FC<OptionsMenuModalProps> = (props) => {
  return <PochiMenuModal {...props} />;
};

export { PochiMenuModal, KrillionMenuModal };
export default OptionsMenuModal;
