import { useNavigate } from 'react-router-dom';
import { getOrCreateConversation, type Listing } from '../lib/api';

type ListingDetailsModalProps = {
  listing: Listing | null;
  onClose: () => void;
};

function formatDate(value?: string | null): string {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export default function ListingDetailsModal({ listing, onClose }: ListingDetailsModalProps) {
  const navigate = useNavigate();
  if (!listing) {
    return null;
  }

  const listingSnapshot = listing;

  async function handleMessageOwner() {
    const listingId = listingSnapshot.listing_id ?? listingSnapshot.id;
    const ownerUserId = listingSnapshot.user_id;

    if (!listingId || !ownerUserId) {
      alert('Missing listing or owner information.');
      return;
    }

    try {
      const conversation = await getOrCreateConversation({
        listing_id: listingId,
        other_user_id: ownerUserId,
      });

      const currentUserId =
        conversation.user1_id === ownerUserId
          ? conversation.user2_id
          : conversation.user1_id;

      if (ownerUserId === currentUserId) {
        alert('You cannot message your own listing.');
        return;
      }

      onClose();

      navigate('/messages', {
        state: {
          conversationId: conversation.conversation_id,
          currentUserId,
        },
      });
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : 'Failed to open conversation.');
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content listing-details-modal" onClick={(e) => e.stopPropagation()}>
        <h2>Listing Details</h2>
        <p className="modal-subtitle">Listing properties</p>

        <div className="listing-details-layout">
          {listing.image_url ? (
            <img src={listing.image_url} alt={listing.title} className="listing-details-image" />
          ) : (
            <div className="listing-details-no-image">No Image</div>
          )}

          <div className="listing-details-grid">
            <div className="listing-details-row">
              <span className="listing-details-key">Owner Name</span>
              <span className="listing-details-value">{listing.name ?? 'N/A'}</span>
            </div>
            <div className="listing-details-row">
              <span className="listing-details-key">Owner Email</span>
              <span className="listing-details-value">{listing.email ?? 'N/A'}</span>
            </div>
            <div className="listing-details-row">
              <span className="listing-details-key">title</span>
              <span className="listing-details-value">{listing.title}</span>
            </div>
            <div className="listing-details-row">
              <span className="listing-details-key">price per day</span>
              <span className="listing-details-value">${listing.price_per_day}</span>
            </div>
            <div className="listing-details-row">
              <span className="listing-details-key">category</span>
              <span className="listing-details-value">{listing.category ?? 'N/A'}</span>
            </div>
            <div className="listing-details-row">
              <span className="listing-details-key">size</span>
              <span className="listing-details-value">{listing.size ?? 'N/A'}</span>
            </div>
            <div className="listing-details-row">
              <span className="listing-details-key">condition</span>
              <span className="listing-details-value">{listing.condition ?? 'N/A'}</span>
            </div>
            <div className="listing-details-row">
              <span className="listing-details-key">created_at</span>
              <span className="listing-details-value">{formatDate(listing.created_at)}</span>
            </div>

            {/*
            <div className="listing-details-row">
              <span className="listing-details-key">updated_at</span>
              <span className="listing-details-value">{formatDate(listing.updated_at)}</span>
            </div>
            <div className="listing-details-row">
              <span className="listing-details-key">image_url</span>
              <span className="listing-details-value listing-details-url">{listing.image_url ?? 'N/A'}</span>
            </div>            
            */}

          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={onClose}>
            Close
          </button>
          <button type="button" className="btn-submit" onClick={() => void handleMessageOwner()}>
            Message Owner
          </button>
        </div>
      </div>
    </div>
  );
}
