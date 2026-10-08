import React from 'react';
import { useApp } from '../context/AppContext';
import { Bell, Check, ArrowRight, MessageSquare, Handshake, Heart, Sparkles, UserPlus } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const {
    currentUser,
    setCurrentPage,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
  } = useApp();

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#F2E5E8] border border-[#E8D3D8] text-[#8B3A4A] flex items-center justify-center mx-auto">
          <Bell className="w-8 h-8" />
        </div>
        <h2 className="font-serif-headline text-3xl sm:text-4xl font-normal text-gray-900">
          Activity & Notifications
        </h2>
        <p className="text-sm text-gray-600 max-w-md mx-auto">
          Sign in to receive updates on incoming collaboration inquiries, artwork likes, curator saves, and new opportunity matches.
        </p>
        <button
          onClick={() => setCurrentPage('login')}
          className="px-8 py-3.5 rounded-full font-bold text-xs bg-[#8B3A4A] hover:bg-[#732D3B] text-white transition-all shadow-md shadow-[#8B3A4A]/25 cursor-pointer"
        >
          Sign in to ARTVERSE
        </button>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'collab_request':
      case 'collaboration':
        return <Handshake className="w-4 h-4 text-emerald-600" />;
      case 'collab_accepted':
      case 'collaboration_accepted':
        return <Handshake className="w-4 h-4 text-emerald-600" />;
      case 'collab_rejected':
      case 'collaboration_rejected':
        return <Handshake className="w-4 h-4 text-rose-600" />;
      case 'like':
      case 'artwork_like':
        return <Heart className="w-4 h-4 text-[#8B3A4A]" />;
      case 'follow':
      case 'new_follower':
      case 'follower':
        return <UserPlus className="w-4 h-4 text-[#8B3A4A]" />;
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-gray-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-[#8B3A4A]" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-[#FAFAF8]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#F2E5E8] text-[#8B3A4A] border border-[#E8D3D8] mb-2">
            <Bell className="w-3.5 h-3.5 text-[#8B3A4A]" />
            <span>Platform Updates</span>
          </div>
          <h1 className="font-serif-headline text-4xl sm:text-5xl font-normal text-gray-900">
            Notifications ({notifications.length})
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Real-time activity on your artworks, collaboration proposals, and community interactions.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllNotificationsAsRead}
            className="px-4 py-2 rounded-full text-xs font-semibold bg-white hover:bg-[#F2E5E8] text-[#8B3A4A] border border-[#E8D3D8] transition-colors shadow-2xs cursor-pointer self-start sm:self-auto flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {/* Notifications list */}
      {notifications.length === 0 ? (
        <div className="p-16 rounded-3xl bg-white border border-[#E7E7E4] text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
            <Bell className="w-6 h-6" />
          </div>
          <h3 className="font-serif-headline text-2xl text-gray-900">No notifications yet</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
            When curators view your work, fellow creators follow your portfolio, or collaboration proposals arrive, they will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                markNotificationAsRead(notif.id);
                if (notif.link) {
                  if (notif.link === 'collaborations' || notif.link === 'dashboard') {
                    setCurrentPage('dashboard');
                  } else if (notif.link === 'portfolio') {
                    setCurrentPage('portfolio');
                  } else if (notif.link === 'opportunities') {
                    setCurrentPage('opportunities');
                  }
                }
              }}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                notif.read
                  ? 'bg-white border-[#E7E7E4]/80 hover:border-[#E7E7E4]'
                  : 'bg-[#F2E5E8]/40 border-[#E8D3D8] hover:border-[#E8D3D8] shadow-2xs'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className={`p-2.5 rounded-xl shrink-0 ${notif.read ? 'bg-gray-100' : 'bg-white border border-[#E8D3D8] shadow-xs'}`}>
                  {getIcon(notif.type)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className={`text-sm ${notif.read ? 'font-medium text-gray-800' : 'font-bold text-gray-900'}`}>
                      {notif.title}
                    </h4>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-[#8B3A4A] shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed max-w-xl">
                    {notif.message}
                  </p>
                  <span className="text-[11px] text-gray-400 block pt-0.5">
                    {notif.time}
                  </span>
                </div>
              </div>

              {!notif.read && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    markNotificationAsRead(notif.id);
                  }}
                  className="text-xs text-[#8B3A4A] hover:text-[#8B3A4A] p-1.5 rounded-lg hover:bg-[#F2E5E8]/50 transition-colors"
                  title="Mark as read"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
