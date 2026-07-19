'use client';

import React, { useState, useEffect } from 'react';

export default function Home() {
  const [supabaseClient, setSupabaseClient] = useState(null);
  const [activeTab, setActiveTab] = useState('tab1');
  
  const [qbItems, setQbItems] = useState([
    { code: 'QB001', description: '고추장 10kg', unit: 'BOX' },
    { code: 'QB002', description: '참기름 1L', unit: 'BTL' },
    { code: 'QB003', description: '냉동 낙지 1kg', unit: 'PK' },
    { code: 'QB004', description: '국산 쌀 20kg', unit: 'BAG' },
    { code: 'QB005', description: '식용유 18L', unit: 'CAN' }
  ]);

  const [vendors, setVendors] = useState([
    { id: 1, name: '아산유통', alias: '아산식품, (주)아산' }
  ]);

  const [extractedItems, setExtractedItems] = useState([
    { id: 1, vendorItem: '아산유통고추장 대 용량', quantity: 2, unit: 'BOX', matchedCode: 'QB001', multiplier: 1, status: '학습 완료' },
    { id: 2, vendorItem: '아산유통참기름 오일', quantity: 12, unit: 'EA', matchedCode: '', multiplier: 1, status: '매칭 대기' }
  ]);

  const [newVendorName, setNewVendorName] = useState('');
  const [newVendorAlias, setNewVendorAlias] = useState('');
  const [newQbCode, setNewQbCode] = useState('');
  const [newQbDesc, setNewQbDesc] = useState('');
  const [newQbUnit, setNewQbUnit] = useState('BOX');

  // 삭제 공통 함수
  const handleDelete = async (table, id, idField = 'id') => {
    if (!supabaseClient) return;
    await supabaseClient.from(table).delete().eq(idField, id);
    if (table === 'vendors') setVendors(vendors.filter(v => v.id !== id));
    if (table === 'qb_items') setQbItems(qbItems.filter(item => item.code !== id));
    alert("삭제되었습니다.");
  };

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
      if (qb && qb.length > 0) setQbItems(qb);
      if (v && v.length > 0) setVendors(v);
      if (ext && ext.length > 0) setExtractedItems(ext);
    }
    loadDatabaseData();
  }, [supabaseClient]);

  const handleFileUpload = (e) => { alert("🧾 벤더 빌 파일이 선택되었습니다!"); };
  const handleExcelUpload = (e) => { alert("📊 엑셀 파일이 업로드되었습니다!"); };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#334155', fontFamily: 'sans-serif', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <style>{`
          .app-card { background: white; border-radius: 16px; border: 1px solid #f1f5f9; padding: 28px; }
          .tab-btn { padding: 10px 20px; border: none; border-radius: 8px; background: transparent; cursor: pointer; }
          .tab-btn.active { background: white; color: #2563eb; font-weight: 600; }
          .table-style { width: 100%; border-collapse: collapse; }
          .table-style th, .table-style td { padding: 12px; border-bottom: 1px solid #f1f5f9; text-align: left; }
          .del-btn { color: #ef4444; font-size: 12px; cursor: pointer; border: none; background: none; }
        `}</style>

        <header style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '800' }}>QuickBooks Matcher</h1>
        </header>

        <div style={{ background: '#e2e8f0', padding: '6px', borderRadius: '12px', display: 'inline-flex', gap: '4px', marginBottom: '24px' }}>
          {['tab1', 'tab2', 'tab3', 'tab4'].map((t, i) => (
            <button key={t} onClick={() => setActiveTab(t)} className={`tab-btn ${activeTab === t ? 'active' : ''}`}>
              {i + 1}. {['빌 매칭', '벤더 등록', '벤더 관리', '아이템 관리'][i]}
            </button>
          ))}
        </div>

        <div className="app-card">
          {activeTab === 'tab3' && (
            <div>
              <h2 style={{ marginBottom: '16px' }}>벤더 명칭 관리</h2>
              <table className="table-style">
                <thead><tr><th>정식 벤더명</th><th>별칭</th><th>작업</th></tr></thead>
                <tbody>
                  {vendors.map((v) => (
                    <tr key={v.id}>
                      <td>{v.name}</td>
                      <td>{v.alias}</td>
                      <td><button className="del-btn" onClick={() => handleDelete('vendors', v.id)}>삭제</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'tab4' && (
            <div>
              <h3>퀵북 마스터 아이템 목록</h3>
              <table className="table-style">
                <thead><tr><th>코드</th><th>설명</th><th>단위</th><th>작업</th></tr></thead>
                <tbody>
                  {qbItems.map((qb, index) => (
                    <tr key={index}>
                      <td>{qb.code}</td>
                      <td>{qb.description}</td>
                      <td>{qb.unit}</td>
                      <td><button className="del-btn" onClick={() => handleDelete('qb_items', qb.code, 'code')}>삭제</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* 나머지 탭 로직은 이전과 동일하게 유지 */}
        </div>
      </div>
    </div>
  );
}
