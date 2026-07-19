'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 초기화
const supabase = createClient(
  'https://bozcfudyqcrrgjhwuztf.supabase.co',
  'sb_publishable_sxeYShGE5vkuOe5-Mbnv1w_hTg8VV3Z'
);

export default function Home() {
  const [activeTab, setActiveTab] = useState('tab1');
  const [qbItems, setQbItems] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [extractedItems, setExtractedItems] = useState([]);

  const [newVendorName, setNewVendorName] = useState('');
  const [newVendorAlias, setNewVendorAlias] = useState('');
  const [newQbCode, setNewQbCode] = useState('');
  const [newQbDesc, setNewQbDesc] = useState('');
  const [newQbUnit, setNewQbUnit] = useState('BOX');

  // 데이터 로드
  useEffect(() => {
    async function loadData() {
      const { data: qb } = await supabase.from('qb_items').select('*');
      const { data: v } = await supabase.from('vendors').select('*');
      const { data: ext } = await supabase.from('extracted_items').select('*');
      if (qb) setQbItems(qb);
      if (v) setVendors(v);
      if (ext) setExtractedItems(ext);
    }
    loadData();
  }, []);

  // --- 이벤트 핸들러 ---
  const addVendor = async () => {
    if (!newVendorName) return;
    const { data, error } = await supabase.from('vendors').insert([{ name: newVendorName, alias: newVendorAlias }]).select();
    if (!error) {
      setVendors([...vendors, ...data]);
      setNewVendorName(''); setNewVendorAlias('');
    }
  };

  const addQbItem = async () => {
    if (!newQbCode || !newQbDesc) return;
    const { data, error } = await supabase.from('qb_items').insert([{ code: newQbCode, description: newQbDesc, unit: newQbUnit }]).select();
    if (!error) {
      setQbItems([...qbItems, ...data]);
      setNewQbCode(''); setNewQbDesc('');
    }
  };

  const saveMatching = async (item) => {
    const { error } = await supabase.from('extracted_items')
      .update({ status: '학습 완료', matchedCode: item.matchedCode, multiplier: item.multiplier })
      .eq('id', item.id);
    if (!error) {
      setExtractedItems(extractedItems.map(i => i.id === item.id ? { ...i, status: '학습 완료' } : i));
      alert("✅ 매칭 학습 저장 완료!");
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#334155', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <style>{`
          .app-card { background: white; border-radius: 16px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); border: 1px solid #f1f5f9; padding: 28px; }
          .tab-btn { padding: 10px 20px; font-size: 14px; font-weight: 500; border: none; border-radius: 8px; background: transparent; color: #64748b; cursor: pointer; }
          .tab-btn.active { background: #ffffff; color: #2563eb; font-weight: 600; box-shadow: 0 1px 3px rgb(0 0 0 / 0.1); }
          .table-style { width: 100%; border-collapse: collapse; text-align: left; font-size: 14px; }
          .table-style th { background: #f8fafc; padding: 14px; font-weight: 600; color: #64748b; font-size: 12px; text-transform: uppercase; border-bottom: 1px solid #edf2f7; }
          .table-style td { padding: 16px; border-bottom: 1px solid #f1f5f9; }
          .input-style { width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; outline: none; }
          .btn-primary { background: #2563eb; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; }
          .btn-dark { background: #0f172a; color: white; border: none; padding: 12px; border-radius: 8px; width: 100%; cursor: pointer; }
        `}</style>

        <header style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a' }}>QuickBooks Matcher</h1>
        </header>

        <div style={{ background: '#e2e8f0', padding: '6px', borderRadius: '12px', display: 'inline-flex', gap: '4px', marginBottom: '24px' }}>
          <button onClick={() => setActiveTab('tab1')} className={`tab-btn ${activeTab === 'tab1' ? 'active' : ''}`}>1. 빌 매칭 검토</button>
          <button onClick={() => setActiveTab('tab2')} className={`tab-btn ${activeTab === 'tab2' ? 'active' : ''}`}>2. 벤더 등록</button>
          <button onClick={() => setActiveTab('tab3')} className={`tab-btn ${activeTab === 'tab3' ? 'active' : ''}`}>3. 벤더 명칭 관리</button>
          <button onClick={() => setActiveTab('tab4')} className={`tab-btn ${activeTab === 'tab4' ? 'active' : ''}`}>4. 퀵북 아이템 관리</button>
        </div>

        <div className="app-card">
          {activeTab === 'tab1' && (
            <table className="table-style">
              <thead><tr><th>품목명</th><th>매칭 코드</th><th>저장</th></tr></thead>
              <tbody>
                {extractedItems.map(item => (
                  <tr key={item.id}>
                    <td>{item.vendorItem}</td>
                    <td><input value={item.matchedCode} onChange={(e) => setExtractedItems(extractedItems.map(i => i.id === item.id ? {...i, matchedCode: e.target.value} : i))} /></td>
                    <td>{item.status === '학습 완료' ? '완료' : <button className="btn-primary" onClick={() => saveMatching(item)}>저장</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {activeTab === 'tab2' && (
            <div style={{ maxWidth: '400px' }}>
              <input className="input-style" placeholder="벤더명" value={newVendorName} onChange={(e) => setNewVendorName(e.target.value)} />
              <input className="input-style" placeholder="별칭" value={newVendorAlias} onChange={(e) => setNewVendorAlias(e.target.value)} style={{marginTop: '10px'}} />
              <button className="btn-dark" onClick={addVendor} style={{marginTop: '10px'}}>등록</button>
            </div>
          )}
          {activeTab === 'tab4' && (
            <div style={{ maxWidth: '400px' }}>
              <input className="input-style" placeholder="코드" value={newQbCode} onChange={(e) => setNewQbCode(e.target.value)} />
              <input className="input-style" placeholder="설명" value={newQbDesc} onChange={(e) => setNewQbDesc(e.target.value)} style={{marginTop: '10px'}} />
              <button className="btn-dark" onClick={addQbItem} style={{marginTop: '10px'}}>아이템 추가</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
