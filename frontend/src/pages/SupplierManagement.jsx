import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export default function SupplierManagement() {
 const token = useSelector(state => state.auth.token);
 const [items,setItems]=useState([]),[editing,setEditing]=useState(null),[search,setSearch]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const initial={name: '',email: '',phone: '',address: '',status: 'Active'};
 const [form,setForm]=useState(initial);
 const api=async (path='',options={})=>{
  const response=await fetch(`${BASE}/api/suppliers/${path}`,{...options,headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`}});
  const data=await response.json(); if(!response.ok)throw Error(data.message||'Request failed');return data;
 };
 const refresh=async()=>{try{setItems(await api());setError('')}catch(e){setError(e.message)}};
 useEffect(()=>{if(token)refresh()},[token]);
 const save=async e=>{e.preventDefault();setBusy(true);try{await api(editing||'',{method:editing?'PUT':'POST',body:JSON.stringify(form)});setForm(initial);setEditing(null);await refresh()}catch(e){setError(e.message)}finally{setBusy(false)}};
 const remove=async id=>{if(!window.confirm('Delete this record?'))return;try{await api(id,{method:'DELETE'});await refresh()}catch(e){setError(e.message)}};
 const startEdit=item=>{setEditing(item._id);setForm(Object.fromEntries(Object.keys(initial).map(k=>[k,item[k]??initial[k]])))};
 const visible=items.filter(x=>JSON.stringify(x).toLowerCase().includes(search.toLowerCase()));
 return <div className="container" style={{alignItems:'start'}}>
 <section className="card"><h2>Supplier Management</h2>{error&&<p role="alert" className="form-error">{error}</p>}
 <form onSubmit={save}>
 <input key="name" aria-label="name" placeholder="name" type="text" min="0" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required/>
<input key="email" aria-label="email" placeholder="email" type="email" min="0" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
<input key="phone" aria-label="phone" placeholder="phone" type="text" min="0" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} />
<input key="address" aria-label="address" placeholder="address" type="text" min="0" value={form.address} onChange={e=>setForm({...form,address:e.target.value})} />
<select key="status" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option value="Active">Active</option><option value="Inactive">Inactive</option></select>
 <button type="submit" disabled={busy}>{busy?'Saving...':editing?'Update':'Add'} Supplier</button>
 {editing&&<button type="button" className="secondary" onClick={()=>{setEditing(null);setForm(initial)}}>Cancel</button>}
 </form></section>
 <section className="card"><h2>Records ({items.length})</h2><input placeholder="Search records" value={search} onChange={e=>setSearch(e.target.value)}/><div className="table-wrap"><table><thead><tr><th>name</th><th>email</th><th>phone</th><th>address</th><th>status</th><th>Actions</th></tr></thead><tbody>{visible.map(item=><tr key={item._id}><td>{item.name}</td><td>{item.email}</td><td>{item.phone}</td><td>{item.address}</td><td>{item.status}</td><td className="actions-cell"><button className="edit-button" onClick={()=>startEdit(item)}>Edit</button><button className="delete-button" onClick={()=>remove(item._id)}>Delete</button></td></tr>)}{visible.length===0&&<tr><td colSpan={6}>No records yet</td></tr>}</tbody></table></div></section></div>;
}
