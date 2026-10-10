import React from 'react';
import { getPhotoUrl, getInitials } from '../api';

export default function Avatar({ user, size = 'md', style = {} }) {
  const photoUrl = getPhotoUrl(user?.photo_url);
  const sizeClass = `avatar avatar-${size}`;

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={user?.display_name || user?.username || 'User'}
        className={sizeClass}
        style={style}
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.nextSibling && (e.target.nextSibling.style.display = 'flex');
        }}
      />
    );
  }

  return (
    <div className={sizeClass} style={{ background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', ...style }}>
      {getInitials(user?.display_name || user?.username)}
    </div>
  );
}
