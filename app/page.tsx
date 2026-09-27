'use client';

import { useEffect, useState } from 'react';

// Ganti URL ini dengan URL Web App Apps Script milikmu jika tidak pakai .env
const GAS_URL = process.env.NEXT_PUBLIC_GAS_URL || '';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  ingredients: string;
  imageUrl?: string;
  benefits?: string[];
}

interface Testimonial {
  name: string;
  review: string;
  rating: number;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [cart, setCart] = useState<Record<string, { item: Product; qty: number }>>({});
  const [showCart, setShowCart] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (GAS_URL) {
      fetchProducts();
      fetchTestimonials();
    } else {
      console.warn('URL Apps Script belum dipasang di NEXT_PUBLIC_GAS_URL');
    }
  }, []);

  async function fetchProducts() {
    try {
      const res = await fetch(`${GAS_URL}?action=getProducts`);
      const data = await res.json();
      if (data.ok) setProducts(data.data);
    } catch (err) {
      console.error('Gagal ambil produk dari GAS:', err);
    }
  }

  async function fetchTestimonials() {
    try {
      const res = await fetch(`${GAS_URL}?action=getTestimonials`);
      const data = await res.json();
      if (data.ok) setTestimonials(data.data);
    } catch (err) {
      console.error('Gagal ambil testimoni dari GAS:', err);
    }
  }

  function addToCart(id: string) {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    setCart((prev) => ({
      ...prev,
      [id]: { item: product, qty: (prev[id]?.qty || 0) + 1 },
    }));
    setShowDetail(false);
    setShowCart(true);
  }

  function changeQty(id: string, delta: number) {
    setCart((prev) => {
      const updated = { ...prev };
      if (!updated[id]) return prev;
      updated[id].qty += delta;
      if (updated[id].qty <= 0) delete updated[id];
      return updated;
    });
  }

  const cartCount = Object.values(cart).reduce((sum, c) => sum + c.qty, 0);
  const cartTotal = Object.values(cart).reduce((sum, c) => sum + c.item.price * c.qty, 0);

  async function handleCheckout(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (Object.keys(cart).length === 0) {
      alert('Keranjang masih kosong.');
      return;
    }
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    const itemsArray = Object.keys(cart).map((id) => ({
      id: id,
      qty: cart[id].qty
    }));

    const payload = {
      name: formData.get('name'),
      phone: formData.get('phone'),
      address: formData.get('address'),
      note: formData.get('note'),
      items: Object.values(cart).map(c => `${c.item.name} x${c.qty}`).join(', '),
      itemsJson: JSON.stringify(itemsArray),
      total: cartTotal.toString(),
    };

    try {
      // Kirim data order ke Google Apps Script (menggunakan text/plain agar bebas preflight CORS)
      const res = await fetch(GAS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.ok) {
        const msg = `Halo Admin AFC, saya ingin memesan.\n\nID: ${data.txId}\nNama: ${payload.name}\nWhatsApp: ${payload.phone}\nAlamat: ${payload.address}\nPesanan: ${payload.items}\nTotal: Rp ${cartTotal.toLocaleString('id-ID')}\nCatatan: ${payload.note}`;
        window.open(`https://wa.me/${data.adminWa}?text=${encodeURIComponent(msg)}`, '_blank');
        setCart({});
        setShowCart(false);
        form.reset();
      } else {
        alert('Gagal menyimpan pesanan: ' + data.error);
      }
    } catch (err) {
      alert('Terjadi kesalahan koneksi.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <nav className="nav">
        <div className="container nav-in">
          <a className="brand" href="#top">
            <span className="brand-mark">AFC</span>
            <span>JAPAN</span>
          </a>
          <div className="nav-links">
            <a href="#products">Produk</a>
            <a href="#science">Regenerasi Sel</a>
            <a href="#trust">Legalitas</a>
            <a href="#voices">Ahli & Ulasan</a>
          </div>
          <button className="nav-cta" onClick={() => setShowCart(true)}>
            Keranjang <span id="count">{cartCount}</span>
          </button>
        </div>
      </nav>

      <header id="top" className="container hero">
        <div>
          <div className="eyebrow">Japanese life science · since 1869</div>
          <h1>
            Wellness yang dirancang dengan <span>ketelitian Jepang.</span>
          </h1>
          <p>
            Kenali pendekatan AFC Life Science terhadap peptide, amino acid, dan
            wellness harian. Pelajari produk berdasarkan kandungan dan tujuan
            penggunaannya sebelum berkonsultasi dengan admin.
          </p>
          <div className="hero-actions">
            <a className="primary" href="#products">Jelajahi produk</a>
            <a className="secondary" href="#science">Pelajari regenerasi sel</a>
          </div>
        </div>
        <div className="hero-art">
          <div className="vertical">日本の技術で、健やかな毎日</div>
        </div>
      </header>

      <section id="products" className="section container">
        <div className="section-head">
          <div>
            <div className="eyebrow">The collection</div>
            <h2>Pilih berdasarkan kebutuhan.</h2>
          </div>
        </div>
        <div className="products">
          {products.length === 0 ? (
            <p>Memuat data dari Google Sheets...</p>
          ) : (
            products.map((p) => (
              <article key={p.id} className="product">
                <div className="product-visual">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  ) : (
                    p.name.split(' ')[0]
                  )}
                </div>
                <small>{p.category}</small>
                <h3>{p.name}</h3>
                <p>{p.description}</p>
                <div className="benefit">
                  <b>Fokus:</b> {(p.benefits || []).join(' · ')}
                </div>
                <div className="product-foot">
                  <span className="price">Rp {p.price.toLocaleString('id-ID')}</span>
                  <button
                    className="outline"
                    onClick={() => {
                      setSelectedProduct(p);
                      setShowDetail(true);
                    }}
                  >
                    Lihat detail
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      {/* Detail & Cart Modal */}
      {showDetail && selectedProduct && (
        <div className="modal open" onClick={() => setShowDetail(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setShowDetail(false)}>×</button>
            <div className="eyebrow">{selectedProduct.category}</div>
            <h2>{selectedProduct.name}</h2>
            <p>{selectedProduct.description}</p>
            <h3>Kandungan Utama</h3>
            <p>{selectedProduct.ingredients}</p>
            <button className="primary" onClick={() => addToCart(selectedProduct.id)}>
              Tambah ke Paket
            </button>
          </div>
        </div>
      )}

      {showCart && (
        <div className="modal open" onClick={() => setShowCart(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setShowCart(false)}>×</button>
            <h2>Pesanan Anda</h2>
            <div>
              {Object.keys(cart).length === 0 ? (
                <p>Keranjang kosong.</p>
              ) : (
                Object.keys(cart).map((id) => {
                  const c = cart[id];
                  return (
                    <div key={id} className="cart-row">
                      <span>{c.item.name} × {c.qty}</span>
                      <div>
                        <button onClick={() => changeQty(id, -1)}>-</button>
                        <button onClick={() => changeQty(id, 1)}>+</button>
                        <span>Rp {(c.item.price * c.qty).toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <p><b>Total: Rp {cartTotal.toLocaleString('id-ID')}</b></p>
            <form onSubmit={handleCheckout}>
              <label>Nama<input className="field" name="name" required /></label>
              <label>WhatsApp<input className="field" name="phone" required /></label>
              <label>Alamat<input className="field" name="address" required /></label>
              <label>Catatan<input className="field" name="note" /></label>
              <button className="primary" type="submit" disabled={loading}>
                {loading ? 'Memproses...' : 'Simpan & Buka WA'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
