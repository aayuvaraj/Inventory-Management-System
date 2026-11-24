import SupplierManagement from './pages/SupplierManagement';
import WarehouseManagement from './pages/WarehouseManagement';
import OrderManagement from './pages/OrderManagement';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearCredentials, setCredentials } from './features/auth/authSlice';
import { useLoginMutation, useRegisterMutation } from './services/authApi';
import {
  useGetProductsQuery,
  useAddProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  productApi,
} from './services/productApi';
import { integrationApi, useLazyLookupBarcodeQuery } from './services/integrationApi';
import './App.css';

function getErrorMessage(error, fallback) {
  return error?.data?.message || error?.error || fallback;
}

function AuthScreen() {
  const dispatch = useDispatch();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [login, { isLoading: loginLoading }] = useLoginMutation();
  const [register, { isLoading: registerLoading }] = useRegisterMutation();
  const loading = loginLoading || registerLoading;

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const credentials = mode === 'register'
        ? await register(form).unwrap()
        : await login({ email: form.email, password: form.password }).unwrap();
      dispatch(setCredentials(credentials));
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to connect to the server.'));
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-mark">IMS</div>
        <h1>Inventory Management</h1>
        <p className="auth-subtitle">
          {mode === 'login' ? 'Sign in to manage your inventory.' : 'Create an account to get started.'}
        </p>
        <div className="auth-tabs">
          <button type="button" className={mode === 'login' ? 'active' : 'secondary'} onClick={() => { setMode('login'); setError(''); }}>Login</button>
          <button type="button" className={mode === 'register' ? 'active' : 'secondary'} onClick={() => { setMode('register'); setError(''); }}>Register</button>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <label>Full name
              <input name="name" placeholder="Enter your name" value={form.name} onChange={handleChange} autoComplete="name" required />
            </label>
          )}
          <label>Email address
            <input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} autoComplete="email" required />
          </label>
          <label>Password
            <input name="password" type="password" placeholder="At least 8 characters" value={form.password} onChange={handleChange} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={8} required />
          </label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button type="submit" disabled={loading}>{loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create account'}</button>
        </form>
        <p className="auth-footnote">Your password is securely hashed before it is stored.</p>
      </section>
    </main>
  );
}

function App() {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);
  const { data: products = [], isLoading, isFetching, error: productsError } = useGetProductsQuery(undefined, { skip: !token });
  const [addProduct, { isLoading: adding }] = useAddProductMutation();
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();
  const [lookupBarcode, { isFetching: lookingUp }] = useLazyLookupBarcodeQuery();
  const [activePage, setActivePage] = useState('products');
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [barcode, setBarcode] = useState('');
  const [lookupMessage, setLookupMessage] = useState('');
  const [form, setForm] = useState({ name: '', category: '', quantity: '', price: '', supplier: '' });

  const logout = () => {
    dispatch(clearCredentials());
    dispatch(productApi.util.resetApiState());
    dispatch(integrationApi.util.resetApiState());
    setMessage('');
    setLookupMessage('');
  };

  const handleChange = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const resetForm = () => {
    setEditingId(null);
    setForm({ name: '', category: '', quantity: '', price: '', supplier: '' });
  };
  const productPayload = () => ({
    ...form,
    quantity: Number(form.quantity),
    price: Number(form.price),
  });

  const handleBarcodeLookup = async (event) => {
    event.preventDefault();
    setLookupMessage('');
    try {
      const details = await lookupBarcode(barcode.trim()).unwrap();
      setForm((current) => ({
        ...current,
        name: details.name || current.name,
        category: details.category || current.category,
        supplier: details.brand || current.supplier,
      }));
      setLookupMessage(`Product details found${details.brand ? ` — ${details.brand}` : ''}. Review the fields, enter quantity and price, then save.`);
    } catch (error) {
      setLookupMessage(getErrorMessage(error, 'Product lookup failed. You can enter the details manually.'));
    }
  };

  const saveProduct = async (event) => {
    event.preventDefault();
    try {
      if (editingId) {
        await updateProduct({ id: editingId, ...productPayload() }).unwrap();
        setMessage('Product updated successfully.');
      } else {
        await addProduct(productPayload()).unwrap();
        setMessage('Product added successfully.');
      }
      resetForm();
    } catch (error) {
      setMessage(getErrorMessage(error, 'Could not save product.'));
    }
  };

  const removeProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteProduct(id).unwrap();
      setMessage('Product deleted successfully.');
    } catch (error) {
      setMessage(getErrorMessage(error, 'Could not delete product.'));
    }
  };

  const editProduct = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name,
      category: product.category,
      quantity: String(product.quantity),
      price: String(product.price),
      supplier: product.supplier || '',
    });
  };

  const exportCSV = () => {
    const headers = ['Name', 'Category', 'Quantity', 'Price', 'Supplier'];
    const rows = products.map((product) => [product.name, product.category, product.quantity, product.price, product.supplier]);
    const escapeCSV = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const csvContent = [headers, ...rows].map((row) => row.map(escapeCSV).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'inventory.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  if (!token) return <AuthScreen />;

  const totalProducts = products.length;
  const totalStock = products.reduce((total, product) => total + product.quantity, 0);
  const totalValue = products.reduce((total, product) => total + product.quantity * product.price, 0);
  const lowStock = products.filter((product) => product.quantity < 5).length;
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase()) ||
    product.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <h1>Inventory Management System</h1>
          <p className="welcome-text">Welcome, {user?.name || user?.email || 'User'}</p>
        </div>
        <div className="topbar-actions">
          <button className="secondary" onClick={exportCSV}>Export Inventory CSV</button>
          <button className="logout-button" onClick={logout}>Logout</button>
        </div>
      </header>

      <nav className="module-navigation" aria-label="Modules">
        {[["products","Products"],["suppliers","Suppliers"],["warehouses","Warehouses"],["orders","Purchase Orders"]].map(([key,label])=><button key={key} type="button" className={activePage===key?'active':'secondary'} onClick={()=>setActivePage(key)}>{label}</button>)}
      </nav>
      {activePage === 'suppliers' ? <SupplierManagement /> : activePage === 'warehouses' ? <WarehouseManagement /> : activePage === 'orders' ? <OrderManagement /> : <>
      {message && <div className="status-message" role="status"><span>{message}</span><button type="button" className="message-close" onClick={() => setMessage('')}>×</button></div>}
      {productsError && <div className="status-message" role="alert">{getErrorMessage(productsError, 'Unable to load products.')}</div>}
      {(isLoading || isFetching) && <p className="status-message">{isLoading ? 'Loading products...' : 'Refreshing products...'}</p>}

      <div className="dashboard">
        <div className="stat-card"><h3>Total Products</h3><p>{totalProducts}</p></div>
        <div className="stat-card"><h3>Total Stock</h3><p>{totalStock}</p></div>
        <div className="stat-card"><h3>Inventory Value</h3><p>₹{totalValue.toLocaleString('en-IN')}</p></div>
        <div className="stat-card"><h3>Low Stock</h3><p>{lowStock}</p></div>
      </div>

      <div className="container">
        <div className="card">
          <h2>{editingId ? 'Edit Product' : 'Add Product'}</h2>
          <div className="barcode-lookup">
            <h3>Third-Party Product Lookup</h3>
            <p>Find packaged food product details using Open Food Facts.</p>
            <form className="barcode-form" onSubmit={handleBarcodeLookup}>
              <input aria-label="Product barcode" inputMode="numeric" pattern="[0-9]{8,14}" maxLength="14" placeholder="Enter barcode (8–14 digits)" value={barcode} onChange={(event) => setBarcode(event.target.value.replace(/\D/g, '').slice(0, 14))} required />
              <button type="submit" disabled={lookingUp || barcode.length < 8}>{lookingUp ? 'Fetching...' : 'Fetch Product Details'}</button>
            </form>
            {lookupMessage && <p className="lookup-message" role="status">{lookupMessage}</p>}
          </div>
          <form onSubmit={saveProduct}>
            <input name="name" placeholder="Product Name" value={form.name} onChange={handleChange} required />
            <input name="category" placeholder="Category" value={form.category} onChange={handleChange} required />
            <input name="quantity" type="number" min="0" placeholder="Quantity" value={form.quantity} onChange={handleChange} required />
            <input name="price" type="number" min="0" step="0.01" placeholder="Price" value={form.price} onChange={handleChange} required />
            <input name="supplier" placeholder="Supplier" value={form.supplier} onChange={handleChange} />
            <button type="submit" disabled={adding || updating}>{adding || updating ? 'Saving...' : editingId ? 'Update Product' : 'Add Product'}</button>
            {editingId && <button type="button" className="secondary" onClick={resetForm}>Cancel</button>}
          </form>
        </div>

        <div className="card">
          <h2>Products</h2>
          <input className="search-input" type="text" placeholder="Search product..." value={search} onChange={(event) => setSearch(event.target.value)} />
          {isLoading ? <p>Loading products...</p> : products.length === 0 ? <p>No products available.</p> : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Name</th><th>Category</th><th>Quantity</th><th>Price</th><th>Supplier</th><th>Action</th></tr></thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product._id}>
                      <td>{product.name}</td><td>{product.category}</td>
                      <td>{product.quantity}{product.quantity < 5 && <span className="low-stock"> Low Stock</span>}</td>
                      <td>₹{product.price}</td><td>{product.supplier}</td>
                      <td className="actions-cell">
                        <button className="edit-button" onClick={() => editProduct(product)}>Edit</button>
                        <button className="delete-button" onClick={() => removeProduct(product._id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      </>}
    </div>
  );
}

export default App;
