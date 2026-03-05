import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { dbOperations } from '../../../database/schema';
import './AdminModules.css';

const BridgeManager = () => {
    const [subTab, setSubTab] = useState('partners');
    const [items, setItems] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({});
    const [editingId, setEditingId] = useState(null);
    const fileInputRef = useRef(null);

    // Career Criteria State
    const [requirements, setRequirements] = useState(['']);
    const [tags, setTags] = useState(['']);

    const loadItems = useCallback(async () => {
        let data = [];
        if (subTab === 'jobs') data = await dbOperations.getAll('jobs');
        if (subTab === 'partners') data = await dbOperations.getAll('partners');
        if (subTab === 'certificates') data = await dbOperations.getAll('certificates');
        if (subTab === 'pass_codes') data = await dbOperations.getAll('pass_codes');
        setItems(data || []);
    }, [subTab]);

    useEffect(() => {
        loadItems();
    }, [loadItems]);

    const resetForm = () => {
        setFormData({});
        setRequirements(['']);
        setTags(['']);
        setEditingId(null);
        setShowForm(false);
    };

    const handleEdit = (item) => {
        setFormData(item);
        setEditingId(item.id);

        if (subTab === 'partners' && item.careerCriteria) {
            setRequirements(item.careerCriteria.requirements || ['']);
            setTags(item.tags || ['']);
        }

        setShowForm(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const storeName = subTab;

        let dataToSave = { ...formData };

        // Build career criteria for partners
        if (subTab === 'partners') {
            dataToSave.tags = tags.filter(t => t.trim());
            dataToSave.careerCriteria = {
                title: formData.careerTitle || "Aradığımız Tasarımcı Kriterleri",
                requirements: requirements.filter(r => r.trim()),
                portfolio: formData.portfolio || "",
                tools: formData.tools || ""
            };
            dataToSave.isLocalPartner = formData.isLocalPartner === true || formData.isLocalPartner === 'true';
            dataToSave.openJobs = parseInt(formData.openJobs) || 0;
        }

        if (editingId) {
            await dbOperations.update(storeName, editingId, dataToSave);
        } else {
            await dbOperations.add(storeName, { ...dataToSave, createdAt: new Date().toISOString() });
        }

        resetForm();
        loadItems();
    };

    const handleDelete = async (id) => {
        if (confirm('Delete this item?')) {
            await dbOperations.delete(subTab, id);
            loadItems();
        }
    };

    const handleExcelUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (evt) => {
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

            // Skip header row and map data
            const importedCodes = data.slice(1).map(row => ({
                order: row[0],
                number: String(row[1]),
                owner: row[2],
                status: String(row[3]).toLowerCase() === 'kullanıldı' ? 'used' : 'active',
                function: row[4],
                createdAt: new Date().toISOString()
            })).filter(item => item.number && item.number !== 'undefined');

            for (const codeItem of importedCodes) {
                try {
                    await dbOperations.add('pass_codes', codeItem);
                } catch (err) {
                    console.warn(`Could not add code ${codeItem.number}:`, err);
                }
            }

            alert(`${importedCodes.length} pass codes imported successfully!`);
            loadItems();
        };
        reader.readAsBinaryString(file);
    };

    const addRequirement = () => setRequirements([...requirements, '']);
    const removeRequirement = (idx) => setRequirements(requirements.filter((_, i) => i !== idx));
    const updateRequirement = (idx, value) => {
        const newReqs = [...requirements];
        newReqs[idx] = value;
        setRequirements(newReqs);
    };

    const addTag = () => setTags([...tags, '']);
    const removeTag = (idx) => setTags(tags.filter((_, i) => i !== idx));
    const updateTag = (idx, value) => {
        const newTags = [...tags];
        newTags[idx] = value;
        setTags(newTags);
    };

    return (
        <div className="bridge-manager">
            <h2 className="module-title">Bridge Management</h2>

            <div className="sub-tabs">
                <button className={`sub-tab ${subTab === 'partners' ? 'active' : ''}`} onClick={() => setSubTab('partners')}>Partners</button>
                <button className={`sub-tab ${subTab === 'jobs' ? 'active' : ''}`} onClick={() => setSubTab('jobs')}>Jobs</button>
                <button className={`sub-tab ${subTab === 'certificates' ? 'active' : ''}`} onClick={() => setSubTab('certificates')}>Certificates</button>
                <button className={`sub-tab ${subTab === 'pass_codes' ? 'active' : ''}`} onClick={() => setSubTab('pass_codes')}>Pass Codes</button>
            </div>

            <div className="actions-bar" style={{ display: 'flex', gap: '12px' }}>
                <button className="btn-admin primary small" onClick={() => setShowForm(true)}>+ Add New {subTab === 'pass_codes' ? 'Pass Code' : subTab.slice(0, -1)}</button>

                {subTab === 'pass_codes' && (
                    <>
                        <input
                            type="file"
                            accept=".xlsx, .xls"
                            style={{ display: 'none' }}
                            ref={fileInputRef}
                            onChange={handleExcelUpload}
                        />
                        <button className="btn-admin secondary small" onClick={() => fileInputRef.current.click()}>📤 Import Excel</button>
                    </>
                )}
            </div>

            {showForm && (
                <div className="admin-modal">
                    <form onSubmit={handleSave} className="admin-form">
                        <h3>{editingId ? 'Edit' : 'Add'} {subTab === 'pass_codes' ? 'Pass Code' : subTab.slice(0, -1)}</h3>

                        {subTab === 'partners' && (
                            <>
                                <input placeholder="Company Name *" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                                <input placeholder="Domain (e.g., dreamgames.com)" value={formData.domain || ''} onChange={e => setFormData({ ...formData, domain: e.target.value })} />
                                <input placeholder="Logo URL" value={formData.logo || ''} onChange={e => setFormData({ ...formData, logo: e.target.value })} />
                                <input placeholder="City" value={formData.city || ''} onChange={e => setFormData({ ...formData, city: e.target.value })} />

                                <select value={formData.category || ''} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                    <option value="">Select Category</option>
                                    <option value="PC/Console">PC/Console</option>
                                    <option value="Mobile Casual">Mobile Casual</option>
                                    <option value="Hypercasual">Hypercasual</option>
                                </select>

                                <input type="number" placeholder="Open Jobs" value={formData.openJobs || 0} onChange={e => setFormData({ ...formData, openJobs: e.target.value })} />

                                <label>
                                    <input type="checkbox" checked={formData.isLocalPartner || false} onChange={e => setFormData({ ...formData, isLocalPartner: e.target.checked })} />
                                    Local Partner (Turkey-based)
                                </label>

                                <textarea placeholder="Description" value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} rows="3" />

                                <h4>Tags</h4>
                                {tags.map((tag, idx) => (
                                    <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                        <input placeholder="Tag" value={tag} onChange={e => updateTag(idx, e.target.value)} />
                                        <button type="button" onClick={() => removeTag(idx)} className="btn-admin secondary small">Remove</button>
                                    </div>
                                ))}
                                <button type="button" onClick={addTag} className="btn-admin secondary small">+ Add Tag</button>

                                <h4>Career Criteria</h4>
                                <input placeholder="Criteria Title" value={formData.careerTitle || ''} onChange={e => setFormData({ ...formData, careerTitle: e.target.value })} />

                                <label>Requirements:</label>
                                {requirements.map((req, idx) => (
                                    <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                        <input placeholder="Requirement" value={req} onChange={e => updateRequirement(idx, e.target.value)} />
                                        <button type="button" onClick={() => removeRequirement(idx)} className="btn-admin secondary small">Remove</button>
                                    </div>
                                ))}
                                <button type="button" onClick={addRequirement} className="btn-admin secondary small">+ Add Requirement</button>

                                <textarea placeholder="Portfolio Expectations" value={formData.portfolio || ''} onChange={e => setFormData({ ...formData, portfolio: e.target.value })} rows="2" />
                                <textarea placeholder="Tools & Technologies" value={formData.tools || ''} onChange={e => setFormData({ ...formData, tools: e.target.value })} rows="2" />
                            </>
                        )}

                        {subTab === 'jobs' && (
                            <>
                                <input placeholder="Company Name" value={formData.company || ''} onChange={e => setFormData({ ...formData, company: e.target.value })} required />
                                <input placeholder="Job Title" value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                                <input placeholder="Location" value={formData.location || ''} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                                <select value={formData.type || 'Full-time'} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                    <option value="Full-time">Full-time</option>
                                    <option value="Remote">Remote</option>
                                    <option value="Internship">Internship</option>
                                </select>
                            </>
                        )}

                        {subTab === 'certificates' && (
                            <>
                                <input placeholder="User ID" type="number" value={formData.userId || ''} onChange={e => setFormData({ ...formData, userId: parseInt(e.target.value) })} required />
                                <input placeholder="Certificate Code (Unique)" value={formData.code || ''} onChange={e => setFormData({ ...formData, code: e.target.value })} required />
                                <input placeholder="Program Name" value={formData.program || ''} onChange={e => setFormData({ ...formData, program: e.target.value })} />
                            </>
                        )}

                        {subTab === 'pass_codes' && (
                            <>
                                <input placeholder="Pass Code Number *" value={formData.number || ''} onChange={e => setFormData({ ...formData, number: e.target.value })} required />
                                <input placeholder="Pass Code Owner" value={formData.owner || ''} onChange={e => setFormData({ ...formData, owner: e.target.value })} />
                                <select value={formData.status || 'active'} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                    <option value="active">Aktif</option>
                                    <option value="used">Kullanıldı</option>
                                </select>
                                <textarea placeholder="Pass Code Function (e.g., %20 Discount)" value={formData.function || ''} onChange={e => setFormData({ ...formData, function: e.target.value })} rows="2" />
                            </>
                        )}

                        <div className="form-actions">
                            <button type="submit" className="btn-admin primary">Save</button>
                            <button type="button" onClick={resetForm} className="btn-admin secondary">Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="data-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>{subTab === 'pass_codes' ? 'Order' : 'ID'}</th>
                            {subTab === 'partners' && <><th>Name</th><th>Category</th><th>City</th><th>Jobs</th></>}
                            {subTab === 'jobs' && <><th>Company</th><th>Title</th><th>Type</th></>}
                            {subTab === 'certificates' && <><th>Code</th><th>User ID</th><th>Program</th></>}
                            {subTab === 'pass_codes' && <><th>Pass Code</th><th>Owner</th><th>Status</th><th>Function</th></>}
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(item => (
                            <tr key={item.id}>
                                <td>{subTab === 'pass_codes' ? (item.order || item.id) : item.id}</td>
                                {subTab === 'partners' && <><td>{item.name}</td><td>{item.category}</td><td>{item.city}</td><td>{item.openJobs}</td></>}
                                {subTab === 'jobs' && <><td>{item.company}</td><td>{item.title}</td><td>{item.type}</td></>}
                                {subTab === 'certificates' && <><td>{item.code}</td><td>{item.userId}</td><td>{item.program}</td></>}
                                {subTab === 'pass_codes' && (
                                    <>
                                        <td><code>{item.number}</code></td>
                                        <td>{item.owner}</td>
                                        <td>
                                            <span className={`badge ${item.status === 'active' ? 'success' : 'neutral'}`}>
                                                {item.status === 'active' ? 'Aktif' : 'Kullanıldı'}
                                            </span>
                                        </td>
                                        <td>{item.function}</td>
                                    </>
                                )}
                                <td>
                                    <button onClick={() => handleEdit(item)} className="btn-icon">✏️</button>
                                    <button onClick={() => handleDelete(item.id)} className="btn-icon">🗑️</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BridgeManager;
