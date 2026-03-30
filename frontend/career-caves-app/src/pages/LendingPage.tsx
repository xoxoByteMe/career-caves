import { useState } from 'react';
import { createListing } from '../lib/api';

export default function LendingPage() {
  const [showListForm, setShowListForm] = useState(true);
  const [title, setTitle] = useState('');
  const [pricePerDay, setPricePerDay] = useState('');
  const [category, setCategory] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim() || !pricePerDay.trim()) {
      setFormMessage('Title and price per day are required.');
      return;
    }

    const parsedPrice = Number(pricePerDay);
    if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      setFormMessage('Price per day must be a valid positive number.');
      return;
    }

    setIsSubmitting(true);
    setFormMessage(null);

    // For now, user_id is hardcoded to 1 since we don't have authentication set up, but this should be updated in the future to use the actual logged-in user's ID
    try {
      await createListing({
        user_id : 1,
        title: title.trim(),
        pricePerDay: parsedPrice,
        category: category.trim() || undefined,
        image: imageFile ?? undefined,
      });

      setFormMessage('Listing created successfully.');
      setTitle('');
      setPricePerDay('');
      setCategory('');
      setImageFile(null);
      setFileInputKey((current) => current + 1);
    } catch (error) {
      setFormMessage(error instanceof Error ? error.message : 'Failed to create listing.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page-padding">
      <h2>Lending</h2>
      <p className="section-subtitle">
        List professional items and manage active lending listings.
      </p>
      {!showListForm && (
        <button onClick={() => setShowListForm(true)} className="btn-primary">
          Open List Item Modal
        </button>
      )}

      {showListForm && (
        <div className="modal-overlay" onClick={() => setShowListForm(false)}>
          <form className="modal-content" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
            <h2>List a Professional Item</h2>
            <p className="modal-subtitle">
              Provide measurements to help other Gators find the perfect fit.
            </p>

            {formMessage && <p className={formMessage.includes('successfully') ? 'text-success' : 'text-error'}>{formMessage}</p>}

            <div className="form-grid">
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
                <input
                  className="form-input"
                  placeholder="e.g. Blazer"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <input className="form-input" value="Ready to list" readOnly />
              </div>
              <div className="form-group form-group--full">
                <label className="form-label">Item Image (optional)</label>
                <input
                  key={fileInputKey}
                  className="form-input"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                />
              </div>
            </div>

            <div className="form-actions">
              <button onClick={() => setShowListForm(false)} type="button" className="btn-cancel">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="btn-submit">
                {isSubmitting ? 'Posting...' : 'Post Listing'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
