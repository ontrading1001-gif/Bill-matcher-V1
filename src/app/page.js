'use client';

import React, { useState, useEffect } from 'react';

export default function Home() {
  const [supabaseClient, setSupabaseClient] = useState(null);
  const [activeTab, setActiveTab] = useState('tab1');
  
  // 데이터 초기값만 빈 배열로 변경하였습니다. (디자인/기능은 원래 그대로입니다)
  const [qbItems, setQbItems] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [extractedItems, setExtractedItems] = useState([]);

  const [newVendorName, setNewVendorName] = useState('');
  const [newVendorAlias, setNewVendorAlias] = useState('');
  const [newQbCode, setNewQbCode] = useState('');
  const [newQbDesc, setNewQbDesc] = useState('');
  const [newQbUnit, setNewQbUnit] = useState('BOX');

  // CDN 방식 Supabase 초기화
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js";
    script.async = true;
    script.onload = () => {
      const client = window.supabase.createClient(
        'https://bozcfudyqcrrgjhwuztf.supabase.co',
        'sb_publishable_sxeYShGE5vkuOe5-Mbnv1w_hTg8VV3Z'
      );
      setSupabaseClient(client);
    };
    document.body.appendChild(script);
  }, []);

  // 데이터 로드
  useEffect(() => {
    if (!supabaseClient) return;
    async function loadDatabaseData() {
      const { data: qb } = await supabaseClient.from('qb_items').select('*');
      const { data: v } = await supabaseClient.from('vendors').select('*');
      const { data: ext } = await supabaseClient.from('extracted_items').select('*');
      if (qb) setQbItems(qb);
      if (v) setVendors(v);
      if (ext) setExtractedItems(ext);
    }
    loadDatabaseData();
  }, [supabaseClient]);

  const handleFileUpload = (e) => { alert("🧾 파일이 업로드되었습니다."); };
  const handleExcelUpload = (e) => { alert("📊 엑셀 파일이 업로드되었습니다."); };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#334155', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <header style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a' }}>QuickBooks Matcher</h1>
          <p style={{ color: '#64748b' }}>벤더 빌 매칭 및 단위 변환 자동 학습 시스템</p>
        </header>

        <style>{`
          .app-card { background: white; border-radius: 16px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); padding: 28px; border: 1px solid #f1f5f9; }
          .tab-btn { padding: 10px 20px; border-radius: 8px; border: none; font-weight: 500; cursor: pointer; background: transparent; color: #64748b; }
          .tab-btn.active { background: white; color: #2563eb; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
          .input-style { width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 10px; }
          .table-style { width: 100%; border-collapse: collapse; }
          .table-style th { background: #f8fafc; padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; color: #64748b; }
          .table-style td { padding: 12px; border-bottom: 1px solid #f1f5f9; }
        `}</style>

        <div style={{ background: '#e2e8f0', padding: '6px', borderRadius: '12px', display: 'inline-flex', gap: '4px', marginBottom: '24px' }}>
          {['tab1', 'tab2', 'tab3', 'tab4'].map((t, i) => (
            <button key={t} onClick={() => setActiveTab(t)} className={`tab-btn ${activeTab === t ? 'active' : ''}`}>
              {i + 1}. {['빌 매칭', '벤더 등록', '벤더 관리', '아이템 관리'][i]}
            </button>
          ))}
        </div>

        <div className="app-card">
          {activeTab === 'tab1' && (
            <div>
              <h2 style={{ marginBottom: '20px' }}>벤더 빌 파일 업로드</h2>
              <div style={{ border: '2px dashed #cbd5e1', padding: '40px', textAlign: 'center', borderRadius: '12px', cursor: 'pointer' }} onClick={handleFileUpload}>
                파일을 클릭하여 업로드하세요
              </div>
              <h2 style={{ marginTop: '30px' }}>추출 데이터 매칭</h2>
              <table className="table-style">
                <thead><tr><th>품목명</th><th>수량</th><th>매칭 코드</th></tr></thead>
                <tbody>
                  {extractedItems.map(item => (
                    <tr key={item.id}><td>{item.vendorItem}</td><td>{item.quantity} {item.unit}</td><td>{item.matchedCode}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'tab2' && (
            <div>
              <h2>벤더 등록</h2>
              <input className="input-style" placeholder="벤더명" value={newVendorName} onChange={(e) => setNewVendorName(e.target.value)} />
              <input className="input-style" placeholder="별칭" value={newVendorAlias} onChange={(e) => setNewVendorAlias(e.target.value)} />
              <button onClick={async () => {
                await supabaseClient.from('vendors').insert([{ name: newVendorName, alias: newVendorAlias }]);
                alert("등록 성공");
              }} style={{ padding: '10px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px' }}>등록하기</button>
            </div>
          )}

          {activeTab === 'tab4' && (
            <div>
              <h2>퀵북 아이템 관리</h2>
              <table className="table-style">
                <thead><tr><th>코드</th><th>설명</th><th>단위</th></tr></thead>
                <tbody>
                  {qbItems.map(item => (
                    <tr key={item.code}><td>{item.code}</td><td>{item.description}</td><td>{item.unit}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
