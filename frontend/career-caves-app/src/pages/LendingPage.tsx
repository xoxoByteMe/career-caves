import { useState, useEffect } from 'react';
import { createListing, updateListing, getListings, deleteListing, type Listing } from '../lib/api';
import CameraCapture from '../components/CameraCapture';
import { useCameraCapture } from '../hooks/useCameraCapture';

const CATEGORY_OPTIONS = ['shoes', 'shirts', 'jacket', 'pants', 'accessory', 'other'] as const;

const CONDITION_OPTIONS = ['New', 'Like new', 'Good', 'Fair'] as const;
const DESCRIPTION_MAX_LENGTH = 400;

export default function LendingPage() {
  // ── Simulated Auth (temporary — no real login yet) ────────────────────────
  const [simulatedUserId, setSimulatedUserId] = useState(1);
  const [userIdInput, setUserIdInput] = useState('1');

  // ── My Listings ───────────────────────────────────────────────────────────
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [listingsError, setListingsError] = useState<string | null>(null);

  // ── Create modal ──────────────────────────────────────────────────────────
  const [showListForm, setShowListForm] = useState(false);
  const [title, setTitle] = useState('');
  const [pricePerDay, setPricePerDay] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const createCamera = useCameraCapture((message) => setFormMessage(`Camera error: ${message}`));

  // ── Edit modal ────────────────────────────────────────────────────────────
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPricePerDay, setEditPricePerDay] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editFileInputKey, setEditFileInputKey] = useState(0);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [editFormMessage, setEditFormMessage] = useState<string | null>(null);
  const editCamera = useCameraCapture((message) => setEditFormMessage(`Camera error: ${message}`));

  // ── Delete modal ──────────────────────────────────────────────────────────
  const [listingToDelete, setListingToDelete] = useState<Listing | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);

  function fetchMyListings(userId: number) {
    setLoadingListings(true);
    setListingsError(null);
    getListings()
      .then((all) => setMyListings(all.filter((l) => l.user_id === userId)))
      .catch((err) =>
        setListingsError(err instanceof Error ? err.message : 'Failed to load listings'),
      )
      .finally(() => setLoadingListings(false));
  }

  useEffect(() => {
    fetchMyListings(simulatedUserId);
  }, [simulatedUserId]);

  // Clean up camera streams when modals close
  useEffect(() => {
    if (!showListForm) {
      createCamera.stopCamera();
    }
  }, [showListForm, createCamera]);

  useEffect(() => {
    if (editingListing === null) {
      editCamera.stopCamera();
    }
  }, [editingListing, editCamera]);

  function applyUserId() {
    const parsed = Number(userIdInput);
    if (!Number.isNaN(parsed) && parsed > 0) {
      setSimulatedUserId(parsed);
    }
  }

  async function handleCreateCapture() {
    const capturedFile = await createCamera.capturePhoto();
    if (capturedFile) {
      setImageFile(capturedFile);
    }
  }

  async function handleEditCapture() {
    const capturedFile = await editCamera.capturePhoto();
    if (capturedFile) {
      setEditImageFile(capturedFile);
    }
  }

  async function handleCreateSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim() || !pricePerDay.trim()) {
      setFormMessage('Title and price per day are required.');
      return;
    }

    if (!category) {
      setFormMessage('Category is required.');
      return;
    }

    const parsedPrice = Number(pricePerDay);
    if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      setFormMessage('Price per day must be a valid positive number.');
      return;
    }

    setIsSubmitting(true);
    setFormMessage(null);

    try {
      await createListing({
        user_id: simulatedUserId,
        title: title.trim(),
        pricePerDay: parsedPrice,
        category,
        image: imageFile ?? undefined,
      });

      setFormMessage('Listing created successfully.');
      setTitle('');
      setPricePerDay('');
      setCategory('');
      setCondition('');
      setDescription('');
      setImageFile(null);
      setFileInputKey((k) => k + 1);
      fetchMyListings(simulatedUserId);
    } catch (error) {
      setFormMessage(error instanceof Error ? error.message : 'Failed to create listing.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function openEditModal(listing: Listing) {
    setEditingListing(listing);
    setEditTitle(listing.title);
    setEditPricePerDay(String(listing.price_per_day));
    setEditCategory(listing.category ?? '');
    setEditImageFile(null);
    setEditFileInputKey((k) => k + 1);
    setEditFormMessage(null);
  }

  async function handleEditSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingListing) return;

    if (!editTitle.trim() || !editPricePerDay.trim()) {
      setEditFormMessage('Title and price per day are required.');
      return;
    }

    if (!editCategory) {
      setEditFormMessage('Category is required.');
      return;
    }

    const parsedPrice = Number(editPricePerDay);
    if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      setEditFormMessage('Price per day must be a valid positive number.');
      return;
    }

    const id = editingListing.listing_id ?? editingListing.id;
    if (!id) {
      setEditFormMessage('Cannot update: listing has no id.');
      return;
    }

    setIsEditSubmitting(true);
    setEditFormMessage(null);

    try {
      await updateListing(id, {
        user_id: simulatedUserId,
        title: editTitle.trim(),
        pricePerDay: parsedPrice,
        category: editCategory,
        image: editImageFile ?? undefined,
      });

      setEditFormMessage('Listing updated successfully.');
      fetchMyListings(simulatedUserId);
    } catch (error) {
      setEditFormMessage(error instanceof Error ? error.message : 'Failed to update listing.');
    } finally {
      setIsEditSubmitting(false);
    }
  }

  function openDeleteModal(listing: Listing) {
    setListingToDelete(listing);
    setDeleteMessage(null);
  }

  async function handleConfirmDelete() {
    if (!listingToDelete) return;

    const id = listingToDelete.listing_id ?? listingToDelete.id;
    if (!id) {
      setDeleteMessage('Cannot delete: listing has no id.');
      return;
    }

    setIsDeleting(true);
    setDeleteMessage(null);

    try {
      await deleteListing(id, simulatedUserId);
      setListingToDelete(null);
      fetchMyListings(simulatedUserId);
    } catch (error) {
      setDeleteMessage(error instanceof Error ? error.message : 'Failed to delete listing.');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="page-padding">
      <h2>Lending</h2>
      <p className="section-subtitle">
        List professional items and manage your active lending listings.
      </p>

      {/* ── Simulated user selector (temporary — replace with real auth) ── */}
      <div className="simulated-auth-bar">
        <span className="simulated-auth-label">Temp — acting as User ID:</span>
        <input
          className="simulated-auth-input"
          type="number"
          min={1}
          value={userIdInput}
          onChange={(e) => setUserIdInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && applyUserId()}
        />
        <button className="btn-primary" type="button" onClick={applyUserId}>
          Apply
        </button>
      </div>

      {/* ── Your Listings ── */}
      <div className="lending-section-header">
        <h3 style={{ margin: 0 }}>Your Listings</h3>
        <button onClick={() => { setShowListForm(true); setFormMessage(null); }} className="btn-primary">
          + New Listing
        </button>
      </div>

      {loadingListings && <p>Loading your listings...</p>}
      {listingsError && <p className="text-error">{listingsError}</p>}
      {!loadingListings && !listingsError && myListings.length === 0 && (
        <p className="text-muted">You have no listings yet.</p>
      )}

      <div className="lending-grid">
        {myListings.map((listing) => {
          const id = listing.listing_id ?? listing.id;
          return (
            <div key={id} className="lending-card">
              {listing.image_url ? (
                <img src={listing.image_url} alt={listing.title} className="lending-card-img" />
              ) : (
                <div className="lending-card-no-img">No Image</div>
              )}
              <div className="lending-card-body">
                <h4 className="lending-card-title">{listing.title}</h4>
                {listing.category && (
                  <p className="lending-card-category">{listing.category}</p>
                )}
                <p className="lending-card-price">${listing.price_per_day}/day</p>
                <button
                  className="btn-edit"
                  type="button"
                  onClick={() => openEditModal(listing)}
                >
                  Edit
                </button>
                <button
                  className="btn-delete"
                  type="button"
                  onClick={() => openDeleteModal(listing)}
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Create Listing Modal ── */}
      {showListForm && (
        <div className="modal-overlay" onClick={() => setShowListForm(false)}>
          <form
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleCreateSubmit}
          >
            <h2>List a Professional Item</h2>
            <p className="modal-subtitle">
              Provide details to help other Gators find the perfect fit.
            </p>

            {formMessage && (
              <p className={formMessage.includes('successfully') ? 'text-success' : 'text-error'}>
                {formMessage}
              </p>
            )}

            <div className="form-grid">
              <div className="form-group form-group--full">
                <label className="form-label">Item Image</label>
                {!createCamera.isCameraOpen && (
                  <>
                    <label
                      className="upload-zone"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files?.[0];
                        if (file) setImageFile(file);
                      }}
                    >
                      <span className="upload-zone-icon">↑</span>
                      <div>
                        <strong>Drag &amp; drop or click to upload</strong>
                        <p>{imageFile ? imageFile.name : 'JPEG, PNG, or GIF. Max size 10MB.'}</p>
                      </div>
                      <input
                        key={fileInputKey}
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                      />
                    </label>
                  </>
                )}
                <CameraCapture
                  isCameraOpen={createCamera.isCameraOpen}
                  videoRef={createCamera.videoRef}
                  onStartCamera={createCamera.startCamera}
                  onCapturePhoto={handleCreateCapture}
                  onCancelCamera={createCamera.stopCamera}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Item Title</label>
                <input
                  className="form-input"
                  placeholder="e.g. Zara Tailored Blazer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Price per Day ($)</label>
                <input
                  className="form-input"
                  type="number"
                  placeholder="15"
                  value={pricePerDay}
                  onChange={(e) => setPricePerDay(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Condition</label>
                <div className="condition-chips" role="group" aria-label="Condition options">
                  {CONDITION_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={`condition-chip ${condition === option ? 'condition-chip--active' : ''}`}
                      onClick={() => setCondition(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group form-group--full">
                <label className="form-label" htmlFor="listing-description">
                  Description
                </label>
                <textarea
                  id="listing-description"
                  className="form-input"
                  rows={5}
                  placeholder="Add seller notes about brand, condition, fit, colour, flaws, and dry-cleaning."
                  value={description}
                  maxLength={DESCRIPTION_MAX_LENGTH}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <p className="form-help">
                  {description.length} / {DESCRIPTION_MAX_LENGTH}
                </p>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <input className="form-input" value="Ready to list" readOnly />
              </div>
            </div>

            <div className="form-actions">
              <button
                onClick={() => setShowListForm(false)}
                type="button"
                className="btn-cancel"
              >
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="btn-submit">
                {isSubmitting ? 'Posting...' : 'Post Listing'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Edit Listing Modal ── */}
      {editingListing && (
        <div className="modal-overlay" onClick={() => setEditingListing(null)}>
          <form
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleEditSubmit}
          >
            <h2>Edit Listing</h2>
            <p className="modal-subtitle">
              Update the details for &ldquo;{editingListing.title}&rdquo;.
            </p>

            {editFormMessage && (
              <p
                className={
                  editFormMessage.includes('successfully') ? 'text-success' : 'text-error'
                }
              >
                {editFormMessage}
              </p>
            )}

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Item Title</label>
                <input
                  className="form-input"
                  placeholder="e.g. Zara Tailored Blazer"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Price per Day ($)</label>
                <input
                  className="form-input"
                  type="number"
                  placeholder="15"
                  value={editPricePerDay}
                  onChange={(e) => setEditPricePerDay(e.target.value)}
                />
              </div>
              <div className="form-group form-group--full">
                <label className="form-label">Category</label>
                <select
                  className="form-input"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group form-group--full">
                <label className="form-label">Replace Image (optional)</label>
                {!editCamera.isCameraOpen && (
                  <>
                    <input
                      key={editFileInputKey}
                      className="form-input"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setEditImageFile(e.target.files?.[0] ?? null)}
                    />
                  </>
                )}
                <CameraCapture
                  isCameraOpen={editCamera.isCameraOpen}
                  videoRef={editCamera.videoRef}
                  onStartCamera={editCamera.startCamera}
                  onCapturePhoto={handleEditCapture}
                  onCancelCamera={editCamera.stopCamera}
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                onClick={() => setEditingListing(null)}
                type="button"
                className="btn-cancel"
              >
                Cancel
              </button>
              <button type="submit" disabled={isEditSubmitting} className="btn-submit">
                {isEditSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {listingToDelete && (
        <div className="modal-overlay" onClick={() => setListingToDelete(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Delete Listing</h2>
            <p className="modal-subtitle">
              Are you sure you want to delete &ldquo;{listingToDelete.title}&rdquo;? This cannot be undone.
            </p>

            {deleteMessage && <p className="text-error">{deleteMessage}</p>}

            <div className="form-actions">
              <button
                onClick={() => setListingToDelete(null)}
                type="button"
                className="btn-cancel"
                disabled={isDeleting}
              >
                No
              </button>
              <button
                type="button"
                className="btn-submit"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
