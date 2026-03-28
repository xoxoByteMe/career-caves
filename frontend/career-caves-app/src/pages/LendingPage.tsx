import { useState } from 'react';
import { createListing } from '../lib/api';

export default function LendingPage() {
  const [showListForm, setShowListForm] = useState(true);
  const [title, setTitle] = useState('');
  const [pricePerDay, setPricePerDay] = useState('');
  const [category, setCategory] = useState('');
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

    try {
      await createListing({
        title: title.trim(),
        pricePerDay: parsedPrice,
        category: category.trim() || undefined,
      });

      setFormMessage('Listing created successfully.');
      setTitle('');
      setPricePerDay('');
      setCategory('');
    } catch (error) {
      setFormMessage(error instanceof Error ? error.message : 'Failed to create listing.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div style={{ padding: '32px' }}>
      <h2>Lending</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
        List professional items and manage active lending listings.
      </p>
      {!showListForm && (
        <button
          onClick={() => setShowListForm(true)}
          style={{
            background: 'var(--ufl-blue)',
            color: 'white',
            border: 'none',
            padding: '10px 16px',
            borderRadius: '8px',
            fontWeight: 'bold',
          }}
        >
          Open List Item Modal
        </button>
      )}

      {showListForm && (
        <div className="modal-overlay" onClick={() => setShowListForm(false)}>
          <form className="modal-content" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
            <h2>List a Professional Item</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
              Provide measurements to help other Gators find the perfect fit.
            </p>

            {formMessage && <p style={{ color: formMessage.includes('successfully') ? '#027a48' : '#b42318' }}>{formMessage}</p>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label style={{ fontSize: '13px', fontWeight: '500' }}>Item Title</label>
                <input
                  className="form-input"
                  placeholder="e.g. Zara Tailored Blazer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '13px', fontWeight: '500' }}>Price per Day ($)</label>
                <input
                  className="form-input"
                  type="number"
                  placeholder="15"
                  value={pricePerDay}
                  onChange={(e) => setPricePerDay(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '13px', fontWeight: '500' }}>Category</label>
                <input
                  className="form-input"
                  placeholder="e.g. Blazer"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '13px', fontWeight: '500' }}>Status</label>
                <input className="form-input" value="Ready to list" readOnly />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
              <button
                onClick={() => setShowListForm(false)}
                type="button"
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'none',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  background: 'var(--ufl-blue)',
                  color: 'white',
                  border: 'none',
                  fontWeight: 'bold',
                }}
              >
                {isSubmitting ? 'Posting...' : 'Post Listing'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
