import React from 'react';
import CreateBannerModal from './CreateBannerModal';
import EditBannerModal from './EditBannerModal';

export default function BannerModal({ isOpen, onClose, onSave, banner = null, onError }) {
  if (!isOpen) return null;

  if (banner) {
    return (
      <EditBannerModal
        isOpen={isOpen}
        banner={banner}
        onClose={onClose}
        onSuccess={() => {
          onSave && onSave(banner);
          onClose();
        }}
        onError={onError}
      />
    );
  }

  return (
    <CreateBannerModal
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={(created) => {
        onSave && onSave(created);
        onClose();
      }}
      onError={onError}
    />
  );
}
