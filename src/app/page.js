'use client';

import React, { useState, useEffect } from 'react';

export default function Home() {
  const [supabaseClient, setSupabaseClient] = useState(null);
  const [activeTab, setActiveTab] = useState('tab1');
  
  // 데이터 초기값을 빈 배열로 설정하여 예시 데이터를 제거했습니다.
  const [qbItems, setQbItems] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [extractedItems, setExtractedItems] = useState([]);

  const [newVendorName, setNewVendorName] = useState('');
  const [newVendorAlias, setNewVendorAlias] = useState('');
  const [newQbCode, setNewQbCode] = useState('');
  const [newQbDesc, setNewQbDesc] = useState('');
  const [newQbUnit, setNewQbUnit] = useState('BOX');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js";
    script.async = true;
    script.onload = () => {
      if (window.supabase) {
        const client = window.supabase.createClient(
          'https://bozcfudyqcrrgjhwuztf.supabase.co',
          'sb_publishable_sxeYShGE5vkuOe5-Mbnv1w_hTg8VV3Z'
        );
        setSupabaseClient(client);
      }
    };
    document.body.appendChild(script);
  }, []);

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

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <header style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '800' }}>QuickBooks Matcher</h1>
        </header>

        <div style={{ background: '#e2e8f0', padding: '6px', borderRadius: '12px', display: 'inline-flex', gap: '4px', marginBottom: '24px' }}>
          {['tab1', 'tab2', 'tab3', 'tab4'].map((tab, idx) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: activeTab === tab ? '#fff' : 'transparent', cursor: 'pointer' }}>
              {idx + 1}. {['빌 매칭', '벤더 등록', '벤더 관리', '아이템 관리'][idx]}
            </button>
          ))}
        </div>

        <div style={{ background: 'white', padding: '28px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
          {activeTab === 'tab1' && (
            <div>
              <h3>추출 데이터 매칭</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr style={{ background: '#f8fafc' }}><th>품목명</th><th>수량</th><th>매칭 코드</th><th>상태</th></tr></thead>
                <tbody>
                  {extractedItems.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td>{item.vendorItem}</td>
                      <td>{item.quantity} {item.unit}</td>
                      <td>{item.matchedCode}</td>
                      <td>{item.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'tab2' && (
            <div>
              <h3>벤더 등록</h3>
              <input placeholder="벤더명" value={newVendorName} onChange={(e) => setNewVendorName(e.target.value)} style={{ display: 'block', marginBottom: '10px', padding: '8px' }} />
              <button onClick={async () => {
                await supabaseClient.from('vendors').insert([{ name: newVendorName, alias: newVendorAlias }]);
                alert("등록 완료");
              }}>등록</button>
            </div>
          )}

          {activeTab === 'tab4' && (
            <div>
              <h3>퀵북 아이템</h3>
              {qbItems.map(item => (
                <div key={item.code} style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                  {item.code} - {item.description} ({item.unit})
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
