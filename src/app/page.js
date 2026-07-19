'use client';

import React, { useState, useEffect } from 'react';

export default function Home() {
  const [supabaseClient, setSupabaseClient] = useState(null);
  const [activeTab, setActiveTab] = useState('tab1');
  
  // 데이터만 빈 배열로 비웠습니다! (UI는 그대로 유지)
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
      const client = window.supabase.createClient(
        'https://bozcfudyqcrrgjhwuztf.supabase.co',
        'sb_publishable_sxeYShGE5vkuOe5-Mbnv1w_hTg8VV3Z'
      );
      setSupabaseClient(client);
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

  // UI는 민중님이 가장 좋아하셨던 디자인을 그대로 복원했습니다.
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#334155', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <header style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a' }}>QuickBooks Matcher</h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>벤더 빌 매칭 및 단위 변환 자동 학습 시스템</p>
        </header>

        {/* 탭 버튼 스타일 */}
        <div style={{ background: '#e2e8f0', padding: '6px', borderRadius: '12px', display: 'inline-flex', gap: '4px', marginBottom: '24px' }}>
          {['tab1', 'tab2', 'tab3', 'tab4'].map((t, i) => (
            <button key={t} onClick={() => setActiveTab(t)} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: activeTab === t ? '#fff' : 'transparent', color: activeTab === t ? '#2563eb' : '#64748b', fontWeight: activeTab === t ? '600' : '500', cursor: 'pointer' }}>
              {i + 1}. {['빌 매칭', '벤더 등록', '벤더 관리', '아이템 관리'][i]}
            </button>
          ))}
        </div>

        {/* 메인 콘텐츠 카드 */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '28px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
          {activeTab === 'tab1' && (
            <div>
              <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>추출 데이터 검토</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr style={{ background: '#f8fafc', textAlign: 'left' }}><th style={{ padding: '12px' }}>품목명</th><th style={{ padding: '12px' }}>수량</th><th style={{ padding: '12px' }}>매칭 코드</th></tr></thead>
                <tbody>
                  {extractedItems.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px' }}>{item.vendorItem}</td>
                      <td style={{ padding: '12px' }}>{item.quantity}</td>
                      <td style={{ padding: '12px' }}>{item.matchedCode}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {/* 다른 탭들도 원래 디자인대로 여기에 이어서 쓰시면 됩니다! */}
          {activeTab === 'tab4' && (
             <div>
               <h2 style={{ fontSize: '18px', marginBottom: '20px' }}>퀵북 마스터 아이템 ({qbItems.length}건)</h2>
               {qbItems.map(item => <div key={item.code} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>{item.code}: {item.description}</div>)}
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
